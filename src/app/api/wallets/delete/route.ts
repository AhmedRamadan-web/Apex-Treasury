import { NextResponse } from "next/server";
import { WalletEngine } from "@/lib/walletEngine";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const walletId = body.id || body.walletId;

    if (body.deleteAll) {
      await WalletEngine.deleteAllWallets();
      return NextResponse.json(
        { success: true, message: "تم حذف جميع المحافظ بنجاح من الخزانة" },
        { status: 200 }
      );
    }

    if (!walletId) {
      return NextResponse.json(
        { success: false, error: "معرف المحفظة مطلوب للحذف" },
        { status: 400 }
      );
    }

    await WalletEngine.deleteWallet(walletId);

    return NextResponse.json(
      { success: true, message: `تم حذف المحفظة (${walletId}) بنجاح` },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "فشل حذف المحفظة" },
      { status: 500 }
    );
  }
}
