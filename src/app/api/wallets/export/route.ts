import { NextResponse } from "next/server";
import { WalletEngine } from "@/lib/walletEngine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "txt";
    const wallets = await WalletEngine.getWallets();

    if (format === "json") {
      return new NextResponse(JSON.stringify(wallets, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="tadawul_wallets.json"',
        },
      });
    }

    if (format === "csv") {
      const csvData = WalletEngine.exportWalletsToCSV(wallets);
      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="tadawul_wallets.csv"',
        },
      });
    }

    // Default TXT export
    const textData = WalletEngine.exportWalletsToText(wallets);
    return new NextResponse(textData, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="tadawul_wallets.txt"',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to export wallets" },
      { status: 500 }
    );
  }
}
