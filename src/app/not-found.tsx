import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 font-cairo" dir="rtl">
      <div className="w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
        <span className="material-symbols-outlined text-3xl">search_off</span>
      </div>
      <h2 className="text-xl font-bold text-white">الصفحة غير موجودة (404)</h2>
      <p className="text-xs text-gray-400 max-w-sm">
        عذراً، الصفحة التي تحاول الوصول إليها غير موجودة أو تم نقلها.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
