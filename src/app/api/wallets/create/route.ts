import { NextResponse } from "next/server";
import { WalletEngine } from "@/lib/walletEngine";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const wallet = await WalletEngine.createWallet(body.name);
    return NextResponse.json(
      {
        success: true,
        message: "تم إنشاء المحفظة واشتقاق عناوين الـ 11 شبكة بنجاح",
        wallet,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "فشل في إنشاء المحفظة" },
      { status: 500 }
    );
  }
}
