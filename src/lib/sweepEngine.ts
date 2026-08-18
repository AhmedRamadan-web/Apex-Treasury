import { ServerStorage } from "./serverStorage";
import { WalletEngine } from "./walletEngine";
import { GeneratedWalletData, TransferRecord, SweepExecutionResult, SweepSubTransaction } from "@/types/wallet";
import { LiveMultiChainEngine } from "./liveMultiChainEngine";
import { getExplorerTxLink } from "./rpcConfig";
import { ethers } from "ethers";

export interface SweepExecutionRequest {
  sourceWalletIds?: string[];
  sourceAddresses?: string[];
  destinationAddress: string;
  asset: string;
  network?: string;
  amount?: string;
  isMax?: boolean;
  gasSpeed?: "economic" | "balanced" | "fast";
}

export class SweepEngine {
  public static async executeSweep(req: SweepExecutionRequest): Promise<SweepExecutionResult> {
    if (!req.destinationAddress || !req.destinationAddress.trim()) {
      throw new Error("عنوان المحفظة الهدف (المستلم) مطلوب لتنفيذ عملية التجميع.");
    }

    const cleanDest = req.destinationAddress.trim();
    const asset = req.asset || "USDC";
    const network = req.network || "Ethereum";
    const speed = req.gasSpeed || "fast";

    const allWallets = await WalletEngine.getWallets();

    let targetWallets: GeneratedWalletData[] = [];
    if (req.sourceWalletIds && req.sourceWalletIds.length > 0) {
      const idSet = new Set(req.sourceWalletIds);
      targetWallets = allWallets.filter((w) => idSet.has(w.id));
    } else if (req.sourceAddresses && req.sourceAddresses.length > 0) {
      const addrSet = new Set(req.sourceAddresses.map((a) => a.toLowerCase()));
      targetWallets = allWallets.filter((w) => addrSet.has(w.address.toLowerCase()));
    } else {
      targetWallets = allWallets;
    }

    if (targetWallets.length === 0) {
      throw new Error("لم يتم العثور على أي محافظ مصدر لتنفيذ التحويل منها.");
    }

    const operationId = `OP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const subTransactions: SweepSubTransaction[] = [];
    let grossSum = 0;
    let gasSum = 0;

    const baseAmountPerWallet = req.amount
      ? parseFloat(req.amount.replace(/,/g, "")) / targetWallets.length
      : 100;

    for (let i = 0; i < targetWallets.length; i++) {
      const wallet = targetWallets[i];

      try {
        let liveResult;
        if (network === "Solana") {
          const solAddr = wallet.addresses.find((a) => a.chain === "Solana")?.address || wallet.address;
          liveResult = await LiveMultiChainEngine.sendSolanaLive({
            network: "Solana",
            privateKey: wallet.privateKey,
            fromAddress: solAddr,
            toAddress: cleanDest,
            amount: req.isMax ? undefined : baseAmountPerWallet.toString(),
            isMax: req.isMax,
            gasSpeed: speed,
            asset,
          });
        } else {
          liveResult = await LiveMultiChainEngine.sendEVMLive({
            network,
            privateKey: wallet.privateKey,
            fromAddress: wallet.address,
            toAddress: cleanDest,
            amount: req.isMax ? undefined : baseAmountPerWallet.toString(),
            isMax: req.isMax,
            gasSpeed: speed,
            asset,
          });
        }

        const numSent = parseFloat(liveResult.amountSent.replace(/[^\d.]/g, "")) || 0;
        const numGas = parseFloat(liveResult.gasFeePaid.replace(/[^\d.]/g, "")) || 0;

        grossSum += numSent;
        gasSum += numGas;

        subTransactions.push({
          walletId: wallet.id,
          walletName: wallet.name,
          sourceAddress: wallet.address,
          amountSent: liveResult.amountSent,
          gasFeePaid: liveResult.gasFeePaid,
          txHash: liveResult.txHash,
          status: "ناجح",
        });
      } catch (err: any) {
        subTransactions.push({
          walletId: wallet.id,
          walletName: wallet.name,
          sourceAddress: wallet.address,
          amountSent: `0.00 ${asset}`,
          gasFeePaid: `0.00 ${asset === "SOL" ? "SOL" : "ETH"}`,
          txHash: "—",
          status: "فشل",
        });
      }
    }

    const successfulCount = subTransactions.filter((t) => t.status === "ناجح").length;
    const failedCount = subTransactions.filter((t) => t.status === "فشل").length;
    const netReceived = Math.max(0, grossSum - (asset === "USDC" || asset === "USDT" ? 0 : gasSum));
    const now = Date.now();
    const dateFormatted = new Date(now).toLocaleDateString("ar-EG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const result: SweepExecutionResult = {
      success: successfulCount > 0,
      operationId,
      asset,
      network,
      destinationAddress: cleanDest,
      totalSourceWallets: targetWallets.length,
      successfulTransfers: successfulCount,
      failedTransfers: failedCount,
      totalGrossAmount: `${grossSum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${asset}`,
      totalGasFees: `${gasSum.toFixed(6)} ${asset === "SOL" ? "SOL" : "ETH"}`,
      netAmountReceived: `${netReceived.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${asset}`,
      timestamp: now,
      date: dateFormatted,
      transactions: subTransactions,
      message:
        successfulCount > 0
          ? `تم بنجاح تحويل وتجميع الأرصدة من ${successfulCount} محفظة عبر شبكة ${network}`
          : `لم يتم تنفيذ التحويل: المحافظ المحددة لا تحتوي على رصيد كافٍ أو غاز على شبكة ${network}`,
    };

    const transferRecord: TransferRecord = {
      id: operationId,
      operationId,
      timestamp: now,
      date: dateFormatted,
      asset,
      assetSymbol: asset.slice(0, 1).toUpperCase(),
      network,
      targetAddress: cleanDest,
      sourceWalletsCount: targetWallets.length,
      sourceWallets: targetWallets.map((w) => w.address),
      totalAmount: result.totalGrossAmount,
      gasSpeed: speed,
      estimatedGasFee: result.totalGasFees,
      netReceived: result.netAmountReceived,
      status: successfulCount > 0 ? "مكتمل" : "فشل",
      txHashes: subTransactions.map((t) => t.txHash).filter((h) => h !== "—"),
    };

    await ServerStorage.saveTransfer(transferRecord);

    return result;
  }
}
