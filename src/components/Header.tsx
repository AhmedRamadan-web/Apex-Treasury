"use client";

import { useState } from "react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full md:w-[calc(100%-260px)] h-16 bg-[#08101d]/95 backdrop-blur-md border-b border-[#182335] flex justify-between items-center px-4 md:px-8 z-40" dir="rtl">
      {/* Search Input Bar (Center/Right in RTL) */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Trigger */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-gray-400 hover:text-white transition-all p-2 rounded-lg"
          aria-label="فتح القائمة"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div className="flex items-center bg-[#0e1726] border border-[#1e2e45] rounded-2xl px-4 py-2 w-72 md:w-[420px] focus-within:border-blue-500 transition-all">
          <input
            type="text"
            placeholder="البحث عن معاملة، أصل، محفظة..."
            className="bg-transparent border-none outline-none text-xs text-white w-full placeholder-gray-400 focus:ring-0 text-right font-medium"
          />
          <span className="material-symbols-outlined text-gray-400 mr-2 text-lg">
            search
          </span>
        </div>
      </div>

      {/* Left side in RTL: User Avatar, Connect Wallet, and Quick Icons */}
      <div className="flex items-center gap-3">
        {/* Profile Avatar */}
        <div className="w-9 h-9 rounded-full ring-1 ring-blue-400/40 shrink-0 cursor-pointer bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-lg">manage_accounts</span>
        </div>

        {/* Connect Wallet Button */}
        <button
          onClick={() => setIsConnected(!isConnected)}
          className={`border font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
            isConnected
              ? "bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300"
              : "bg-[#6366f1]/25 hover:bg-[#6366f1]/35 border-[#6366f1]/40 text-[#c7d2fe] hover:text-white"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`}></span>
          <span>{isConnected ? "متصل بالمحفظة" : "اتصال المحفظة"}</span>
        </button>

        {/* Quick Action Icons */}
        <div className="flex items-center gap-1.5 text-gray-400 mr-1">
          <button
            title="المحفظة"
            className="hover:text-white transition-all p-1.5 rounded-lg hover:bg-[#152238]"
          >
            <span className="material-symbols-outlined text-lg">credit_card</span>
          </button>

          <button
            title="الإشعارات"
            className="hover:text-white transition-all p-1.5 rounded-lg hover:bg-[#152238] relative"
          >
            <span className="material-symbols-outlined text-lg">notifications</span>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          </button>

          <button
            title="المساعدة"
            className="hover:text-white transition-all p-1.5 rounded-lg hover:bg-[#152238]"
          >
            <span className="material-symbols-outlined text-lg">help_outline</span>
          </button>
        </div>
      </div>
    </header>
  );
}



