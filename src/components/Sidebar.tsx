"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "لوحة القيادة", icon: "grid_view" },
    { href: "/portfolios", label: "المحافظ", icon: "account_balance_wallet" },
    { href: "/assets", label: "الأصول الرقمية", icon: "account_balance" },
    { href: "/collections", label: "عمليات التحصيل", icon: "credit_card" },
    { href: "/transfers", label: "التحويلات", icon: "swap_horiz" },
    { href: "/reports", label: "التقارير", icon: "bar_chart" },
    { href: "/settings", label: "الإعدادات", icon: "settings" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 right-0 h-full w-[260px] flex flex-col bg-[#0b1424] border-l border-[#1e293b] shadow-2xl z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-[#1e293b]/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-xl">
                account_balance
              </span>
            </div>
            <div>
              <h1 className="font-headline text-base font-extrabold text-white tracking-wide leading-tight">
                Apex Treasury
              </h1>
              <p className="font-body text-[10px] text-gray-400 mt-0.5">
                إدارة الخزانة المؤسسية
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white p-1 rounded-lg"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 flex flex-col justify-between">
          <div className="space-y-1.5">
            {[
              { href: "/", label: "الرئيسية", icon: "dashboard" },
              { href: "/portfolios", label: "المحافظ", icon: "credit_card" },
              { href: "/assets", label: "الأصول الرقمية", icon: "account_balance" },
              { href: "/collections", label: "عمليات التحصيل", icon: "payments" },
              { href: "/transfers", label: "التحويلات", icon: "swap_horiz" },
              { href: "/reports", label: "التقارير", icon: "bar_chart" },
            ].map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 text-xs font-semibold ${
                    isActive
                      ? "bg-[#0066ff] text-white shadow-md font-bold"
                      : "text-gray-400 hover:bg-[#152033] hover:text-gray-200"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-lg ${
                      isActive ? "filled-icon text-white" : "text-gray-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Bottom Settings Link */}
          <div className="pt-4 border-t border-[#1e293b]/40">
            <Link
              href="/settings"
              onClick={onClose}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 text-xs font-semibold ${
                pathname === "/settings"
                  ? "bg-[#0066ff] text-white shadow-md font-bold"
                  : "text-gray-400 hover:bg-[#152033] hover:text-gray-200"
              }`}
            >
              <span className="material-symbols-outlined text-lg">settings</span>
              <span>الإعدادات</span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}

