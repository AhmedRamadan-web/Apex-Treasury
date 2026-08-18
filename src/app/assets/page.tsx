"use client";

import { useState, useEffect, useMemo } from "react";
import { GeneratedWalletData } from "@/types/wallet";
import Link from "next/link";

export default function AssetsPage() {
  const [wallets, setWallets] = useState<GeneratedWalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWallets = async () => {
    try {
      const res = await fetch("/api/wallets");
      const data = await res.json();
      if (data.success && data.wallets) {
        setWallets(data.wallets);
      }
    } catch (e) {
      console.error("Error fetching assets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleRefreshPrices = async () => {
    setIsRefreshing(true);
    try {
      await fetch("/api/wallets/balances", { method: "POST" });
      await fetchWallets();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Aggregate assets from real wallets
  const aggregatedAssets = useMemo(() => {
    const map = new Map<string, { name: string; symbol: string; balance: number; usdValue: number; network: string; iconColor: string }>();

    const baseSymbols = [
      { id: "ETH", name: "Ethereum", symbol: "ETH", network: "Ethereum Mainnet", iconColor: "#627EEA" },
      { id: "SOL", name: "Solana", symbol: "SOL", network: "Solana Network", iconColor: "#14F195" },
      { id: "BTC", name: "Bitcoin", symbol: "BTC", network: "Bitcoin Network", iconColor: "#F7931A" },
      { id: "TRX", name: "Tron", symbol: "TRX", network: "Tron Network", iconColor: "#FF0013" },
      { id: "POL", name: "Polygon", symbol: "POL", network: "Polygon POS", iconColor: "#8247E5" },
      { id: "BNB", name: "BNB", symbol: "BNB", network: "BNB Chain", iconColor: "#F3BA2F" },
      { id: "USDC", name: "USD Coin", symbol: "USDC", network: "Multi-Chain", iconColor: "#2775CA" },
      { id: "USDT", name: "Tether", symbol: "USDT", network: "Multi-Chain", iconColor: "#26A17B" },
    ];

    baseSymbols.forEach((s) => {
      map.set(s.symbol, { ...s, balance: 0, usdValue: 0 });
    });

    wallets.forEach((w) => {
      const balStr = w.balance || "0";
      const numMatch = balStr.match(/[\d,.]+/);
      const val = numMatch ? parseFloat(numMatch[0].replace(/,/g, "")) : 0;

      const usdStr = w.usdValue || "$0";
      const usdMatch = usdStr.match(/[\d,.]+/);
      const usdVal = usdMatch ? parseFloat(usdMatch[0].replace(/,/g, "")) : 0;

      const ethItem = map.get("ETH");
      if (ethItem) {
        ethItem.balance += val;
        ethItem.usdValue += usdVal;
      }
    });

    return Array.from(map.values());
  }, [wallets]);

  const totalUSD = useMemo(() => {
    return aggregatedAssets.reduce((sum, a) => sum + a.usdValue, 0);
  }, [aggregatedAssets]);

  const filteredAssets = aggregatedAssets.filter((a) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "stable" && (a.symbol === "USDC" || a.symbol === "USDT")) ||
      (activeTab === "crypto" && a.symbol !== "USDC" && a.symbol !== "USDT");

    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.symbol.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in text-right font-cairo" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            الأصول الرقمية الحقيقية
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            نظرة شاملة ومباشرة على إجمالي الأرصدة المتوفرة عبر جميع المحافظ المشتقة.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portfolios"
            className="flex items-center gap-2 border border-[#1e2e45] bg-[#0b1424] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#142135] transition-all"
          >
            <span className="material-symbols-outlined text-base text-blue-400">add</span>
            <span>توليد محفظة</span>
          </Link>
          <button
            onClick={handleRefreshPrices}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-base ${isRefreshing ? "animate-spin" : ""}`}>
              sync_alt
            </span>
            <span>تحديث الأرصدة الحية</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">
                إجمالي قيمة الأصول (USD)
              </p>
              <h3 className="text-2xl md:text-3xl font-black text-white font-mono">
                ${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-2xl">account_balance</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="text-gray-400">محسوب مباشرة من رصيد {wallets.length} محفظة</span>
          </div>
        </div>

        <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">
                الأصول والعملات المدعومة
              </p>
              <h3 className="text-2xl md:text-3xl font-black text-white font-mono">
                {aggregatedAssets.length}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <span className="material-symbols-outlined text-2xl">token</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            موزعة على 11 شبكة بلوكتشين مشتقة
          </p>
        </div>

        <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">
                المحافظ المسجلة بالخزانة
              </p>
              <h3 className="text-2xl md:text-3xl font-black text-white font-mono">
                {wallets.length}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-4 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>جاهزة لاستقبال دفعات التعدين</span>
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-6 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="flex items-center gap-2 bg-[#070e1a] p-1 rounded-xl border border-[#18263c]">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "all"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              جميع الأصول
            </button>
            <button
              onClick={() => setActiveTab("crypto")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "crypto"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              العملات المشفرة
            </button>
            <button
              onClick={() => setActiveTab("stable")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "stable"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              العملات المستقرة (Stablecoins)
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="بحث عن أصل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-[#111c2e] border border-[#1e2e45] text-white text-xs rounded-xl pr-10 pl-4 py-2 focus:border-blue-500 outline-none"
            />
            <span className="material-symbols-outlined text-gray-400 absolute right-3 top-2 text-base">
              search
            </span>
          </div>
        </div>

        {/* Real Assets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#070e1a] text-gray-400 uppercase border-b border-[#18263c] font-bold">
              <tr>
                <th className="px-6 py-4">الأصل</th>
                <th className="px-6 py-4">الشبكة</th>
                <th className="px-6 py-4">الرصيد الإجمالي</th>
                <th className="px-6 py-4">القيمة التقديرية</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18263c]/60">
              {filteredAssets.map((asset) => (
                <tr key={asset.symbol} className="hover:bg-[#111c2e]/60 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shadow"
                        style={{ backgroundColor: asset.iconColor }}
                      >
                        {asset.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{asset.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{asset.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {asset.network}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-white">
                    {asset.balance.toFixed(4)} {asset.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-emerald-400 font-bold">
                    ${asset.usdValue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Link
                      href="/transfers"
                      className="px-3 py-1.5 rounded-lg bg-[#142135] hover:bg-blue-600 text-gray-300 hover:text-white text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                    >
                      <span>تجميع</span>
                      <span className="material-symbols-outlined text-xs">call_merge</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
