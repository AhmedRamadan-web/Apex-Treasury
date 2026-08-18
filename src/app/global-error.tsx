"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#081425] text-white font-sans min-h-screen flex items-center justify-center p-6">
        <div className="bg-[#0b1424] border border-[#1e2e45] rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
            <span className="text-3xl">⚠️</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">خطأ عام في النظام</h2>
            <p className="text-xs text-gray-400">
              يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg cursor-pointer"
          >
            إعادة التحميل
          </button>
        </div>
      </body>
    </html>
  );
}
