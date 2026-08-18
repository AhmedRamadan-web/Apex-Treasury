"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { GeneratedWalletData, TransferRecord } from "@/types/wallet";

export default function HomePage() {
  const [wallets, setWallets] = useState<GeneratedWalletData[]>([]);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [wRes, tRes] = await Promise.all([
          fetch("/api/wallets"),
          fetch("/api/wallets/transfers"),
        ]);
        const wData = await wRes.json();
        const tData = await tRes.json();
        if (wData.success && wData.wallets) setWallets(wData.wallets);
        if (tData.success && tData.transfers) setTransfers(tData.transfers);
      } catch (e) {
        console.error("Error loading dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculate real total USD
  const totalUSD = useMemo(() => {
    return wallets.reduce((acc, w) => {
      const num = parseFloat((w.usdValue || "$0").replace(/[^\d.]/g, "")) || 0;
      return acc + num;
    }, 0);
  }, [wallets]);

  return (
    <div className="space-y-6 animate-fade-in text-right font-cairo pb-12" dir="rtl">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            نظرة عامة على الخزانة والتداول
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            متابعة فورية وحية لجميع المحافظ والعمليات عبر شبكات البلوكتشين المتصلة.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/transfers"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            <span className="material-symbols-outlined text-base">call_merge</span>
            <span>تجميع الأرصدة (Sweep)</span>
          </Link>
          <Link
            href="/portfolios"
            className="flex items-center gap-2 bg-[#0b1424] hover:bg-[#142135] border border-[#1e2e45] text-gray-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-base text-blue-400">add_circle</span>
            <span>توليد المحافظ</span>
          </Link>
        </div>
      </div>

      {/* 2. Top 4 Real KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Real USD Assets */}
        <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-md font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>مباشر</span>
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#142135] text-blue-400 flex items-center justify-center border border-[#1e304d]">
              <span className="material-symbols-outlined text-lg">attach_money</span>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-medium text-gray-400">إجمالي قيمة الأصول (USD)</p>
            <div className="mt-1">
              <div className="text-3xl font-black text-white tracking-tight font-mono">
                ${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">محسوب من الأرصدة الحقيقية</p>
          </div>
        </div>

        {/* Card 2: Real Active Wallets Count */}
        <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
              11 شبكة لكل محفظة
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#142135] text-blue-400 flex items-center justify-center border border-[#1e304d]">
              <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-medium text-gray-400">المحافظ المسجلة بالخزانة</p>
            <div className="mt-1">
              <span className="text-3xl font-black text-white tracking-tight font-mono">
                {wallets.length}
              </span>
            </div>
            <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>جاهزة للتعدين والتحويل</span>
            </p>
          </div>
        </div>

        {/* Card 3: Real Completed Transfers */}
        <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-bold px-2 py-0.5 rounded-md">
              عمليات التجميع
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#142135] text-purple-400 flex items-center justify-center border border-[#1e304d]">
              <span className="material-symbols-outlined text-lg">history</span>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-medium text-gray-400">إجمالي عمليات التجميع (Sweeps)</p>
            <div className="mt-1">
              <span className="text-3xl font-black text-white tracking-tight font-mono">
                {transfers.length}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 font-medium">
              {transfers.length > 0 ? "عمليات مكتملة وموثقة" : "لا توجد عمليات سابقة"}
            </p>
          </div>
        </div>

        {/* Card 4: Supported Live Blockchains */}
        <div className="bg-[#0b1424] border border-[#18263c] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-start">
            <div className="w-9 h-9 rounded-xl bg-[#142135] text-blue-400 flex items-center justify-center border border-[#1e304d]">
              <span className="material-symbols-outlined text-lg">hub</span>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-medium text-gray-400">الشبكات المتصلة عبر الـ RPC</p>
            <div className="mt-1">
              <span className="text-3xl font-black text-white tracking-tight font-mono">
                11
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] font-bold text-gray-300 bg-[#121c2d] border border-[#1e2e45] px-1.5 py-0.5 rounded-md font-mono">
                ETH
              </span>
              <span className="text-[10px] font-bold text-gray-300 bg-[#121c2d] border border-[#1e2e45] px-1.5 py-0.5 rounded-md font-mono">
                SOL
              </span>
              <span className="text-[10px] font-bold text-gray-300 bg-[#121c2d] border border-[#1e2e45] px-1.5 py-0.5 rounded-md font-mono">
                BTC
              </span>
              <span className="text-[10px] font-bold text-gray-300 bg-[#121c2d] border border-[#1e2e45] px-1.5 py-0.5 rounded-md font-mono">
                TRX
              </span>
              <span className="text-[10px] font-bold text-gray-300 bg-[#121c2d] border border-[#1e2e45] px-1.5 py-0.5 rounded-md font-mono">
                POL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Overview Grid: Wallets List + Recent Transfers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Right Side: Wallets Preview (Span 6) */}
        <div className="lg:col-span-6 bg-[#0b1424] border border-[#18263c] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400">account_balance_wallet</span>
              <span>المحافظ النشطة بالخزانة</span>
            </h3>
            <Link href="/portfolios" className="text-xs text-blue-400 hover:underline font-bold">
              عرض الكل &larr;
            </Link>
          </div>

          <div className="space-y-2">
            {wallets.length === 0 ? (
              <div className="py-10 text-center text-gray-500 space-y-2">
                <p className="text-xs">لا توجد محافظ منشأة حالياً.</p>
                <Link href="/portfolios" className="inline-block bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl">
                  توليد محفظة جديدة
                </Link>
              </div>
            ) : (
              wallets.slice(0, 5).map((w) => (
                <div
                  key={w.id}
                  className="bg-[#0f1b2d] border border-[#18263c] rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center font-mono text-xs">
                      {w.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{w.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {w.address.slice(0, 8)}...{w.address.slice(-6)}
                      </div>
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <div className="text-xs font-bold text-white">{w.balance || "0.00 ETH"}</div>
                    <div className="text-[10px] text-gray-500">{w.usdValue || "$0.00"}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Left Side: Recent Transfers (Span 6) */}
        <div className="lg:col-span-6 bg-[#0b1424] border border-[#18263c] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400">history</span>
              <span>سجل التحويلات المنفذة</span>
            </h3>
            <Link href="/transfers" className="text-xs text-blue-400 hover:underline font-bold">
              محرك التجميع &larr;
            </Link>
          </div>

          <div className="space-y-2">
            {transfers.length === 0 ? (
              <div className="py-10 text-center text-gray-500 space-y-2">
                <p className="text-xs">لا توجد عمليات تحويل وتجميع منفذة حتى الآن.</p>
                <Link href="/transfers" className="inline-block bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl">
                  بدء تجميع الأرصدة
                </Link>
              </div>
            ) : (
              transfers.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="bg-[#0f1b2d] border border-[#18263c] rounded-xl p-3 flex items-center justify-between font-mono text-xs"
                >
                  <div>
                    <div className="font-bold text-blue-400">{t.operationId}</div>
                    <div className="text-[10px] text-gray-500">{t.date}</div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-emerald-400">{t.totalAmount}</div>
                    <div className="text-[10px] text-gray-500">{t.sourceWalletsCount} محفظة</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
