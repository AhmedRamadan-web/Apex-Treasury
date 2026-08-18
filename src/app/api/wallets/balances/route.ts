import { NextResponse } from "next/server";
import { WalletEngine } from "@/lib/walletEngine";
import { LiveMultiChainEngine } from "@/lib/liveMultiChainEngine";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const walletId = body.walletId;

    const wallets = await WalletEngine.getWallets();
    const target = walletId ? wallets.filter((w) => w.id === walletId) : wallets;

    const updated = await Promise.all(
      target.map(async (w) => {
        // Query live ETH balance
        const ethBal = await LiveMultiChainEngine.queryEVMBalance("Ethereum", w.address);

        // Update chain address balances
        const updatedAddresses = await Promise.all(
          w.addresses.map(async (a) => {
            let balStr = "0.00";
            if (a.chain === "Solana") {
              const solBal = await LiveMultiChainEngine.querySolanaBalance(a.address);
              balStr = solBal.formattedBalance;
            } else if (a.chain === "Bitcoin") {
              const btcBal = await LiveMultiChainEngine.queryBitcoinBalance(a.address);
              balStr = btcBal.formattedBalance;
            } else if (a.chain === "Polygon") {
              const polBal = await LiveMultiChainEngine.queryEVMBalance("Polygon", a.address);
              balStr = polBal.formattedBalance;
            } else if (a.chain === "BSC") {
              const bscBal = await LiveMultiChainEngine.queryEVMBalance("BSC", a.address);
              balStr = bscBal.formattedBalance;
            } else {
              balStr = ethBal.formattedBalance;
            }
            return {
              ...a,
              balance: balStr,
            };
          })
        );

        return {
          ...w,
          balance: ethBal.formattedBalance,
          usdValue: ethBal.usdValue,
          addresses: updatedAddresses,
          lastChecked: Date.now(),
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        message: "تم فحص وتحديث الأرصدة الحية من شبكات البلوكتشين بنجاح",
        wallets: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to check balances" },
      { status: 500 }
    );
  }
}
