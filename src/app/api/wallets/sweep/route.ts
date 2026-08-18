import { NextResponse } from "next/server";
import { SweepEngine } from "@/lib/sweepEngine";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const target = body.destinationAddress || body.targetAddress || body.to;

    if (!target) {
      return NextResponse.json(
        { success: false, error: "عنوان المحفظة الهدف (المستلم) مطلوب" },
        { status: 400 }
      );
    }

    const result = await SweepEngine.executeSweep({
      sourceWalletIds: body.sourceWalletIds || body.sourceWallets,
      sourceAddresses: body.sourceAddresses,
      destinationAddress: target,
      asset: body.asset || "USDC",
      network: body.network,
      amount: body.amount,
      isMax: body.isMax ?? true,
      gasSpeed: body.speed || body.gasSpeed || "fast",
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "فشلت عملية تجميع الأرصدة" },
      { status: 500 }
    );
  }
}
