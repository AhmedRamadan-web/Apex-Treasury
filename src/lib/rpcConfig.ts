export interface ChainRPCConfig {
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  rpcUrls: string[];
  explorerUrl: string;
  explorerTxUrl: string;
  isEVM: boolean;
}

export const SUPPORTED_CHAINS: Record<string, ChainRPCConfig> = {
  Ethereum: {
    chainId: 1,
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    rpcUrls: [
      "https://ethereum.publicnode.com",
      "https://rpc.ankr.com/eth",
      "https://eth.llamarpc.com",
      "https://cloudflare-eth.com",
      "https://1rpc.io/eth",
    ],
    explorerUrl: "https://etherscan.io",
    explorerTxUrl: "https://etherscan.io/tx/",
    isEVM: true,
  },
  Polygon: {
    chainId: 137,
    name: "Polygon",
    symbol: "POL",
    decimals: 18,
    rpcUrls: [
      "https://polygon.publicnode.com",
      "https://rpc.ankr.com/polygon",
      "https://polygon-rpc.com",
      "https://1rpc.io/matic",
    ],
    explorerUrl: "https://polygonscan.com",
    explorerTxUrl: "https://polygonscan.com/tx/",
    isEVM: true,
  },
  Arbitrum: {
    chainId: 42161,
    name: "Arbitrum One",
    symbol: "ETH",
    decimals: 18,
    rpcUrls: [
      "https://arbitrum-one.publicnode.com",
      "https://rpc.ankr.com/arbitrum",
      "https://arb1.arbitrum.io/rpc",
    ],
    explorerUrl: "https://arbiscan.io",
    explorerTxUrl: "https://arbiscan.io/tx/",
    isEVM: true,
  },
  Base: {
    chainId: 8453,
    name: "Base",
    symbol: "ETH",
    decimals: 18,
    rpcUrls: [
      "https://base.publicnode.com",
      "https://mainnet.base.org",
      "https://base.llamarpc.com",
    ],
    explorerUrl: "https://basescan.org",
    explorerTxUrl: "https://basescan.org/tx/",
    isEVM: true,
  },
  BSC: {
    chainId: 56,
    name: "BNB Chain",
    symbol: "BNB",
    decimals: 18,
    rpcUrls: [
      "https://bsc.publicnode.com",
      "https://rpc.ankr.com/bsc",
      "https://bsc-dataseed1.binance.org",
      "https://bsc-dataseed2.binance.org",
    ],
    explorerUrl: "https://bscscan.com",
    explorerTxUrl: "https://bscscan.com/tx/",
    isEVM: true,
  },
  OP: {
    chainId: 10,
    name: "Optimism",
    symbol: "ETH",
    decimals: 18,
    rpcUrls: [
      "https://optimism.publicnode.com",
      "https://mainnet.optimism.io",
      "https://rpc.ankr.com/optimism",
    ],
    explorerUrl: "https://optimistic.etherscan.io",
    explorerTxUrl: "https://optimistic.etherscan.io/tx/",
    isEVM: true,
  },
  Linea: {
    chainId: 59144,
    name: "Linea",
    symbol: "ETH",
    decimals: 18,
    rpcUrls: [
      "https://linea.publicnode.com",
      "https://rpc.linea.build",
    ],
    explorerUrl: "https://lineascan.build",
    explorerTxUrl: "https://lineascan.build/tx/",
    isEVM: true,
  },
  Solana: {
    chainId: 101,
    name: "Solana",
    symbol: "SOL",
    decimals: 9,
    rpcUrls: [
      "https://solana-mainnet.g.alchemy.com/v2/demo",
      "https://api.mainnet-beta.solana.com",
      "https://rpc.ankr.com/solana",
    ],
    explorerUrl: "https://solscan.io",
    explorerTxUrl: "https://solscan.io/tx/",
    isEVM: false,
  },
  Tron: {
    chainId: 728126428,
    name: "Tron",
    symbol: "TRX",
    decimals: 6,
    rpcUrls: [
      "https://api.trongrid.io",
      "https://api.tronstack.io",
    ],
    explorerUrl: "https://tronscan.org",
    explorerTxUrl: "https://tronscan.org/#/transaction/",
    isEVM: false,
  },
  Bitcoin: {
    chainId: 0,
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 8,
    rpcUrls: [
      "https://mempool.space/api",
      "https://blockstream.info/api",
    ],
    explorerUrl: "https://mempool.space",
    explorerTxUrl: "https://mempool.space/tx/",
    isEVM: false,
  },
};

/**
 * Try multiple RPC URLs with fallback - returns first working provider with static network config
 */
export async function getWorkingEVMProvider(network: string) {
  const { ethers } = await import("ethers");
  const chain = SUPPORTED_CHAINS[network] || SUPPORTED_CHAINS["Ethereum"];

  for (const url of chain.rpcUrls) {
    try {
      // Use staticNetwork to prevent ethers from background retrying and hanging
      const networkObj = ethers.Network.from(chain.chainId);
      const provider = new ethers.JsonRpcProvider(url, networkObj, {
        staticNetwork: networkObj,
      });

      // Quick test with short 3s timeout
      await Promise.race([
        provider.getBlockNumber(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("RPC Timeout")), 3000)),
      ]);

      return provider;
    } catch {
      continue;
    }
  }

  // Fallback with static network
  const networkObj = ethers.Network.from(chain.chainId);
  return new ethers.JsonRpcProvider(chain.rpcUrls[0], networkObj, {
    staticNetwork: networkObj,
  });
}

export function getExplorerTxLink(network: string, txHash: string): string {
  const chain = SUPPORTED_CHAINS[network] || SUPPORTED_CHAINS["Ethereum"];
  return `${chain.explorerTxUrl}${txHash}`;
}

export function getExplorerAddressLink(network: string, address: string): string {
  const chain = SUPPORTED_CHAINS[network] || SUPPORTED_CHAINS["Ethereum"];
  if (network === "Solana") return `https://solscan.io/account/${address}`;
  if (network === "Tron") return `https://tronscan.org/#/address/${address}`;
  if (network === "Bitcoin") return `https://mempool.space/address/${address}`;
  return `${chain.explorerUrl}/address/${address}`;
}
