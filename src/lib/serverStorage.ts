import fs from "fs";
import path from "path";
import { GeneratedWalletData, TransferRecord } from "@/types/wallet";

export type { GeneratedWalletData, TransferRecord };

const DATA_DIR = path.join(process.cwd(), "src", "data");
const WALLETS_FILE = path.join(DATA_DIR, "wallets.json");
const TRANSFERS_FILE = path.join(DATA_DIR, "transfers.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export class ServerStorage {
  /**
   * Get all stored wallets
   */
  public static async getWallets(): Promise<GeneratedWalletData[]> {
    ensureDirectoryExists();
    if (!fs.existsSync(WALLETS_FILE)) {
      return [];
    }
    try {
      const data = await fs.promises.readFile(WALLETS_FILE, "utf-8");
      return JSON.parse(data || "[]");
    } catch (error) {
      console.error("Error reading wallets file:", error);
      return [];
    }
  }

  /**
   * Save a single wallet or update existing
   */
  public static async saveWallet(wallet: GeneratedWalletData): Promise<void> {
    ensureDirectoryExists();
    const current = await this.getWallets();
    const existingIndex = current.findIndex((w) => w.id === wallet.id);
    if (existingIndex >= 0) {
      current[existingIndex] = wallet;
    } else {
      current.unshift(wallet);
    }
    await fs.promises.writeFile(WALLETS_FILE, JSON.stringify(current, null, 2), "utf-8");
  }

  /**
   * Save multiple wallets in batch
   */
  public static async saveWalletsBatch(wallets: GeneratedWalletData[]): Promise<void> {
    ensureDirectoryExists();
    const current = await this.getWallets();
    const map = new Map<string, GeneratedWalletData>();
    wallets.forEach((w) => map.set(w.id, w));
    current.forEach((w) => {
      if (!map.has(w.id)) {
        map.set(w.id, w);
      }
    });
    const combined = Array.from(map.values());
    await fs.promises.writeFile(WALLETS_FILE, JSON.stringify(combined, null, 2), "utf-8");
  }

  /**
   * Delete a wallet by ID
   */
  public static async deleteWallet(walletId: string): Promise<boolean> {
    ensureDirectoryExists();
    const current = await this.getWallets();
    const filtered = current.filter((w) => w.id !== walletId);
    if (filtered.length !== current.length) {
      await fs.promises.writeFile(WALLETS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
      return true;
    }
    return false;
  }

  /**
   * Delete all wallets
   */
  public static async deleteAllWallets(): Promise<void> {
    ensureDirectoryExists();
    await fs.promises.writeFile(WALLETS_FILE, JSON.stringify([], null, 2), "utf-8");
  }

  /**
   * Get all transfer and sweep history logs
   */
  public static async getTransfers(): Promise<TransferRecord[]> {
    ensureDirectoryExists();
    if (!fs.existsSync(TRANSFERS_FILE)) {
      return [];
    }
    try {
      const data = await fs.promises.readFile(TRANSFERS_FILE, "utf-8");
      return JSON.parse(data || "[]");
    } catch (error) {
      console.error("Error reading transfers file:", error);
      return [];
    }
  }

  /**
   * Save a transfer / sweep record
   */
  public static async saveTransfer(record: TransferRecord): Promise<void> {
    ensureDirectoryExists();
    const current = await this.getTransfers();
    current.unshift(record);
    await fs.promises.writeFile(TRANSFERS_FILE, JSON.stringify(current, null, 2), "utf-8");
  }
}
