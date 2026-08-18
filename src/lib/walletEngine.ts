import { ethers } from "ethers";
import * as nacl from "tweetnacl";
import bs58 from "bs58";
import { ServerStorage } from "./serverStorage";
import { ChainAddressInfo, GeneratedWalletData } from "@/types/wallet";

export type { ChainAddressInfo, GeneratedWalletData };

// ─── BECH32 ENCODER (For Bitcoin Native SegWit) ──────────────────────────────
const BECH32_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

function bech32Polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const b = chk >>> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((b >>> i) & 1) chk ^= GEN[i];
    }
  }
  return chk;
}

function bech32HrpExpand(hrp: string): number[] {
  const ret: number[] = [];
  for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) >> 5);
  ret.push(0);
  for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) & 31);
  return ret;
}

function bech32Checksum(hrp: string, data: number[]): number[] {
  const values = bech32HrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  const polymod = bech32Polymod(values) ^ 1;
  const ret: number[] = [];
  for (let i = 0; i < 6; i++) ret.push((polymod >>> (5 * (5 - i))) & 31);
  return ret;
}

function convertBits(
  data: Uint8Array | number[],
  fromBits: number,
  toBits: number,
  pad: boolean
): number[] {
  let acc = 0;
  let bits = 0;
  const ret: number[] = [];
  const maxv = (1 << toBits) - 1;

  for (const value of data) {
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      ret.push((acc >>> bits) & maxv);
    }
  }

  if (pad) {
    if (bits > 0) ret.push((acc << (toBits - bits)) & maxv);
  }

  return ret;
}

function bech32Encode(hrp: string, version: number, program: Uint8Array): string {
  const data5bit = [version].concat(convertBits(program, 8, 5, true));
  const checksum = bech32Checksum(hrp, data5bit);
  const combined = data5bit.concat(checksum);

  let result = hrp + "1";
  for (const c of combined) result += BECH32_CHARSET[c];
  return result;
}

// ─── MULTI-CHAIN DERIVATION ENGINE ───────────────────────────────────────────
export class MultiChainDeriver {
  private static getRootNode(mnemonicPhrase: string) {
    const mnemonic = ethers.Mnemonic.fromPhrase(mnemonicPhrase);
    const seed = mnemonic.computeSeed();
    return ethers.HDNodeWallet.fromSeed(seed);
  }

  public static deriveEVMAddress(mnemonicPhrase: string): string {
    const wallet = ethers.HDNodeWallet.fromPhrase(mnemonicPhrase);
    return wallet.address;
  }

  public static deriveBitcoinAddress(mnemonicPhrase: string): string {
    const root = this.getRootNode(mnemonicPhrase);
    const child = root.derivePath("m/84'/0'/0'/0/0");

    const compressedPubKey = ethers.SigningKey.computePublicKey(
      child.privateKey,
      true
    );

    const sha = ethers.sha256(compressedPubKey);
    const hash160 = ethers.ripemd160(sha);
    const program = ethers.getBytes(hash160);

    return bech32Encode("bc", 0, program);
  }

  public static deriveTronAddress(mnemonicPhrase: string): string {
    const root = this.getRootNode(mnemonicPhrase);
    const child = root.derivePath("m/44'/195'/0'/0/0");

    const uncompressed = ethers.SigningKey.computePublicKey(
      child.privateKey,
      false
    );
    const pubBytes = ethers.getBytes(uncompressed).slice(1);
    const hashHex = ethers.keccak256(pubBytes);
    const hashBytes = ethers.getBytes(hashHex);

    const rawAddr = new Uint8Array(21);
    rawAddr[0] = 0x41;
    rawAddr.set(hashBytes.slice(12), 1);

    const hash1 = ethers.getBytes(ethers.sha256(rawAddr));
    const hash2 = ethers.getBytes(ethers.sha256(hash1));
    const checksum = hash2.slice(0, 4);

    const full = new Uint8Array(25);
    full.set(rawAddr);
    full.set(checksum, 21);

    return bs58.encode(full);
  }

