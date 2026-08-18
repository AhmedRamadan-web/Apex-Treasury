"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [activeSubTab, setActiveSubTab] = useState<"system" | "rules" | "security" | "team">("rules");

  // Tab 1: System State
  const [defaultNetwork, setDefaultNetwork] = useState("Ethereum Mainnet");
  const [rpcUrl, setRpcUrl] = useState("https://eth.llamarpc.com");
  const [autoSyncWs, setAutoSyncWs] = useState(true);
  const [pollingInterval, setPollingInterval] = useState("15");
  const [maxGasFeeGwei, setMaxGasFeeGwei] = useState("35");
  const [priorityFeeGwei, setPriorityFeeGwei] = useState("2.5");

  // Tab 2: Rules State
  const [minBalance, setMinBalance] = useState("10,000.00");
  const [gasStrategy, setGasStrategy] = useState<"economic" | "balanced" | "fast">("balanced");
  const [scheduleType, setScheduleType] = useState<"scheduled" | "instant">("scheduled");
  const [notifySuccess, setNotifySuccess] = useState(true);
  const [notifyFailure, setNotifyFailure] = useState(true);

  // Tab 3: Security State
  const [multiSigThreshold, setMultiSigThreshold] = useState("3/5");
  const [whitelistOnly, setWhitelistOnly] = useState(true);
  const [timelockHours, setTimelockHours] = useState("24");
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState("30");

  // Tab 4: Team State
  const [teamMembers, setTeamMembers] = useState<{id:string;name:string;email:string;role:string;status:string;avatarBg:string}[]>([]);
  const [auditLogEnabled, setAuditLogEnabled] = useState(true);

  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-right" dir="rtl">
      {/* Toast Notification */}
      {showSavedToast && (
        <div className="fixed bottom-6 left-6 bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>تم حفظ التغييرات والإعدادات بنجاح!</span>
        </div>
      )}

      {/* Page Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          الإعدادات الموحدة
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          قم بإدارة تفضيلات النظام، قواعد الأتمتة، وإعدادات الأمان الخاصة بالخزانة.
        </p>
      </div>

      {/* Main Settings Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Right Sub-Navigation Menu (Span 3) */}
        <div className="lg:col-span-3 space-y-2">
          <button
            type="button"
            onClick={() => setActiveSubTab("system")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === "system"
                ? "bg-[#131e2e] border border-[#22334a] text-white shadow-sm font-bold border-r-2 border-r-blue-500"
                : "text-gray-400 hover:bg-[#0b1626] hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg text-blue-400">tune</span>
              <span>تحكم النظام</span>
            </div>
            {activeSubTab === "system" && (
              <span className="text-gray-500 text-xs">&lt;</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("rules")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === "rules"
                ? "bg-[#131e2e] border border-[#22334a] text-white shadow-sm font-bold border-r-2 border-r-blue-500"
                : "text-gray-400 hover:bg-[#0b1626] hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg text-blue-400">alt_route</span>
              <span>قواعد التحصيل</span>
            </div>
            {activeSubTab === "rules" && (
              <span className="text-gray-500 text-xs">&lt;</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("security")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === "security"
                ? "bg-[#131e2e] border border-[#22334a] text-white shadow-sm font-bold border-r-2 border-r-blue-500"
                : "text-gray-400 hover:bg-[#0b1626] hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg text-blue-400">shield</span>
              <span>الأمان</span>
            </div>
            {activeSubTab === "security" && (
              <span className="text-gray-500 text-xs">&lt;</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("team")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === "team"
                ? "bg-[#131e2e] border border-[#22334a] text-white shadow-sm font-bold border-r-2 border-r-blue-500"
                : "text-gray-400 hover:bg-[#0b1626] hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg text-blue-400">group</span>
              <span>إدارة الفريق</span>
            </div>
            {activeSubTab === "team" && (
              <span className="text-gray-500 text-xs">&lt;</span>
            )}
          </button>
        </div>

        {/* Left Main Settings Form (Span 9) */}
        <div className="lg:col-span-9 bg-[#0b1626] border border-[#1e293b] rounded-2xl p-6 shadow-sm space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* ======================================================== */}
            {/* TAB 1: SYSTEM CONTROL (تحكم النظام)                      */}
            {/* ======================================================== */}
            {activeSubTab === "system" && (
              <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-[#1e293b]/60 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">إعدادات تحكم النظام والشبكات</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      تكوين معايير البلوك تشين، استعلام البيانات والاتصال بالعقد الذكية.
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">tune</span>
                  </div>
                </div>

                {/* Card: Default Network & RPC */}
                <div className="bg-[#081220] border border-[#1e293b] rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-white">الشبكة الأساسية ونقطة RPC</h4>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      متصل - RPC جاهز
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">الشبكة الافتراضية</label>
                      <select
                        value={defaultNetwork}
                        onChange={(e) => setDefaultNetwork(e.target.value)}
                        className="w-full bg-[#0d1726] border border-[#1e2e45] rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="Ethereum Mainnet">Ethereum Mainnet (Chain ID: 1)</option>
                        <option value="Arbitrum One">Arbitrum One (Chain ID: 42161)</option>
                        <option value="Polygon POS">Polygon POS (Chain ID: 137)</option>
                        <option value="Base">Base Mainnet (Chain ID: 8453)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">RPC Endpoint URL</label>
                      <input
                        type="text"
                        value={rpcUrl}
                        onChange={(e) => setRpcUrl(e.target.value)}
                        className="w-full bg-[#0d1726] border border-[#1e2e45] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Card: Sync & Polling */}
                <div className="bg-[#081220] border border-[#1e293b] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white">المزامنة واستعلام الأرصدة</h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">المزامنة التلقائية اللحظية (WebSocket)</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          تحديث الأرصدة والأسعار فور وصول كتل جديدة على الشبكة.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={autoSyncWs}
                        onChange={(e) => setAutoSyncWs(e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]/50">
                      <div>
                        <p className="text-xs font-bold text-white">فترة الاستعلام الاحتياطي (Polling Interval)</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          إعادة جلب بيانات المحافظ دورياً للتأكد من عدم فقدان أي حدث.
                        </p>
                      </div>
                      <select
                        value={pollingInterval}
                        onChange={(e) => setPollingInterval(e.target.value)}
                        className="bg-[#0d1726] border border-[#1e2e45] rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                      >
                        <option value="15">كل 15 ثانية</option>
                        <option value="30">كل 30 ثانية</option>
                        <option value="60">كل دقيقة</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Card: Global Gas Limits */}
                <div className="bg-[#081220] border border-[#1e293b] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white">الحدود القصوى لرسوم الغاز العامة</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">الحد الأقصى للرسوم الأساسية (Max Base Fee)</label>
                      <div className="flex items-center bg-[#0d1726] border border-[#1e2e45] rounded-xl px-3 py-2">
                        <span className="text-xs font-mono font-bold text-gray-400 pl-2 border-l border-[#1e2e45]">Gwei</span>
                        <input
                          type="number"
                          value={maxGasFeeGwei}
                          onChange={(e) => setMaxGasFeeGwei(e.target.value)}
                          className="bg-transparent border-none outline-none text-xs font-mono font-bold text-white w-full pr-2 text-right"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">رسوم الأولوية القصوى (Priority Fee)</label>
                      <div className="flex items-center bg-[#0d1726] border border-[#1e2e45] rounded-xl px-3 py-2">
                        <span className="text-xs font-mono font-bold text-gray-400 pl-2 border-l border-[#1e2e45]">Gwei</span>
                        <input
                          type="number"
                          value={priorityFeeGwei}
                          onChange={(e) => setPriorityFeeGwei(e.target.value)}
                          className="bg-transparent border-none outline-none text-xs font-mono font-bold text-white w-full pr-2 text-right"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: COLLECTION RULES (قواعد التحصيل)                    */}
            {/* ======================================================== */}
            {activeSubTab === "rules" && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Section */}
                <div className="flex items-start justify-between border-b border-[#1e293b]/60 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">إعدادات قواعد التحصيل</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      تكوين المعلمات الآلية لتجميع الأصول وإدارة الرسوم.
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">auto_fix_high</span>
                  </div>
                </div>

                {/* Card 1: Minimum Balance Threshold */}
                <div className="bg-[#081220] border border-[#1e293b] rounded-xl p-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">الحد الأدنى للرصيد للتحصيل</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      لن يتم تحصيل المحافظ الفرعية التي يقل رصيدها عن هذا الحد لتوفير رسوم الغاز.
                    </p>
                  </div>

                  <div className="flex items-center bg-[#0d1726] border border-[#1e2e45] rounded-xl px-3.5 py-2 w-full focus-within:border-blue-500">
                    <span className="text-xs font-bold text-gray-400 pl-3 border-l border-[#1e2e45]">
                      USDT
                    </span>
                    <input
                      type="text"
                      value={minBalance}
                      onChange={(e) => setMinBalance(e.target.value)}
                      className="bg-transparent border-none outline-none text-xs font-mono font-bold text-white w-full pr-3 text-right"
                    />
                  </div>
                </div>

                {/* Card 2: Gas Fee Strategy */}
                <div className="bg-[#081220] border border-[#1e293b] rounded-xl p-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">استراتيجية رسوم الغاز</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      حدد مدى سرعة تنفيذ المعاملات بناءً على تكلفة الغاز الحالية في الشبكة.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[#0d1726] p-1 rounded-xl border border-[#1e2e45]">
                    <button
                      type="button"
                      onClick={() => setGasStrategy("fast")}
                      className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        gasStrategy === "fast"
                          ? "bg-[#1a293d] border border-[#2a3f5a] text-white shadow"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm text-amber-400">bolt</span>
                      <span>سريع</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGasStrategy("balanced")}
                      className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        gasStrategy === "balanced"
                          ? "bg-[#1a293d] border border-[#2a3f5a] text-white shadow"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm text-blue-400">balance</span>
                      <span>متوازن</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGasStrategy("economic")}
                      className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        gasStrategy === "economic"
                          ? "bg-[#1a293d] border border-[#2a3f5a] text-white shadow"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm text-emerald-400">shield</span>
                      <span>اقتصادي</span>
                    </button>
                  </div>
                </div>

                {/* Card 3: Collection Schedule */}
                <div className="bg-[#081220] border border-[#1e293b] rounded-xl p-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">جدول التحصيل</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      متى يجب أن يقوم النظام بنقل الأصول المتاحة إلى المحفظة الرئيسية؟
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Option 1: Scheduled Daily */}
                    <div
                      onClick={() => setScheduleType("scheduled")}
                      className={`border rounded-xl p-3.5 cursor-pointer transition-all ${
                        scheduleType === "scheduled"
                          ? "bg-[#0d1a2d] border-blue-500/60 shadow-sm"
                          : "bg-[#0d1726] border-[#1e2e45] hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-blue-400 text-base">
                          calendar_today
                        </span>
                        <h5 className="text-xs font-bold text-white">مجدول (يومياً)</h5>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        تجميع العمليات وتنفيذها مرة واحدة في نهاية اليوم لتقليل الرسوم.
                      </p>
                    </div>

                    {/* Option 2: Instant */}
                    <div
                      onClick={() => setScheduleType("instant")}
                      className={`border rounded-xl p-3.5 cursor-pointer transition-all ${
                        scheduleType === "instant"
                          ? "bg-[#0d1a2d] border-blue-500/60 shadow-sm"
                          : "bg-[#0d1726] border-[#1e2e45] hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-gray-400 text-base">
                          schedule
                        </span>
                        <h5 className="text-xs font-bold text-white">فوري</h5>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        تحويل الأصول بمجرد تجاوزها للحد الأدنى المسموح به.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 4: Collection Notifications */}
                <div className="bg-[#081220] border border-[#1e293b] rounded-xl p-4 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-white">إشعارات التحصيل</h4>
                  </div>

                  <div className="space-y-3">
                    {/* Item 1 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">إشعار عند نجاح التحصيل</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          تلقي تنبيه عند وصول الأصول للمحفظة الرئيسية.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifySuccess}
                        onChange={(e) => setNotifySuccess(e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                      />
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]/50">
                      <div>
                        <p className="text-xs font-bold text-white">إشعار عند فشل العملية</p>
                        <p className="text-[11px] text-rose-500 mt-0.5 font-medium">
                          تنبيه عاجل في حال تعطل التحويل بسبب الرسوم أو أخطاء الشبكة.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifyFailure}
                        onChange={(e) => setNotifyFailure(e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: SECURITY & MULTI-SIG (الأمان)                      */}
            {/* ======================================================== */}
            {activeSubTab === "security" && (
              <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-[#1e293b]/60 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">إعدادات الأمان والموافقة Multi-Sig</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      تحديد قواعد التوقيع المتعدد، المحافظ المعتمدة، وإجراءات حماية الخزانة.
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">shield</span>
                  </div>
                </div>

                {/* Card: Multi-Sig Threshold */}
                <div className="bg-[#081220] border border-[#1e293b] rounded-xl p-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">قواعد التوقيع المتعدد (Multi-Signature)</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      عدد التوقيعات المشتركة المطلوبة للموافقة على التحويلات المالية الكبيرة.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {["2/5", "3/5", "4/5"].map((th) => (
                      <button
                        key={th}
                        type="button"
                        onClick={() => setMultiSigThreshold(th)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          multiSigThreshold === th
                            ? "bg-[#1a293d] border border-blue-500/60 text-white shadow"
                            : "bg-[#0d1726] border border-[#1e2e45] text-gray-400 hover:text-white"
                        }`}
                      >
                        <span>{th === "3/5" ? `${th} (موصى به)` : th}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card: Whitelist & Time-lock */}
                <div className="bg-[#081220] border border-[#1e293b] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white">القائمة البيضاء وفترة التجميد</h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">تقييد التحويلات على العناوين المعتمدة فقط</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          منع إرسال أي أموال خارج قائمة العناوين الموثقة مسبقاً.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={whitelistOnly}
                        onChange={(e) => setWhitelistOnly(e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]/50">
                      <div>
                        <p className="text-xs font-bold text-white">فترة التجميد الأمني (Time-Lock Delay)</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          فترة انتظار إلزامية قبل تفعيل أي عنوان جديد بالقائمة البيضاء.
                        </p>
                      </div>
                      <select
                        value={timelockHours}
                        onChange={(e) => setTimelockHours(e.target.value)}
                        className="bg-[#0d1726] border border-[#1e2e45] rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                      >
                        <option value="12">12 ساعة</option>
                        <option value="24">24 ساعة (افتراضي)</option>
                        <option value="48">48 ساعة</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Card: 2FA & Session Security */}
                <div className="bg-[#081220] border border-[#1e293b] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white">المصادقة وأمن الجلسات</h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">المصادقة الثنائية (2FA Hardware / App)</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          إلزامية لجميع عمليات السحب والتغيير في الصلاحيات.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={twoFactorAuth}
                        onChange={(e) => setTwoFactorAuth(e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]/50">
                      <div>
                        <p className="text-xs font-bold text-white">مهلة انتهاء الجلسة عند الخمول</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          تسجيل الخروج التلقائي لحماية الواجهة من الوصول غير المصرح.
                        </p>
                      </div>
                      <select
                        value={sessionTimeoutMins}
                        onChange={(e) => setSessionTimeoutMins(e.target.value)}
                        className="bg-[#0d1726] border border-[#1e2e45] rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                      >
                        <option value="15">15 دقيقة</option>
                        <option value="30">30 دقيقة</option>
                        <option value="60">ساعة واحدة</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: TEAM MANAGEMENT (إدارة الفريق)                     */}
            {/* ======================================================== */}
            {activeSubTab === "team" && (
              <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-[#1e293b]/60 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">إدارة أعضاء الفريق والصلاحيات</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      إدارة مستخدمي الخزانة وتعيين أدوار الوصول ومستويات الإشراف.
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">group</span>
                  </div>
                </div>

                {/* Team Members List */}
                <div className="bg-[#081220] border border-[#1e293b] rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-white">أعضاء الفريق المعتمدين ({teamMembers.length})</h4>
                    <button
                      type="button"
                      onClick={() => {
                        const name = prompt("اسم العضو:");
                        const email = prompt("البريد الإلكتروني:");
                        const role = prompt("الدور الوظيفي:");
                        if (name && email && role) {
                          const colors = ["bg-blue-600", "bg-purple-600", "bg-emerald-600", "bg-rose-600", "bg-amber-600"];
                          setTeamMembers(prev => [...prev, {
                            id: Date.now().toString(),
                            name, email, role,
                            status: "نشط",
                            avatarBg: colors[prev.length % colors.length]
                          }]);
                        }
                      }}
                      className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[11px] font-bold px-3 py-1 rounded-lg border border-blue-500/30 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      <span>إضافة عضو جديد</span>
                    </button>
                  </div>

                  {teamMembers.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <span className="material-symbols-outlined text-4xl text-gray-600">group_add</span>
                      <p className="text-xs text-gray-500">لا يوجد أعضاء فريق مضافون حتى الآن.</p>
                      <p className="text-[11px] text-gray-600">اضغط على "إضافة عضو جديد" لإضافة أعضاء الفريق.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#1e293b]/60">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${member.avatarBg} text-white font-bold text-xs flex items-center justify-center`}>
                              {member.name.slice(0, 1)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{member.name}</p>
                              <p className="text-[11px] text-gray-400 font-mono">{member.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#131e2e] text-blue-300 border border-[#22334a] text-[10px] font-semibold">
                              {member.role}
                            </span>
                            <button
                              type="button"
                              title="حذف العضو"
                              onClick={() => setTeamMembers(prev => prev.filter(m => m.id !== member.id))}
                              className="text-gray-400 hover:text-rose-400 p-1 transition-colors"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card: Audit Log Policy */}
                <div className="bg-[#081220] border border-[#1e293b] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white">سجلات التدقيق والمطابقة (Audit Log)</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">تسجيل مسار التدقيق لجميع الأنشطة (Audit Trail)</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        حفظ سجل غير قابل للتعديل لجميع العمليات والتعديلات المنفذة بواسطة الفريق.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={auditLogEnabled}
                      onChange={(e) => setAuditLogEnabled(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="bg-[#5b5bd6] hover:bg-[#4f46e5] text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>حفظ التغييرات</span>
              </button>

              <button
                type="button"
                className="bg-[#111c2e] hover:bg-[#1e293b] border border-[#1e293b] text-gray-300 text-xs font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


