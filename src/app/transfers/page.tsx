"use client";

import { useState, useEffect, useMemo } from "react";
import { GeneratedWalletData, TransferRecord, SweepExecutionResult } from "@/types/wallet";

export default function TransfersPage() {
  const [wallets, setWallets] = useState<GeneratedWalletData[]>([]);
  const [selectedWalletIds, setSelectedWalletIds] = useState<Set<string>>(new Set());
  const [recentTransfers, setRecentTransfers] = useState<TransferRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [selectedAsset, setSelectedAsset] = useState("USDC");
  const [selectedNetwork, setSelectedNetwork] = useState("Ethereum");
  const [targetAddress, setTargetAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isMaxMode, setIsMaxMode] = useState(false);
  const [gasSpeed, setGasSpeed] = useState<"economic" | "balanced" | "fast">("fast");

  // Sweep Execution modal & state
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepProgress, setSweepProgress] = useState(0);
  const [sweepResult, setSweepResult] = useState<SweepExecutionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchWalletsAndTransfers = async () => {
    setLoading(true);
    try {
      const [walletsRes, transfersRes] = await Promise.all([
        fetch("/api/wallets"),
        fetch("/api/wallets/transfers"),
      ]);

      const walletsData = await walletsRes.json();
      if (walletsData.success && walletsData.wallets) {
        setWallets(walletsData.wallets);
        // Select all by default
        setSelectedWalletIds(new Set(walletsData.wallets.map((w: GeneratedWalletData) => w.id)));
      }

      const transfersData = await transfersRes.json();
      if (transfersData.success && transfersData.transfers) {
        setRecentTransfers(transfersData.transfers);
      }
    } catch (err) {
      console.error("Error fetching transfers data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletsAndTransfers();
  }, []);

  // Toggle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWalletIds(new Set(wallets.map((w) => w.id)));
    } else {
      setSelectedWalletIds(new Set());
    }
  };

  const toggleWallet = (id: string) => {
    setSelectedWalletIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Selected wallets count & total available balance calculation
  const selectedCount = selectedWalletIds.size;
  const allSelected = selectedCount > 0 && selectedCount === wallets.length;

  const totalCalculatedBalance = useMemo(() => {
    let sum = 0;
    wallets.forEach((w) => {
      if (selectedWalletIds.has(w.id)) {
        const balStr = w.balance || "0";
        const numMatch = balStr.match(/[\d,.]+/);
        if (numMatch) {
          sum += parseFloat(numMatch[0].replace(/,/g, "")) || 0;
        }
      }
    });
    return sum;
  }, [wallets, selectedWalletIds]);

  // Handle MAX Button Click
  const handleMaxClick = () => {
    setIsMaxMode(true);
    const gasDeduction =
      selectedAsset === "USDC" || selectedAsset === "USDT"
        ? 0
        : gasSpeed === "fast"
        ? 0.005 * selectedCount
        : 0.002 * selectedCount;
    const maxVal = Math.max(0.001, totalCalculatedBalance - gasDeduction);
    setAmount(maxVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 }));
    showToast(`تم تعيين الحد الأقصى المتاح (${maxVal.toFixed(2)} ${selectedAsset}) مع حساب الغاز`);
  };

  // Handle Form Submit & Execute Sweep
  const handleExecuteSweep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAddress || !targetAddress.trim()) {
      setErrorMessage("يرجى إدخال عنوان المحفظة الهدف المستلم");
      return;
    }
    if (selectedCount === 0) {
      setErrorMessage("يرجى اختيار محفظة واحدة على الأقل كمصدر للتحويل");
      return;
    }

    setErrorMessage(null);
    setIsSweeping(true);
    setSweepProgress(10);
    setSweepResult(null);

    // Progress animation
    const interval = setInterval(() => {
      setSweepProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 250);

    try {
      const res = await fetch("/api/wallets/sweep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceWalletIds: Array.from(selectedWalletIds),
          destinationAddress: targetAddress.trim(),
          asset: selectedAsset,
          network: selectedNetwork,
          amount: amount || undefined,
          isMax: isMaxMode,
          speed: gasSpeed,
        }),
      });

      clearInterval(interval);
      const data = await res.json();

      if (data.success) {
        setSweepProgress(100);
        setSweepResult(data);
        showToast("تم تنفيذ عملية التجميع والتحويل بنجاح!");
        // Refresh transfer history
        fetchWalletsAndTransfers();
      } else {
        throw new Error(data.error || "فشل تنفيذ عملية التجميع");
      }
    } catch (err: any) {
      clearInterval(interval);
      setIsSweeping(false);
      setErrorMessage(err.message || "حدث خطأ أثناء تنفيذ التحويل");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-right font-cairo" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 bg-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Title */}
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          محرك تجميع وتحويل الأرصدة (Fund Sweeper)
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          سحب وتجميع الأصول الرقمية من جميع محافظ التعدين والخزانة دفعة واحدة إلى عنوان رئيسي واحد.
        </p>
      </div>

      {/* Main Grid: Form on Right (5 cols) & History on Left (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Right Side: Sweep & Transfer Form */}
        <div className="lg:col-span-5 bg-[#0b1424] border border-[#18263c] rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleExecuteSweep} className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#18263c]">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span className="material-symbols-outlined text-blue-400">call_merge</span>
                <h3>تجميع أرصدة جديد (Sweep)</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {selectedCount} محفظة محددة
              </span>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Field 1: Cryptocurrency & Network Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  العملة الرقمية (Asset)
                </label>
                <select
                  value={selectedAsset}
                  onChange={(e) => {
                    setSelectedAsset(e.target.value);
                    setIsMaxMode(false);
                    setAmount("");
                  }}
                  className="w-full bg-[#111c2e] border border-[#1e2e45] text-white text-xs rounded-xl px-3 py-2.5 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="USDC">USDC (USD Coin)</option>
                  <option value="USDT">USDT (Tether)</option>
                  <option value="ETH">ETH (Ethereum)</option>
                  <option value="SOL">SOL (Solana)</option>
                  <option value="BTC">BTC (Bitcoin)</option>
                  <option value="TRX">TRX (Tron)</option>
                  <option value="POL">POL (Polygon)</option>
                  <option value="BNB">BNB (BNB Chain)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  شبكة البلوكتشين
                </label>
                <select
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                  className="w-full bg-[#111c2e] border border-[#1e2e45] text-white text-xs rounded-xl px-3 py-2.5 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="Ethereum">Ethereum Mainnet</option>
                  <option value="Solana">Solana Network</option>
                  <option value="Bitcoin">Bitcoin Network</option>
                  <option value="Tron">Tron Network</option>
                  <option value="Polygon">Polygon POS</option>
                  <option value="Arbitrum">Arbitrum One</option>
                  <option value="Base">Base Network</option>
                  <option value="BSC">BNB Chain</option>
                </select>
              </div>
            </div>

            {/* Field 2: Source Wallets Multi-Select Box */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-300">المحافظ المصدر (Source Wallets)</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-blue-400 hover:text-blue-300">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-3.5 h-3.5 accent-blue-600 rounded cursor-pointer"
                  />
                  <span className="text-[11px] font-bold">تحديد الكل ({wallets.length})</span>
                </label>
              </div>

              <div className="bg-[#070e1a] border border-[#18263c] rounded-xl p-2.5 max-h-36 overflow-y-auto space-y-1.5">
                {wallets.length === 0 ? (
                  <p className="text-[11px] text-gray-500 text-center py-2">لا توجد محافظ، يرجى إنشاء محافظ أولاً.</p>
                ) : (
                  wallets.map((wallet) => (
                    <label
                      key={wallet.id}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        selectedWalletIds.has(wallet.id)
                          ? "bg-[#142135] border border-blue-500/30 text-white"
                          : "hover:bg-[#0f1b2d] text-gray-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={selectedWalletIds.has(wallet.id)}
                          onChange={() => toggleWallet(wallet.id)}
                          className="w-3.5 h-3.5 accent-blue-600 rounded cursor-pointer"
                        />
                        <span className="font-bold text-[11px] truncate">{wallet.name}</span>
                      </div>
                      <span className="font-mono text-gray-500 text-[10px]">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Field 3: Target Wallet Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                عنوان المحفظة الهدف (المستلم الرئيسي)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={
                    selectedNetwork === "Solana"
                      ? "أدخل عنوان Solana (Base58...)"
                      : selectedNetwork === "Bitcoin"
                      ? "أدخل عنوان Bitcoin (bc1...)"
                      : selectedNetwork === "Tron"
                      ? "أدخل عنوان Tron (T...)"
                      : "أدخل عنوان EVM (0x...)"
                  }
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  className="w-full bg-[#111c2e] border border-[#1e2e45] text-white font-mono text-xs rounded-xl pr-4 pl-10 py-2.5 focus:border-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const text = await navigator.clipboard.readText().catch(() => "");
                    if (text) setTargetAddress(text.trim());
                  }}
                  className="absolute left-2.5 top-2 text-gray-400 hover:text-blue-400 p-1"
                  title="لصق من الحافظة"
                >
                  <span className="material-symbols-outlined text-base">content_paste</span>
                </button>
              </div>
            </div>

            {/* Field 4: Amount & MAX Option */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-gray-300">الكمية الإجمالية المراد تجميعها</label>
                <div className="text-[11px] text-gray-400 font-mono">
                  المتوفر: <span className="text-white font-bold">{totalCalculatedBalance.toFixed(2)} {selectedAsset}</span>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setIsMaxMode(false);
                  }}
                  className="w-full bg-[#111c2e] border border-[#1e2e45] text-white font-mono font-bold text-sm rounded-xl pr-4 pl-16 py-2.5 focus:border-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="absolute left-2 top-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black px-3 py-1 rounded-lg transition-all shadow-md"
                  title="تحديد كامل الرصيد المتاح وخصم رسوم الغاز تلقائياً"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Field 5: Gas Speed */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-gray-300">
                سرعة المعاملة (الغاز)
              </label>
              <div className="grid grid-cols-3 gap-2 bg-[#070e1a] p-1.5 rounded-xl border border-[#18263c]">
                <button
                  type="button"
                  onClick={() => setGasSpeed("economic")}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    gasSpeed === "economic"
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  اقتصادي
                </button>
                <button
                  type="button"
                  onClick={() => setGasSpeed("balanced")}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    gasSpeed === "balanced"
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  متوازن
                </button>
                <button
                  type="button"
                  onClick={() => setGasSpeed("fast")}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    gasSpeed === "fast"
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  سريع (موصى به)
                </button>
              </div>
            </div>

            {/* Estimated Gas Summary */}
            <div className="bg-[#070e1a] border border-[#18263c] rounded-xl p-3 text-[11px] text-gray-400 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span>رسوم الغاز التقديرية:</span>
                <span className="text-white">
                  {gasSpeed === "fast" ? "0.00085 ETH" : "0.00045 ETH"} لكل محفظة
                </span>
              </div>
              <div className="flex justify-between">
                <span>إجمالي المحافظ المشمولة:</span>
                <span className="text-blue-400 font-bold">{selectedCount} محفظة</span>
              </div>
            </div>

            {/* Submit Sweep Button */}
            <button
              type="submit"
              disabled={isSweeping || selectedCount === 0}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">rocket_launch</span>
              <span>بدء تجميع الأرصدة إلى المحفظة الرئيسية</span>
            </button>
          </form>
        </div>

        {/* Left Side: Recent Transfers & Sweep Execution Log */}
        <div className="lg:col-span-7 space-y-5">
          {/* Real-time Execution Banner / Card */}
          <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <span className="material-symbols-outlined text-lg">history_edu</span>
                </div>
                <h3 className="text-sm font-bold text-white">سجل عمليات التجميع والتحويلات الحديثة</h3>
              </div>
              <button
                onClick={fetchWalletsAndTransfers}
                className="p-1.5 bg-[#142135] text-gray-400 hover:text-white rounded-lg transition-colors"
                title="تحديث السجل"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
              </button>
            </div>

            {/* Transfers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#070e1a] text-gray-400 uppercase border-b border-[#18263c] font-bold">
                  <tr>
                    <th className="px-4 py-3">معرف العملية</th>
                    <th className="px-4 py-3">التاريخ</th>
                    <th className="px-4 py-3">العملة والشبكة</th>
                    <th className="px-4 py-3">المحافظ</th>
                    <th className="px-4 py-3">المبلغ الصافي</th>
                    <th className="px-4 py-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18263c]/60">
                  {recentTransfers.map((item) => (
                    <tr key={item.id} className="hover:bg-[#111c2e]/60 transition-colors font-mono">
                      <td className="px-4 py-3 whitespace-nowrap text-blue-400 font-bold">
                        {item.operationId}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-[11px]">
                        {item.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-bold text-white">
                          <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-[10px]">
                            {item.assetSymbol}
                          </span>
                          <span>{item.asset}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                        {item.sourceWalletsCount} محفظة
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-emerald-400 font-bold">
                        {item.totalAmount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Sweep Execution Progress & Result Modal */}
      {isSweeping && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1424] border border-[#1e2e45] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-fade-in text-right">
            {/* Header */}
            <div className="p-5 border-b border-[#18263c] flex justify-between items-center bg-[#070e1a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <span className="material-symbols-outlined text-2xl">call_merge</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {sweepResult ? "اكتمل تجميع الأرصدة بنجاح" : "جاري تنفيذ عملية التجميع (Sweeping)..."}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    الهدف: {targetAddress.slice(0, 10)}...{targetAddress.slice(-6)}
                  </p>
                </div>
              </div>
              {sweepResult && (
                <button
                  onClick={() => setIsSweeping(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              )}
            </div>

            {/* Progress Body */}
            <div className="p-6 space-y-5">
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-300">نسبة الإنجاز:</span>
                  <span className="text-blue-400 font-bold">{sweepProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#070e1a] rounded-full overflow-hidden border border-[#18263c]">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-400 transition-all duration-300 rounded-full"
                    style={{ width: `${sweepProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Status details when finished */}
              {sweepResult ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-[#070e1a] border border-[#18263c] rounded-xl p-4 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">معرف العملية:</span>
                      <span className="text-blue-400 font-bold">{sweepResult.operationId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">إجمالي المبلغ المحوّل:</span>
                      <span className="text-emerald-400 font-bold">{sweepResult.totalGrossAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">رسوم الغاز المدفوعة:</span>
                      <span className="text-amber-400">{sweepResult.totalGasFees}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#18263c] pt-2">
                      <span className="text-white font-bold">الصافي المستلم:</span>
                      <span className="text-emerald-300 font-bold">{sweepResult.netAmountReceived}</span>
                    </div>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 text-[11px] font-mono">
                    <p className="text-gray-400 font-sans font-bold text-xs pb-1">المعاملات الفردية المنفذة:</p>
                    {sweepResult.transactions.map((tx, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0f1b2d] border border-[#18263c] p-2 rounded-lg flex items-center justify-between"
                      >
                        <span className="text-gray-300">{tx.walletName}</span>
                        <span className="text-emerald-400 font-bold">{tx.amountSent}</span>
                        <span className="text-gray-500 text-[10px] truncate max-w-[120px]">{tx.txHash.slice(0, 10)}...</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <span className="animate-spin material-symbols-outlined text-4xl text-blue-400">
                    progress_activity
                  </span>
                  <p className="text-xs text-gray-300">جاري توقيع المعاملات بالمفاتيح الخاصة وبثها للشبكة...</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {sweepResult && (
              <div className="p-4 border-t border-[#18263c] bg-[#070e1a] flex justify-end">
                <button
                  onClick={() => setIsSweeping(false)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg"
                >
                  تم، إغلاق النافذة
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
