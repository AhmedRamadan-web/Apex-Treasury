import { NextResponse } from "next/server";
import { WalletEngine } from "@/lib/walletEngine";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const count = parseInt(body.count || "5", 10);
    const safeCount = isNaN(count) || count < 1 ? 5 : Math.min(count, 100);

    const wallets = await WalletEngine.createMultipleWallets(safeCount);
    return NextResponse.json(
      {
        success: true,
        count: wallets.length,
        message: `تم بنجاح توليد ${wallets.length} محفظة جديدة مع اشتقاق كافة الشبكات`,
        wallets,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "فشل في إنشاء دفعة المحافظ" },
      { status: 500 }
    );
  }
}
