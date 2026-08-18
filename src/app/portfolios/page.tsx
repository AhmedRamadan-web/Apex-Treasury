"use client";

import { useState, useMemo, useEffect } from "react";
import AddWalletModal from "@/components/AddWalletModal";
import { GeneratedWalletData, ChainAddressInfo } from "@/types/wallet";

export default function PortfoliosPage() {
  const [wallets, setWallets] = useState<GeneratedWalletData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNetwork, setSelectedNetwork] = useState("جميع الشبكات");
  const [selectedStatus, setSelectedStatus] = useState("الحالة: الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [selectedWalletDetails, setSelectedWalletDetails] = useState<GeneratedWalletData | null>(null);
  const [revealedKeyId, setRevealedKeyId] = useState<string | null>(null);
  const [revealedMnemonicId, setRevealedMnemonicId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRefreshingBalances, setIsRefreshingBalances] = useState(false);

  const itemsPerPage = 10;

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wallets");
      const data = await res.json();
      if (data.success && data.wallets) {
        setWallets(data.wallets);
      }
    } catch (err) {
      console.error("Error fetching wallets:", err);
      showToast("فشل في جلب المحافظ من الخزانة", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleDeleteWallet = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("هل أنت متأكد من حذف هذه المحفظة من الخزانة؟")) return;

    try {
      const res = await fetch("/api/wallets/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setWallets((prev) => prev.filter((w) => w.id !== id));
        showToast("تم حذف المحفظة بنجاح!", "success");
        if (selectedWalletDetails?.id === id) {
          setSelectedWalletDetails(null);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      showToast(err.message || "فشل حذف المحفظة", "error");
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("تحذير: هل أنت متأكد من حذف جميع المحافظ من الخزانة؟ لا يمكن التراجع عن هذا الإجراء.")) return;

    try {
      const res = await fetch("/api/wallets/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteAll: true }),
      });
      const data = await res.json();
      if (data.success) {
        setWallets([]);
        showToast("تم حذف جميع المحافظ بنجاح!", "success");
        setSelectedWalletDetails(null);
      }
    } catch (err: any) {
      showToast("فشل حذف المحافظ", "error");
    }
  };

  const handleRefreshBalances = async () => {
    setIsRefreshingBalances(true);
    try {
      const res = await fetch("/api/wallets/balances", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchWallets();
        showToast("تم تحديث أرصدة جميع المحافظ بنجاح!", "success");
      }
    } catch (err) {
      showToast("فشل تحديث الأرصدة", "error");
    } finally {
      setIsRefreshingBalances(false);
    }
  };

  const handleCopy = (text: string, label: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    showToast(`تم نسخ ${label} بنجاح!`, "success");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filtered list
  const filteredWallets = useMemo(() => {
    return wallets.filter((w) => {
      const matchSearch =
        !searchQuery ||
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchNetwork =
        selectedNetwork === "جميع الشبكات" || w.network === selectedNetwork;
      const matchStatus =
        selectedStatus === "الحالة: الكل" || (w.status || "نشط") === selectedStatus;
      return matchSearch && matchNetwork && matchStatus;
    });
  }, [wallets, searchQuery, selectedNetwork, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredWallets.length / itemsPerPage) || 1;
  const paginatedWallets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredWallets.slice(start, start + itemsPerPage);
  }, [filteredWallets, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6 animate-fade-in text-right font-cairo" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 left-6 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-bounce ${
            toastMessage.type === "success"
              ? "bg-emerald-600"
              : toastMessage.type === "error"
              ? "bg-rose-600"
              : "bg-blue-600"
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toastMessage.type === "success" ? "check_circle" : "info"}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Title & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            إدارة المحافظ والخزانة
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            إنشاء واشتقاق وإدارة محافظ البلوكتشين المتعددة الـ 11 من واجهة خزانة موحدة.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>توليد / استيراد محفظة</span>
          </button>

          <div className="flex items-center bg-[#0b1424] border border-[#1e2e45] rounded-xl p-0.5">
            <a
              href="/api/wallets/export?format=txt"
              target="_blank"
              download
              className="px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#142135] rounded-lg transition-colors flex items-center gap-1"
              title="تصدير كملف نصي منسق"
            >
              <span className="material-symbols-outlined text-sm text-blue-400">download</span>
              <span>TXT</span>
            </a>
            <span className="text-gray-600">|</span>
            <a
              href="/api/wallets/export?format=csv"
              target="_blank"
              download
              className="px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#142135] rounded-lg transition-colors flex items-center gap-1"
              title="تصدير جدول CSV"
            >
              <span>CSV</span>
            </a>
            <span className="text-gray-600">|</span>
            <a
              href="/api/wallets/export?format=json"
              target="_blank"
              download
              className="px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#142135] rounded-lg transition-colors flex items-center gap-1"
              title="تصدير JSON"
            >
              <span>JSON</span>
            </a>
          </div>

          <button
            onClick={handleRefreshBalances}
            disabled={isRefreshingBalances}
            className="p-2.5 bg-[#0b1424] hover:bg-[#142135] border border-[#1e2e45] text-gray-300 rounded-xl transition-colors"
            title="تحديث الأرصدة عبر الشبكات"
          >
            <span className={`material-symbols-outlined text-base ${isRefreshingBalances ? "animate-spin text-blue-400" : ""}`}>
              sync
            </span>
          </button>

          {wallets.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="p-2.5 bg-[#0b1424] hover:bg-rose-500/20 border border-[#1e2e45] hover:border-rose-500/40 text-rose-400 rounded-xl transition-colors"
              title="حذف جميع المحافظ"
            >
              <span className="material-symbols-outlined text-base">delete_sweep</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Overview Stats Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-gray-400">إجمالي المحافظ المسجلة</p>
            <div className="text-2xl font-black text-white font-mono mt-1">{wallets.length} محفظة</div>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>11 شبكة مشتقة لكل محفظة</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
          </div>
        </div>

        <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-gray-400">حالة المزامنة والربط</p>
            <div className="text-2xl font-black text-white font-mono mt-1">نشط ومحدث</div>
            <p className="text-[11px] text-gray-400 mt-1">تزامن فوري مع السيرفر المحلي</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <span className="material-symbols-outlined text-2xl">cloud_done</span>
          </div>
        </div>

        <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-gray-400">إجمالي الأصول المقدرة</p>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              ${wallets.reduce((acc, w) => {
                const num = parseFloat((w.usdValue || "$0").replace(/[^\d.]/g, "")) || 0;
                return acc + num;
              }, 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">رصيد حي من البلوكتشين</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <span className="material-symbols-outlined text-2xl">savings</span>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="بحث بالاسم أو العنوان (0x...)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#111c2e] border border-[#1e2e45] text-white text-xs rounded-xl pr-10 pl-4 py-2.5 focus:border-blue-500 outline-none"
          />
          <span className="material-symbols-outlined text-gray-400 absolute right-3 top-2.5 text-lg">
            search
          </span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <select
            value={selectedNetwork}
            onChange={(e) => {
              setSelectedNetwork(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#111c2e] border border-[#1e2e45] text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="جميع الشبكات">جميع الشبكات</option>
            <option value="Ethereum">Ethereum</option>
            <option value="Polygon">Polygon</option>
            <option value="Arbitrum">Arbitrum</option>
            <option value="BSC">BNB Chain</option>
            <option value="Solana">Solana</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#111c2e] border border-[#1e2e45] text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="الحالة: الكل">الحالة: الكل</option>
            <option value="نشط">نشط</option>
            <option value="تحديث مطلوب">تحديث مطلوب</option>
            <option value="قيد المزامنة">قيد المزامنة</option>
          </select>

          <span className="text-xs text-gray-400 font-mono">
            {filteredWallets.length} محفظة مطابقة
          </span>
        </div>
      </div>

      {/* Wallets Table List */}
      <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-3">
            <span className="animate-spin material-symbols-outlined text-3xl text-blue-400">progress_activity</span>
            <p className="text-xs">جاري تحميل المحافظ من الخزانة...</p>
          </div>
        ) : filteredWallets.length === 0 ? (
          <div className="py-16 text-center text-gray-400 space-y-3">
            <span className="material-symbols-outlined text-4xl text-gray-600">account_balance_wallet</span>
            <p className="text-sm font-bold text-gray-300">لا توجد محافظ مطابقة</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              توليد محفظة جديدة الآن
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#070e1a] text-gray-400 uppercase border-b border-[#18263c] font-bold">
                <tr>
                  <th className="px-6 py-4">المحفظة</th>
                  <th className="px-6 py-4">العنوان الرئيسي (EVM)</th>
                  <th className="px-6 py-4">الشبكات الـ 11</th>
                  <th className="px-6 py-4">الرصيد التقديري</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18263c]/60">
                {paginatedWallets.map((wallet) => (
                  <tr
                    key={wallet.id}
                    onClick={() => setSelectedWalletDetails(wallet)}
                    className="hover:bg-[#111c2e]/60 transition-colors cursor-pointer group"
                  >
                    {/* Wallet Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/50 transition-colors">
                          <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs group-hover:text-blue-400 transition-colors">
                            {wallet.name}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                            {wallet.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* EVM Address */}
                    <td className="px-6 py-4 whitespace-nowrap font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 font-semibold">
                          {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(wallet.address, "عنوان المحفظة", `addr_${wallet.id}`);
                          }}
                          className="text-gray-500 hover:text-blue-400 p-1"
                          title="نسخ العنوان"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {copiedKey === `addr_${wallet.id}` ? "check" : "content_copy"}
                          </span>
                        </button>
                      </div>
                    </td>

                    {/* 11-Chains Badges */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                        <span className="px-1.5 py-0.5 rounded bg-[#16243a] text-[10px] font-bold text-blue-300 font-mono">ETH</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#16243a] text-[10px] font-bold text-amber-300 font-mono">BTC</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#16243a] text-[10px] font-bold text-purple-300 font-mono">SOL</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#16243a] text-[10px] font-bold text-red-300 font-mono">TRX</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#16243a] text-[10px] font-bold text-gray-400 font-mono">+7 أخرى</span>
                      </div>
                    </td>

                    {/* Balance */}
                    <td className="px-6 py-4 whitespace-nowrap font-mono">
                      <div className="font-bold text-white">{wallet.balance || "ETH 25.0"}</div>
                      <div className="text-[10px] text-gray-400">{wallet.usdValue || "$65,000.00"}</div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>{wallet.status || "نشط"}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedWalletDetails(wallet)}
                          className="px-2.5 py-1 rounded-lg bg-[#142135] hover:bg-blue-600 text-gray-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          <span>تفاصيل الـ 11 شبكة</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteWallet(wallet.id, e)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                          title="حذف المحفظة"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredWallets.length > itemsPerPage && (
          <div className="p-4 border-t border-[#18263c] flex items-center justify-between text-xs text-gray-400 bg-[#070e1a]">
            <div>
              عرض {Math.min((currentPage - 1) * itemsPerPage + 1, filteredWallets.length)} إلى{" "}
              {Math.min(currentPage * itemsPerPage, filteredWallets.length)} من إجمالي{" "}
              {filteredWallets.length} محفظة
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-[#111c2e] border border-[#1e2e45] disabled:opacity-40 text-white"
              >
                السابق
              </button>
              <span className="font-mono text-white px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-[#111c2e] border border-[#1e2e45] disabled:opacity-40 text-white"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Chain Details Drawer / Modal */}
      {selectedWalletDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1424] border border-[#1e2e45] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in text-right">
            {/* Header */}
            <div className="p-5 border-b border-[#18263c] flex justify-between items-center bg-[#070e1a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <span className="material-symbols-outlined text-2xl">shield</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedWalletDetails.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    ID: {selectedWalletDetails.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWalletDetails(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Content Scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Private Key & Seed Phrase Security Box */}
              <div className="bg-[#070e1a] border border-[#1e2e45] rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">lock</span>
                  <span>بيانات الأمان والمفاتيح الخاصة</span>
                </h4>

                {/* Seed Phrase */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-400">عبارة الاسترداد (Seed Phrase):</span>
                    <button
                      onClick={() =>
                        setRevealedMnemonicId(
                          revealedMnemonicId === selectedWalletDetails.id ? null : selectedWalletDetails.id
                        )
                      }
                      className="text-blue-400 hover:underline font-bold"
                    >
                      {revealedMnemonicId === selectedWalletDetails.id ? "إخفاء" : "إظهار الكلمات الـ 12"}
                    </button>
                  </div>
                  <div className="relative bg-[#0f1b2d] border border-[#18263c] rounded-xl p-2.5 font-mono text-xs text-white">
                    {revealedMnemonicId === selectedWalletDetails.id ? (
                      <p className="leading-relaxed">{selectedWalletDetails.mnemonic}</p>
                    ) : (
                      <p className="text-gray-500 tracking-widest">•••••••• •••••••• •••••••• •••••••• •••••••• ••••••••</p>
                    )}
                    {revealedMnemonicId === selectedWalletDetails.id && (
                      <button
                        onClick={() => handleCopy(selectedWalletDetails.mnemonic, "عبارة الاسترداد", "mnemonic")}
                        className="absolute left-2 top-2 text-gray-400 hover:text-blue-400 p-1"
                        title="نسخ العبارة"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Private Key */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-400">المفتاح الخاص (Private Key):</span>
                    <button
                      onClick={() =>
                        setRevealedKeyId(
                          revealedKeyId === selectedWalletDetails.id ? null : selectedWalletDetails.id
                        )
                      }
                      className="text-blue-400 hover:underline font-bold"
                    >
                      {revealedKeyId === selectedWalletDetails.id ? "إخفاء" : "إظهار المفتاح"}
                    </button>
                  </div>
                  <div className="relative bg-[#0f1b2d] border border-[#18263c] rounded-xl p-2.5 font-mono text-xs text-white truncate">
                    {revealedKeyId === selectedWalletDetails.id ? (
                      <p>{selectedWalletDetails.privateKey}</p>
                    ) : (
                      <p className="text-gray-500 tracking-widest">0x••••••••••••••••••••••••••••••••••••••••••••••••</p>
                    )}
                    {revealedKeyId === selectedWalletDetails.id && (
                      <button
                        onClick={() => handleCopy(selectedWalletDetails.privateKey, "المفتاح الخاص", "pkey")}
                        className="absolute left-2 top-2 text-gray-400 hover:text-blue-400 p-1"
                        title="نسخ المفتاح الخاص"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* All 11 Derived Multi-Chain Addresses */}
              <div>
                <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-blue-400">hub</span>
                  <span>العناوين المشتقة لجميع الشبكات (11 شبكة متوافقة مع MetaMask)</span>
                </h4>

                <div className="space-y-2">
                  {selectedWalletDetails.addresses.map((chainAddr) => (
                    <div
                      key={`${chainAddr.chain}-${chainAddr.index}`}
                      className="bg-[#0f1b2d] border border-[#18263c] rounded-xl p-3 flex items-center justify-between hover:border-blue-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-20 text-[11px] font-bold text-gray-200">
                          {chainAddr.chain}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#16243a] text-blue-300 font-mono">
                          {chainAddr.path}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-xs text-gray-300">
                        <span className="truncate max-w-[220px] md:max-w-[280px]">
                          {chainAddr.address}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(
                              chainAddr.address,
                              `عنوان ${chainAddr.chain}`,
                              `chain_${chainAddr.chain}`
                            )
                          }
                          className="text-gray-400 hover:text-blue-400 p-1"
                          title="نسخ العنوان"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {copiedKey === `chain_${chainAddr.chain}` ? "check" : "content_copy"}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#18263c] bg-[#070e1a] flex justify-between items-center">
              <button
                onClick={() => handleDeleteWallet(selectedWalletDetails.id)}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold"
              >
                حذف المحفظة
              </button>
              <button
                onClick={() => setSelectedWalletDetails(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Wallet Modal */}
      <AddWalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWalletAdded={() => {
          fetchWallets();
          showToast("تمت إضافة المحافظ بنجاح إلى الخزانة!", "success");
        }}
      />
    </div>
  );
}
