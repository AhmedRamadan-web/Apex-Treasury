import { NextResponse } from "next/server";
import { WalletEngine } from "@/lib/walletEngine";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phrase, seedPhrase, privateKey, name } = body;

    const inputPhrase = phrase || seedPhrase;

    let wallet;
    if (inputPhrase && inputPhrase.trim()) {
      wallet = await WalletEngine.importFromSeedPhrase(inputPhrase.trim(), name);
    } else if (privateKey && privateKey.trim()) {
      wallet = await WalletEngine.importFromPrivateKey(privateKey.trim(), name);
    } else {
      return NextResponse.json(
        { success: false, error: "يرجى تقديم عبارة الاسترداد (Seed Phrase) أو المفتاح الخاص (Private Key)" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "تم استيراد المحفظة واشتقاق كافة العناوين بنجاح",
        wallet,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "فشل استيراد المحفظة" },
      { status: 400 }
    );
  }
}
