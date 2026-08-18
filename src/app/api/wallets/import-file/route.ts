import { NextResponse } from "next/server";
import { WalletEngine } from "@/lib/walletEngine";
import { ServerStorage } from "@/lib/serverStorage";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { format, content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "محتوى الملف فارغ أو غير صالح" },
        { status: 400 }
      );
    }

    const imported: any[] = [];
    const errors: string[] = [];

    // ─── FORMAT 1: JSON (full export from this system) ──────────────────────
    if (format === "json") {
      let parsed: any[];
      try {
        parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) throw new Error("ليس مصفوفة");
      } catch {
        return NextResponse.json(
          { success: false, error: "ملف JSON غير صالح - تأكد أنه ملف JSON مُصدَّر من الخزانة" },
          { status: 400 }
        );
      }

      // Each item should have mnemonic or privateKey
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        try {
          if (item.mnemonic && item.mnemonic.trim()) {
            const w = await WalletEngine.importFromSeedPhrase(
              item.mnemonic.trim(),
              item.name || undefined
            );
            imported.push(w);
          } else if (item.privateKey && item.privateKey.trim()) {
            const w = await WalletEngine.importFromPrivateKey(
              item.privateKey.trim(),
              item.name || undefined
            );
            imported.push(w);
          } else {
            errors.push(`السطر ${i + 1}: لا يوجد mnemonic أو privateKey`);
          }
        } catch (e: any) {
          errors.push(`العنصر ${i + 1} (${item.name || "بلا اسم"}): ${e.message}`);
        }
      }
    }

    // ─── FORMAT 2: CSV ───────────────────────────────────────────────────────
    else if (format === "csv") {
      const lines = content.trim().split("\n");
      const header = lines[0].toLowerCase();

      // Detect column indices
      const cols = header.split(",").map((c: string) => c.replace(/"/g, "").trim());
      const seedIdx = cols.findIndex((c: string) => c.includes("seed") || c.includes("mnemonic"));
      const pkIdx = cols.findIndex((c: string) => c.includes("private") || c.includes("key"));
      const nameIdx = cols.findIndex((c: string) => c.includes("name"));

      if (seedIdx === -1 && pkIdx === -1) {
        return NextResponse.json(
          {
            success: false,
            error: "لم يتم العثور على عمود Seed_Phrase أو Private_Key في ملف الـ CSV",
          },
          { status: 400 }
        );
      }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV line (handle quoted fields)
        const cells = line.match(/("([^"]*)"|[^,]*)/g) || [];
        const getCell = (idx: number) =>
          idx >= 0 && idx < cells.length
            ? cells[idx].replace(/^"|"$/g, "").trim()
            : "";

        const name = nameIdx >= 0 ? getCell(nameIdx) : undefined;
        const seed = seedIdx >= 0 ? getCell(seedIdx) : "";
        const pk = pkIdx >= 0 ? getCell(pkIdx) : "";

        try {
          if (seed && seed.trim() && seed.split(" ").length >= 12) {
            const w = await WalletEngine.importFromSeedPhrase(seed.trim(), name || undefined);
            imported.push(w);
          } else if (pk && pk.trim()) {
            const w = await WalletEngine.importFromPrivateKey(pk.trim(), name || undefined);
            imported.push(w);
          } else {
            errors.push(`السطر ${i + 1}: لا يوجد seed phrase أو private key صالح`);
          }
        } catch (e: any) {
          errors.push(`السطر ${i + 1}: ${e.message}`);
        }
      }
    }

    // ─── FORMAT 3: TXT (exported format + plain format) ─────────────────────
    else if (format === "txt") {
      const lines = content.trim().split("\n");
      let walletCounter = 0;

      for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const line = raw.trim();
        if (!line) continue;

        // ── Case A: Lines with Arabic labels (system export format) ──
        // "عبارة الاسترداد (Seed Phrase): word1 word2 ..."
        const seedLabelMatch = line.match(
          /(?:عبارة الاسترداد|Seed Phrase|seed_phrase|mnemonic)\s*[:()\w]*\s*:?\s*([a-z][\w ]+)/i
        );
        // "المفتاح الخاص (Private Key): 0x..."
        const pkLabelMatch = line.match(
          /(?:المفتاح الخاص|Private[_ ]Key|privatekey)\s*[:()\w]*\s*:?\s*(0x[0-9a-fA-F]{64}|[0-9a-fA-F]{64})/i
        );

        if (seedLabelMatch) {
          const seed = seedLabelMatch[1].trim();
          const words = seed.split(/\s+/).filter((w: string) => /^[a-z]+$/i.test(w));
          if (words.length >= 12 && words.length <= 24) {
            walletCounter++;
            try {
              const w = await WalletEngine.importFromSeedPhrase(words.join(" "), `محفظة مستوردة ${walletCounter}`);
              imported.push(w);
            } catch (e: any) {
              errors.push(`السطر ${i + 1} (Seed): ${e.message}`);
            }
          }
          continue;
        }

        if (pkLabelMatch) {
          const pk = pkLabelMatch[1].trim();
          walletCounter++;
          try {
            const w = await WalletEngine.importFromPrivateKey(pk, `محفظة مستوردة ${walletCounter}`);
            imported.push(w);
          } catch (e: any) {
            errors.push(`السطر ${i + 1} (PK): ${e.message}`);
          }
          continue;
        }

        // ── Case B: Skip header/separator lines ──
        if (
          line.startsWith("=") ||
          line.startsWith("-") ||
          line.startsWith("─") ||
          line.startsWith("#") ||
          line.startsWith("•") ||
          line.startsWith("[") ||
          /^[\u0600-\u06FF]/.test(line) // lines starting with Arabic (labels, not seeds)
        ) {
          continue;
        }

        // ── Case C: Plain seed phrase line (12-24 lowercase English words) ──
        const words = line.split(/\s+/);
        const isSeed =
          words.length >= 12 &&
          words.length <= 24 &&
          words.every((w: string) => /^[a-z]+$/i.test(w));

        // ── Case D: Plain private key line ──
        const isPrivateKey = /^(0x)?[0-9a-fA-F]{64}$/.test(line);

        try {
          if (isSeed) {
            walletCounter++;
            const w = await WalletEngine.importFromSeedPhrase(line, `محفظة مستوردة ${walletCounter}`);
            imported.push(w);
          } else if (isPrivateKey) {
            walletCounter++;
            const w = await WalletEngine.importFromPrivateKey(line, `محفظة مستوردة ${walletCounter}`);
            imported.push(w);
          }
          // else: unrecognized line → skip silently
        } catch (e: any) {
          errors.push(`السطر ${i + 1}: ${e.message}`);
        }
      }
    } else {
      return NextResponse.json(
        { success: false, error: "صيغة الملف غير مدعومة. استخدم: json, csv, txt" },
        { status: 400 }
      );
    }

    if (imported.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `فشل استيراد جميع المحافظ. أخطاء: ${errors.slice(0, 3).join(" | ")}`,
        },
        { status: 400 }
      );
    }

    // Save all successfully imported wallets at once
    if (imported.length > 0) {
      await ServerStorage.saveWalletsBatch(imported);
    }

    return NextResponse.json(
      {
        success: true,
        imported: imported.length,
        failed: errors.length,
        errors: errors.slice(0, 10),
        message: `تم استيراد ${imported.length} محفظة بنجاح${errors.length > 0 ? ` (${errors.length} فشلت)` : ""}`,
        wallets: imported,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "فشل استيراد الملف" },
      { status: 500 }
    );
  }
}
