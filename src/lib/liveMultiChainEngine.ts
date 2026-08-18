import { ethers } from "ethers";
import { Connection, PublicKey, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { SUPPORTED_CHAINS, getWorkingEVMProvider, getExplorerTxLink } from "./rpcConfig";

export interface LiveBalanceResult {
  chain: string;
  address: string;
  nativeBalance: string;
  formattedBalance: string;
  usdValue: string;
  symbol: string;
  rawAmount: bigint | number;
}

export interface LiveSendTransactionParams {
  network: string;
  privateKey: string;
  mnemonic?: string;
  fromAddress: string;
  toAddress: string;
  amount?: string;
  isMax?: boolean;
  gasSpeed?: "economic" | "balanced" | "fast";
  asset?: string;
}

export interface LiveSendTransactionResult {
  success: boolean;
  txHash: string;
  explorerLink: string;
  amountSent: string;
  gasFeePaid: string;
  status: "ناجح" | "فشل";
  error?: string;
  blockNumber?: number;
}

export class LiveMultiChainEngine {
  /**
   * Get an EVM JsonRpcProvider with automatic fallback across multiple RPC URLs
   */
  public static async getEVMProvider(network: string): Promise<ethers.JsonRpcProvider> {
    return getWorkingEVMProvider(network);
  }

  /**
   * Query Live On-Chain Balance for an EVM Address
   */
  public static async queryEVMBalance(network: string, address: string): Promise<LiveBalanceResult> {
    const chain = SUPPORTED_CHAINS[network] || SUPPORTED_CHAINS["Ethereum"];
    const provider = await this.getEVMProvider(network);

    try {
      const balanceWei = await provider.getBalance(address);
      const ethVal = parseFloat(ethers.formatEther(balanceWei));
      const formatted = `${ethVal.toFixed(ethVal > 0 ? 4 : 2)} ${chain.symbol}`;

      // Estimated price
      const pricePerUnit = chain.symbol === "BNB" ? 580 : chain.symbol === "POL" ? 0.45 : 2650;
      const usdVal = `$${(ethVal * pricePerUnit).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      return {
        chain: chain.name,
        address,
        nativeBalance: ethVal.toString(),
        formattedBalance: formatted,
        usdValue: usdVal,
        symbol: chain.symbol,
        rawAmount: balanceWei,
      };
    } catch (error) {
      return {
        chain: chain.name,
        address,
        nativeBalance: "0.0",
        formattedBalance: `0.00 ${chain.symbol}`,
        usdValue: "$0.00",
        symbol: chain.symbol,
        rawAmount: BigInt(0),
      };
    }
  }

  /**
   * Query Live On-Chain Balance for Solana Address
   */
  public static async querySolanaBalance(address: string): Promise<LiveBalanceResult> {
    try {
      const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
      const pubKey = new PublicKey(address);
      const lamports = await connection.getBalance(pubKey);
      const sol = lamports / 1e9;

      return {
        chain: "Solana",
        address,
        nativeBalance: sol.toString(),
        formattedBalance: `${sol.toFixed(sol > 0 ? 4 : 2)} SOL`,
        usdValue: `$${(sol * 145).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        symbol: "SOL",
        rawAmount: lamports,
      };
    } catch {
      return {
        chain: "Solana",
        address,
        nativeBalance: "0.0",
        formattedBalance: "0.00 SOL",
        usdValue: "$0.00",
        symbol: "SOL",
        rawAmount: 0,
      };
    }
  }

  /**
   * Query Live On-Chain Balance for Bitcoin Address
   */
  public static async queryBitcoinBalance(address: string): Promise<LiveBalanceResult> {
    try {
      const res = await fetch(`https://blockstream.info/api/address/${address}`, { next: { revalidate: 30 } });
      if (res.ok) {
        const data = await res.json();
        const funded = data.chain_stats?.funded_txo_sum || 0;
        const spent = data.chain_stats?.spent_txo_sum || 0;
        const satoshis = funded - spent;
        const btc = satoshis / 1e8;

        return {
          chain: "Bitcoin",
          address,
          nativeBalance: btc.toString(),
          formattedBalance: `${btc.toFixed(btc > 0 ? 6 : 2)} BTC`,
          usdValue: `$${(btc * 64000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          symbol: "BTC",
          rawAmount: satoshis,
        };
      }
    } catch {}

    return {
      chain: "Bitcoin",
      address,
      nativeBalance: "0.0",
      formattedBalance: "0.00 BTC",
      usdValue: "$0.00",
      symbol: "BTC",
      rawAmount: 0,
    };
  }

  /**
   * Execute a Live On-Chain Transfer for EVM
   */
  public static async sendEVMLive(params: LiveSendTransactionParams): Promise<LiveSendTransactionResult> {
    const network = params.network || "Ethereum";
    const chain = SUPPORTED_CHAINS[network] || SUPPORTED_CHAINS["Ethereum"];
    const provider = await this.getEVMProvider(network);

    try {
      let cleanKey = params.privateKey.trim();
      if (!cleanKey.startsWith("0x")) cleanKey = `0x${cleanKey}`;

      const wallet = new ethers.Wallet(cleanKey, provider);
      const balanceWei = await provider.getBalance(wallet.address);
      const feeData = await provider.getFeeData();

      const gasLimit = BigInt(21000);
      const maxFeePerGas = feeData.maxFeePerGas || feeData.gasPrice || ethers.parseUnits("20", "gwei");
      const requiredGasCost = gasLimit * maxFeePerGas;

      let sendValueWei = BigInt(0);

      if (params.isMax) {
        if (balanceWei <= requiredGasCost) {
          throw new Error(
            `الرصيد المتاح على الشبكة (${ethers.formatEther(balanceWei)} ${chain.symbol}) غير كافٍ لتغطية رسوم الغاز الحقيقية (${ethers.formatEther(requiredGasCost)} ${chain.symbol}).`
          );
        }
        sendValueWei = balanceWei - requiredGasCost;
      } else if (params.amount) {
        sendValueWei = ethers.parseEther(params.amount.replace(/,/g, ""));
        if (balanceWei < sendValueWei + requiredGasCost) {
          throw new Error(
            `الرصيد غير كافٍ لإرسال ${params.amount} ${chain.symbol} + رسوم الغاز ${ethers.formatEther(requiredGasCost)} ${chain.symbol}.`
          );
        }
      }

      // Broadcast on-chain transaction
      const txResponse = await wallet.sendTransaction({
        to: params.toAddress,
        value: sendValueWei,
        gasLimit,
        maxFeePerGas: feeData.maxFeePerGas || undefined,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
      });

      const txHash = txResponse.hash;
      const receipt = await txResponse.wait();
      const explorerLink = getExplorerTxLink(network, txHash);

      return {
        success: true,
        txHash,
        explorerLink,
        amountSent: `${ethers.formatEther(sendValueWei)} ${chain.symbol}`,
        gasFeePaid: `${ethers.formatEther(requiredGasCost)} ${chain.symbol}`,
        status: "ناجح",
        blockNumber: receipt?.blockNumber,
      };
    } catch (error: any) {
      // Re-throw with clear Arabic error message
      const msg = error?.message || "";
      if (msg.includes("insufficient funds") || msg.includes("غير كاف")) {
        throw new Error(`الرصيد غير كافٍ لتغطية التحويل + رسوم الغاز على شبكة ${chain.name}`);
      }
      if (msg.includes("nonce")) {
        throw new Error(`خطأ في ترتيب المعاملة (nonce) - حاول مرة أخرى`);
      }
      if (msg.includes("network") || msg.includes("timeout") || msg.includes("ECONNREFUSED")) {
        throw new Error(`تعذر الاتصال بشبكة ${chain.name} - تحقق من الاتصال بالإنترنت`);
      }
      throw new Error(`فشلت المعاملة على شبكة ${chain.name}: ${msg.slice(0, 120)}`);
    }
  }

  /**
   * Execute a Live On-Chain Transfer for Solana
   */
  public static async sendSolanaLive(params: LiveSendTransactionParams): Promise<LiveSendTransactionResult> {
    try {
      const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
      let keypair: Keypair;

      if (params.privateKey.length === 64 || params.privateKey.length === 88) {
        const decoded = bs58.decode(params.privateKey);
        keypair = Keypair.fromSecretKey(decoded);
      } else {
        const secret = ethers.getBytes(params.privateKey.startsWith("0x") ? params.privateKey : `0x${params.privateKey}`).slice(0, 32);
        keypair = Keypair.fromSeed(secret);
      }

      const toPubkey = new PublicKey(params.toAddress);
      const balance = await connection.getBalance(keypair.publicKey);
      const fee = 5000; // 5000 lamports standard fee

      let lamportsToSend = 0;
      if (params.isMax) {
        if (balance <= fee) {
          throw new Error(`رصيد Solana المتاح (${balance / 1e9} SOL) لا يكفي لتغطية رسوم المعاملة (${fee / 1e9} SOL).`);
        }
        lamportsToSend = balance - fee;
      } else {
        lamportsToSend = Math.floor(parseFloat(params.amount || "0.1") * 1e9);
      }

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey,
          lamports: lamportsToSend,
        })
      );

      const signature = await sendAndConfirmTransaction(connection, tx, [keypair]);
      return {
        success: true,
        txHash: signature,
        explorerLink: getExplorerTxLink("Solana", signature),
        amountSent: `${lamportsToSend / 1e9} SOL`,
        gasFeePaid: `${fee / 1e9} SOL`,
        status: "ناجح",
      };
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("insufficient") || msg.includes("غير كاف")) {
        throw new Error(`رصيد Solana غير كافٍ - تحتاج على رصيد SOL لدفع رسوم المعاملة`);
      }
      if (msg.includes("Invalid public key") || msg.includes("PublicKey")) {
        throw new Error(`عنوان المحفظة الهدف غير صالح لشبكة Solana`);
      }
      if (msg.includes("timeout") || msg.includes("network")) {
        throw new Error(`تعذر الاتصال بشبكة Solana - تحقق من الاتصال بالإنترنت`);
      }
      throw new Error(`فشلت معاملة Solana: ${msg.slice(0, 120)}`);
    }
  }
}
