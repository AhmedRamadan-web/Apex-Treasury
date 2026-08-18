"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div
      className="min-h-[70vh] flex items-center justify-center p-6 text-right font-cairo"
      dir="rtl"
    >
      <div className="bg-[#0b1424] border border-[#1e2e45] rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <span className="material-symbols-outlined text-3xl">warning</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">حدث خطأ غير متوقع</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            حدث استثناء غير متوقع أثناء معالجة الطلب. يمكنك محاولة إعادة المحاولة أو العودة للرئيسية.
          </p>
          {error?.message && (
            <p className="text-[11px] font-mono text-rose-300/80 bg-rose-950/30 p-2 rounded-lg border border-rose-900/30 break-all">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>إعادة المحاولة</span>
          </button>
          <Link
            href="/"
            className="bg-[#111c2e] hover:bg-[#1a293f] border border-[#1e2e45] text-gray-300 text-xs font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
