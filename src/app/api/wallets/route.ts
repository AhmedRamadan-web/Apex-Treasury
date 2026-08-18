import { NextResponse } from "next/server";
import { WalletEngine } from "@/lib/walletEngine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const network = searchParams.get("network");
    const status = searchParams.get("status");

    let wallets = await WalletEngine.getWallets();

    if (search) {
      wallets = wallets.filter(
        (w) =>
          w.name.toLowerCase().includes(search) ||
          w.address.toLowerCase().includes(search) ||
          w.addresses.some((a) => a.address.toLowerCase().includes(search))
      );
    }

    if (network && network !== "جميع الشبكات" && network !== "all") {
      wallets = wallets.filter((w) => w.network === network);
    }

    if (status && status !== "الحالة: الكل" && status !== "all") {
      wallets = wallets.filter((w) => w.status === status);
    }

    return NextResponse.json(
      {
        success: true,
        count: wallets.length,
        wallets,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch wallets" },
      { status: 500 }
    );
  }
}
