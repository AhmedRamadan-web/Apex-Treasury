"use client";

import { useState, useEffect } from "react";
import { TransferRecord } from "@/types/wallet";
import Link from "next/link";

export default function ReportsPage() {
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  const fetchTransfers = async () => {
    try {
      const res = await fetch("/api/wallets/transfers");
      const data = await res.json();
      if (data.success && data.transfers) {
        setTransfers(data.transfers);
      }
    } catch (e) {
      console.error("Error fetching transfers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleExport = () => {
    if (transfers.length === 0) return;
    const header = "ID,Date,Asset,Network,Target Address,Source Wallets,Total Amount,Gas Fee,Status\n";
    const rows = transfers
      .map(
        (t) =>
          `"${t.operationId}","${t.date}","${t.asset}","${t.network}","${t.targetAddress}","${t.sourceWalletsCount}","${t.totalAmount}","${t.estimatedGasFee}","${t.status}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tadawul-transfers-report-${Date.now()}.csv`;
    link.click();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-right font-cairo" dir="rtl">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-6 bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>تم تصدير التقرير الحقيقي بنجاح (CSV)!</span>
        </div>
      )}

      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            التقارير وسجل عمليات التجميع
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            سجل وتوثيق مباشر لجميع عمليات تجميع وسحب الأرصدة المنفذة بالخزانة.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={transfers.length === 0}
            className="bg-[#111c2e] hover:bg-[#1e293b] border border-[#1e2e45] text-gray-200 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-base text-blue-400">download</span>
            <span>تصدير التقرير (CSV)</span>
          </button>

          <Link
            href="/transfers"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-base">call_merge</span>
            <span>عملية تجميع جديدة</span>
          </Link>
        </div>
      </div>

      {/* Active Operations Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-white">إحصائيات العمليات</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-5 shadow-lg">
            <p className="text-[11px] text-gray-400 font-medium">إجمالي العمليات المنفذة</p>
            <div className="text-2xl font-black text-white font-mono mt-1">
              {transfers.length}
            </div>
            <p className="text-[10px] text-gray-500 mt-2">سجلات حقيقية محفوظة بالسيرفر</p>
          </div>

          <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-5 shadow-lg">
            <p className="text-[11px] text-gray-400 font-medium">المحافظ المجمّع منها</p>
            <div className="text-2xl font-black text-blue-400 font-mono mt-1">
              {transfers.reduce((acc, t) => acc + (t.sourceWalletsCount || 0), 0)}
            </div>
            <p className="text-[10px] text-gray-500 mt-2">محافظ فرعية شاركت في عمليات السحب</p>
          </div>

          <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-5 shadow-lg">
            <p className="text-[11px] text-gray-400 font-medium">حالة المنظومة</p>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>نشطة وجاهزة</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">متصلة بـ 11 شبكة بلوكتشين</p>
          </div>
        </div>
      </section>

      {/* Real Operations Table */}
      <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white">سجل العمليات الحقيقي</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#070e1a] text-gray-400 uppercase border-b border-[#18263c] font-bold">
              <tr>
                <th className="px-6 py-4">معرف العملية</th>
                <th className="px-6 py-4">التاريخ والوقت</th>
                <th className="px-6 py-4">الشبكة والأصل</th>
                <th className="px-6 py-4">العنوان الهدف</th>
                <th className="px-6 py-4">عدد المحافظ</th>
                <th className="px-6 py-4">المبلغ الإجمالي</th>
                <th className="px-6 py-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18263c]/60">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <span className="material-symbols-outlined text-3xl mb-2 text-gray-600 block">
                      inbox
                    </span>
                    <p className="text-xs">لا توجد عمليات تحويل مسجلة حتى الآن.</p>
                    <Link
                      href="/transfers"
                      className="mt-3 inline-block bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      تنفيذ أول عملية تجميع
                    </Link>
                  </td>
                </tr>
              ) : (
                transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-[#111c2e]/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-blue-400">
                      {t.operationId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 font-mono">
                      {t.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-blue-600/10 text-blue-400 font-mono font-bold text-[11px] border border-blue-500/20">
                        {t.asset} ({t.network})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-300">
                      {t.targetAddress.slice(0, 8)}...{t.targetAddress.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-white">
                      {t.sourceWalletsCount} محفظة
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-emerald-400">
                      {t.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