  private static slip10DeriveEd25519(seed: Uint8Array, path: string): Uint8Array {
    const encoder = new TextEncoder();
    const masterKey = ethers.getBytes(
      ethers.computeHmac("sha512", encoder.encode("ed25519 seed"), seed)
    );

    let key = masterKey.slice(0, 32);
    let chainCode = masterKey.slice(32);

    const segments = path.replace("m/", "").split("/");
    for (const segment of segments) {
      const index = parseInt(segment.replace("'", ""), 10) + 0x80000000;
      const data = new Uint8Array(37);
      data[0] = 0x00;
      data.set(key, 1);
      data[33] = (index >>> 24) & 0xff;
      data[34] = (index >>> 16) & 0xff;
      data[35] = (index >>> 8) & 0xff;
      data[36] = index & 0xff;

      const I = ethers.getBytes(ethers.computeHmac("sha512", chainCode, data));
      key = I.slice(0, 32);
      chainCode = I.slice(32);
    }

    return key;
  }

  public static async deriveSolanaAddress(mnemonicPhrase: string): Promise<string> {
    const encoder = new TextEncoder();
    const mnemonic = encoder.encode(mnemonicPhrase.normalize("NFKD"));
    const salt = encoder.encode("mnemonic".normalize("NFKD"));
    const seedHex = ethers.pbkdf2(mnemonic, salt, 2048, 64, "sha512");
    const seedBytes = ethers.getBytes(seedHex);

    const derivedKey = this.slip10DeriveEd25519(seedBytes, "m/44'/501'/0'/0'");
    const keyPair = nacl.sign.keyPair.fromSeed(derivedKey);
    return bs58.encode(keyPair.publicKey);
  }

  public static async deriveAllChainAddresses(
    mnemonicPhrase: string
  ): Promise<ChainAddressInfo[]> {
    const evmAddr = this.deriveEVMAddress(mnemonicPhrase);
    const btcAddr = this.deriveBitcoinAddress(mnemonicPhrase);
    const solAddr = await this.deriveSolanaAddress(mnemonicPhrase);
    const tronAddr = this.deriveTronAddress(mnemonicPhrase);

    return [
      { index: 0, chain: "Ethereum", symbol: "ETH", address: evmAddr, path: "m/44'/60'/0'/0/0" },
      { index: 1, chain: "Bitcoin", symbol: "BTC", address: btcAddr, path: "m/84'/0'/0'/0/0" },
      { index: 2, chain: "Solana", symbol: "SOL", address: solAddr, path: "m/44'/501'/0'/0'" },
      { index: 3, chain: "Linea", symbol: "ETH", address: evmAddr, path: "m/44'/60'/0'/0/0" },
      { index: 4, chain: "Base", symbol: "ETH", address: evmAddr, path: "m/44'/60'/0'/0/0" },
      { index: 5, chain: "BNB Chain", symbol: "BNB", address: evmAddr, path: "m/44'/60'/0'/0/0" },
      { index: 6, chain: "Polygon", symbol: "POL", address: evmAddr, path: "m/44'/60'/0'/0/0" },
      { index: 7, chain: "Monad", symbol: "MONAD", address: evmAddr, path: "m/44'/60'/0'/0/0" },
      { index: 8, chain: "OP", symbol: "ETH", address: evmAddr, path: "m/44'/60'/0'/0/0" },
      { index: 9, chain: "Arbitrum", symbol: "ETH", address: evmAddr, path: "m/44'/60'/0'/0/0" },
      { index: 10, chain: "Tron", symbol: "TRX", address: tronAddr, path: "m/44'/195'/0'/0/0" },
    ];
  }
}

// ─── WALLET CREATOR & STORE MANAGER ──────────────────────────────────────────
export class WalletEngine {
  private static STORAGE_KEY = "tadawul_generated_wallets";

  public static generateMnemonic(): string {
    const entropy = ethers.randomBytes(16);
    return ethers.Mnemonic.entropyToPhrase(entropy);
  }

  public static async createWallet(customName?: string): Promise<GeneratedWalletData> {
    const mnemonic = this.generateMnemonic();
    const evmWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
    const addresses = await MultiChainDeriver.deriveAllChainAddresses(mnemonic);
    const timestamp = Date.now();
    const id = `wallet_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;

    const walletData: GeneratedWalletData = {
      id,
      name: customName || `محفظة تداول #${Math.floor(1000 + Math.random() * 9000)}`,
      address: evmWallet.address,
      mnemonic,
      privateKey: evmWallet.privateKey,
      publicKey: evmWallet.publicKey,
      path: evmWallet.path || "m/44'/60'/0'/0/0",
      addresses,
      createdAt: timestamp,
      network: "Ethereum",
      assets: "ETH",
      balance: "0.00 ETH",
      usdValue: "$0.00",
      status: "نشط",
    };

