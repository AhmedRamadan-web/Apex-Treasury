export interface ChainAddressInfo {
  index: number;
  chain: string;
  symbol: string;
  address: string;
  path: string;
  balance?: string;
  usdValue?: string;
}

export interface GeneratedWalletData {
  id: string;
  name: string;
  address: string; // Primary EVM address
  mnemonic: string;
  privateKey: string;
  publicKey: string;
  path: string;
  addresses: ChainAddressInfo[];
  createdAt: number;
  assets?: string;
  balance?: string;
  usdValue?: string;
  network?: string;
  status?: "نشط" | "تحديث مطلوب" | "قيد المزامنة" | "مؤرشف";
}

export interface TransferRecord {
  id: string;
  operationId: string;
  timestamp: number;
  date: string;
  asset: string;
  assetSymbol: string;
  network: string;
  targetAddress: string;
  sourceWalletsCount: number;
  sourceWallets: string[];
  totalAmount: string;
  gasSpeed: "economic" | "balanced" | "fast";
  estimatedGasFee: string;
  netReceived: string;
  status: "مكتمل" | "قيد المعالجة" | "فشل";
  txHashes: string[];
}

export interface SweepSubTransaction {
  walletId: string;
  walletName: string;
  sourceAddress: string;
  amountSent: string;
  gasFeePaid: string;
  txHash: string;
  status: "ناجح" | "فشل";
}

export interface SweepExecutionResult {
  success: boolean;
  operationId: string;
  asset: string;
  network: string;
  destinationAddress: string;
  totalSourceWallets: number;
  successfulTransfers: number;
  failedTransfers: number;
  totalGrossAmount: string;
  totalGasFees: string;
  netAmountReceived: string;
  timestamp: number;
  date: string;
  transactions: SweepSubTransaction[];
  message: string;
}