    if (typeof window === "undefined") {
      await ServerStorage.saveWallet(walletData);
    } else {
      this.saveWalletLocal(walletData);
    }

    return walletData;
  }

  public static async createMultipleWallets(count: number): Promise<GeneratedWalletData[]> {
    const results: GeneratedWalletData[] = [];
    for (let i = 0; i < count; i++) {
      const mnemonic = this.generateMnemonic();
      const evmWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
      const addresses = await MultiChainDeriver.deriveAllChainAddresses(mnemonic);
      const timestamp = Date.now() + i;
      const id = `wallet_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;

      results.push({
        id,
        name: `محفظة تداول فرعية #${i + 1} (${evmWallet.address.slice(0, 6)}...${evmWallet.address.slice(-4)})`,
        address: evmWallet.address,
        mnemonic,
        privateKey: evmWallet.privateKey,
        publicKey: evmWallet.publicKey,
        path: evmWallet.path || "m/44'/60'/0'/0/0",
        addresses,
        createdAt: timestamp,
        network: "Ethereum",
        assets: "ETH",
        balance: "0.00 ETH",
        usdValue: "$0.00",
        status: "نشط",
      });
    }

    if (typeof window === "undefined") {
      await ServerStorage.saveWalletsBatch(results);
    }

    return results;
  }

  public static async importFromSeedPhrase(
    phrase: string,
    name?: string
  ): Promise<GeneratedWalletData> {
    const cleanPhrase = phrase.trim().toLowerCase();
    if (!ethers.Mnemonic.isValidMnemonic(cleanPhrase)) {
      throw new Error("عبارة الاسترداد (Seed Phrase) غير صالحة، يجب أن تتكون من 12 أو 24 كلمة صحيحة.");
    }

    const evmWallet = ethers.HDNodeWallet.fromPhrase(cleanPhrase);
    const addresses = await MultiChainDeriver.deriveAllChainAddresses(cleanPhrase);
    const timestamp = Date.now();
    const id = `wallet_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;

    const walletData: GeneratedWalletData = {
      id,
      name: name || `محفظة مستوردة (${evmWallet.address.slice(0, 6)}...${evmWallet.address.slice(-4)})`,
      address: evmWallet.address,
      mnemonic: cleanPhrase,
      privateKey: evmWallet.privateKey,
      publicKey: evmWallet.publicKey,
      path: evmWallet.path || "m/44'/60'/0'/0/0",
      addresses,
      createdAt: timestamp,
      network: "Ethereum",
      assets: "ETH",
      balance: "0.00 ETH",
      usdValue: "$0.00",
      status: "نشط",
    };

    if (typeof window === "undefined") {
      await ServerStorage.saveWallet(walletData);
    } else {
      this.saveWalletLocal(walletData);
    }

    return walletData;
  }

  public static async importFromPrivateKey(
    privateKeyInput: string,
    name?: string
  ): Promise<GeneratedWalletData> {
    let cleanKey = privateKeyInput.trim();
    if (!cleanKey.startsWith("0x")) {
      cleanKey = `0x${cleanKey}`;
    }

    const evmWallet = new ethers.Wallet(cleanKey);
    const timestamp = Date.now();
    const id = `wallet_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;

    const walletData: GeneratedWalletData = {
      id,
      name: name || `محفظة مفتاح خاص (${evmWallet.address.slice(0, 6)}...${evmWallet.address.slice(-4)})`,
      address: evmWallet.address,
      mnemonic: "غير متوفرة (تم الاستيراد عبر المفتاح الخاص مباشرة)",
      privateKey: cleanKey,
      publicKey: "N/A",
      path: "N/A",
      addresses: [
        { index: 0, chain: "Ethereum", symbol: "ETH", address: evmWallet.address, path: "EVM" },
        { index: 3, chain: "Linea", symbol: "ETH", address: evmWallet.address, path: "EVM" },
        { index: 4, chain: "Base", symbol: "ETH", address: evmWallet.address, path: "EVM" },
        { index: 5, chain: "BNB Chain", symbol: "BNB", address: evmWallet.address, path: "EVM" },
        { index: 6, chain: "Polygon", symbol: "POL", address: evmWallet.address, path: "EVM" },
        { index: 7, chain: "Monad", symbol: "MONAD", address: evmWallet.address, path: "EVM" },
        { index: 8, chain: "OP", symbol: "ETH", address: evmWallet.address, path: "EVM" },
        { index: 9, chain: "Arbitrum", symbol: "ETH", address: evmWallet.address, path: "EVM" },
      ],
      createdAt: timestamp,
      network: "Ethereum",
      assets: "ETH",
      balance: "0.00 ETH",
      usdValue: "$0.00",
      status: "نشط",
    };

    if (typeof window === "undefined") {
      await ServerStorage.saveWallet(walletData);
    } else {
      this.saveWalletLocal(walletData);
    }

    return walletData;
  }

  public static async getWallets(): Promise<GeneratedWalletData[]> {
    if (typeof window === "undefined") {
      return await ServerStorage.getWallets();
    }
    return this.getStoredWalletsLocal();
  }

  public static async deleteWallet(walletId: string): Promise<void> {
    if (typeof window === "undefined") {
      await ServerStorage.deleteWallet(walletId);
    } else {
      this.deleteWalletLocal(walletId);
    }
  }

  public static async deleteAllWallets(): Promise<void> {
    if (typeof window === "undefined") {
      await ServerStorage.deleteAllWallets();
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  private static getStoredWalletsLocal(): GeneratedWalletData[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private static saveWalletLocal(wallet: GeneratedWalletData): void {
    if (typeof window === "undefined") return;
    const current = this.getStoredWalletsLocal();
    const updated = [wallet, ...current.filter((w) => w.id !== wallet.id)];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  private static deleteWalletLocal(walletId: string): void {
    if (typeof window === "undefined") return;
    const current = this.getStoredWalletsLocal();
    const filtered = current.filter((w) => w.id !== walletId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  public static exportWalletsToText(wallets: GeneratedWalletData[]): string {
    let out = "========================================================================\n";
    out += "             TADAWUL APEX TREASURY - MULTI-CHAIN WALLET EXPORT         \n";
    out += "========================================================================\n\n";
    out += `إجمالي المحافظ المصدّرة: ${wallets.length}\n`;
    out += `تاريخ التصدير: ${new Date().toLocaleString("ar-EG")}\n\n`;

    wallets.forEach((w, idx) => {
      out += `────────────────────────────────────────────────────────────────────────\n`;
      out += `[محفظة #${idx + 1}] : ${w.name}\n`;
      out += `المعرف: ${w.id}\n`;
      out += `العنوان الرئيسي (EVM): ${w.address}\n`;
      out += `المفتاح الخاص (Private Key): ${w.privateKey}\n`;
      out += `عبارة الاسترداد (Seed Phrase): ${w.mnemonic}\n`;
      out += `العناوين المشتقة عبر الـ 11 شبكة:\n`;
      w.addresses.forEach((addr) => {
        out += `  • [${addr.chain.padEnd(11)}] ${addr.address}  (مسار: ${addr.path})\n`;
      });
      out += "\n";
    });

    return out;
  }

  public static exportWalletsToCSV(wallets: GeneratedWalletData[]): string {
    const headers = [
      "ID",
      "Name",
      "EVM_Address",
      "Private_Key",
      "Seed_Phrase",
      "Bitcoin_Address",
      "Solana_Address",
      "Tron_Address",
      "Created_At",
    ];

    const rows = wallets.map((w) => {
      const btc = w.addresses.find((a) => a.chain === "Bitcoin")?.address || "";
      const sol = w.addresses.find((a) => a.chain === "Solana")?.address || "";
      const tron = w.addresses.find((a) => a.chain === "Tron")?.address || "";

      return [
        `"${w.id}"`,
        `"${w.name.replace(/"/g, '""')}"`,
        `"${w.address}"`,
        `"${w.privateKey}"`,
        `"${w.mnemonic.replace(/"/g, '""')}"`,
        `"${btc}"`,
        `"${sol}"`,
        `"${tron}"`,
        `"${new Date(w.createdAt).toISOString()}"`,
      ].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }
}
