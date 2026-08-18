"use client";

import { useState } from "react";

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletAdded: () => void;
}

export default function AddWalletModal({
  isOpen,
  onClose,
  onWalletAdded,
}: AddWalletModalProps) {
  const [activeTab, setActiveTab] = useState<"generate" | "batch" | "seed" | "privateKey" | "file">("generate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Single Generate
  const [walletName, setWalletName] = useState("");

  // Batch Generate
  const [batchCount, setBatchCount] = useState<number>(5);

  // Seed Phrase Import
  const [seedPhrase, setSeedPhrase] = useState("");
  const [seedName, setSeedName] = useState("");

  // Private Key Import
  const [privateKey, setPrivateKey] = useState("");
  const [keyName, setKeyName] = useState("");

  // File Import
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileFormat, setFileFormat] = useState<"json" | "csv" | "txt">("json");
  const [importResult, setImportResult] = useState<{ imported: number; failed: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  const handleGenerateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wallets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: walletName.trim() || undefined }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "فشل إنشاء المحفظة");
      onWalletAdded();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wallets/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: batchCount }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "فشل إنشاء دفعة المحافظ");
      onWalletAdded();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportSeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedPhrase.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wallets/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seedPhrase: seedPhrase.trim(),
          name: seedName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "فشل استيراد المحفظة");
      onWalletAdded();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportPrivateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privateKey.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wallets/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          privateKey: privateKey.trim(),
          name: keyName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "فشل استيراد المحفظة");
      onWalletAdded();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleImportFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileContent) return;
    setLoading(true);
    setError(null);
    setImportResult(null);
    try {
      const res = await fetch("/api/wallets/import-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: fileFormat, content: fileContent }),
      });
      const data = await res.json();
      if (!data.success && data.imported === undefined) throw new Error(data.error || "فشل استيراد الملف");
      setImportResult({ imported: data.imported || 0, failed: data.failed || 0, errors: data.errors || [] });
      if ((data.imported || 0) > 0) onWalletAdded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileRead = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setImportResult(null);
    setError(null);

    // Auto-detect format
    if (file.name.endsWith(".json")) setFileFormat("json");
    else if (file.name.endsWith(".csv")) setFileFormat("csv");
    else setFileFormat("txt");

    const reader = new FileReader();
    reader.onload = (ev) => setFileContent(ev.target?.result as string);
    reader.readAsText(file, "utf-8");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-[#0b1424] border border-[#1e2e45] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-fade-in text-right">
        {/* Header */}
        <div className="p-6 border-b border-[#18263c] flex justify-between items-center bg-[#070e1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">إضافة وتوليد المحافظ</h3>
              <p className="text-xs text-gray-400">
                اشتقاق عناوين 11 شبكة بلوكتشين متوافقة مع معايير MetaMask
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#18263c] bg-[#091220] p-1.5 gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => { setActiveTab("generate"); setError(null); setImportResult(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "generate"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-[#121e33]"
            }`}
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>توليد فردي</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("batch"); setError(null); setImportResult(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "batch"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-[#121e33]"
            }`}
          >
            <span className="material-symbols-outlined text-base">layers</span>
            <span>بالجملة (Batch)</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("seed"); setError(null); setImportResult(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "seed"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-[#121e33]"
            }`}
          >
            <span className="material-symbols-outlined text-base">key</span>
            <span>عبارة استرداد</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("privateKey"); setError(null); setImportResult(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "privateKey"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-[#121e33]"
            }`}
          >
            <span className="material-symbols-outlined text-base">lock</span>
            <span>مفتاح خاص</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("file"); setError(null); setImportResult(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === "file"
                ? "bg-emerald-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-[#121e33]"
            }`}
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            <span>استيراد ملف</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Single Generate */}
        {activeTab === "generate" && (
          <form onSubmit={handleGenerateSingle} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                اسم المحفظة (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: محفظة التعدين A1"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                className="w-full bg-[#111c2e] border border-[#1e2e45] text-white rounded-xl px-4 py-2.5 text-xs focus:border-blue-500 outline-none"
              />
            </div>
            <div className="bg-[#070e1a] border border-[#18263c] rounded-xl p-3.5 space-y-2 text-xs text-gray-400">
              <p className="font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-blue-400">info</span>
                <span>الميزات عند التوليد:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>إنشاء عبارة استرداد آمنة (12 كلمة BIP-39) ومفتاح خاص مشفر.</li>
                <li>اشتقاق عناوين لـ 11 شبكة (Ethereum, Solana, Bitcoin, Tron, Polygon, Arbitrum, Base, BSC...).</li>
                <li>حفظ دائم للمحفظة على السيرفر مع إمكانية التصدير في أي وقت.</li>
              </ul>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-[#18263c]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#1e2e45] text-gray-300 hover:bg-[#121e33] text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>}
                <span>توليد المحفظة الآن</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Batch Generate */}
        {activeTab === "batch" && (
          <form onSubmit={handleBatchGenerate} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                عدد المحافظ المراد إنشاؤها دفعة واحدة:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={batchCount}
                  onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
                  className="w-32 bg-[#111c2e] border border-[#1e2e45] text-white font-mono font-bold text-sm rounded-xl px-4 py-2 focus:border-blue-500 outline-none"
                />
                <div className="flex gap-2">
                  {[5, 10, 25, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBatchCount(num)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        batchCount === num
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-[#111c2e] border-[#1e2e45] text-gray-400 hover:text-white"
                      }`}
                    >
                      +{num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#070e1a] border border-[#18263c] rounded-xl p-3.5 space-y-2 text-xs text-gray-400">
              <p className="font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-blue-400">auto_awesome</span>
                <span>توليد سريع بالجملة:</span>
              </p>
              <p className="text-[11px]">
                سيتم إنشاء {batchCount} محفظة كاملة بكل المفاتيح وعناوين الـ 11 شبكة وحفظها تلقائياً بالخزانة.
              </p>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-[#18263c]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#1e2e45] text-gray-300 hover:bg-[#121e33] text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>}
                <span>توليد {batchCount} محفظة فوراً</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Import Seed Phrase */}
        {activeTab === "seed" && (
          <form onSubmit={handleImportSeed} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                اسم المحفظة (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: محفظة ميتاماسك المستوردة"
                value={seedName}
                onChange={(e) => setSeedName(e.target.value)}
                className="w-full bg-[#111c2e] border border-[#1e2e45] text-white rounded-xl px-4 py-2 text-xs focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                عبارة الاسترداد (Seed Phrase - 12 أو 24 كلمة)
              </label>
              <textarea
                rows={3}
                required
                placeholder="ضع الكلمات مفصولة بمسافات (word1 word2 word3 ... word12)"
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
                className="w-full bg-[#111c2e] border border-[#1e2e45] text-white font-mono text-xs rounded-xl p-3 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-[#18263c]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#1e2e45] text-gray-300 hover:bg-[#121e33] text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading || !seedPhrase.trim()}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>}
                <span>استيراد واشتقاق العناوين</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 4: Import Private Key */}
        {activeTab === "privateKey" && (
          <form onSubmit={handleImportPrivateKey} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                اسم المحفظة (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: حساب خاص 0x..."
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="w-full bg-[#111c2e] border border-[#1e2e45] text-white rounded-xl px-4 py-2 text-xs focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                المفتاح الخاص (Private Key)
              </label>
              <input
                type="password"
                required
                placeholder="0x..."
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="w-full bg-[#111c2e] border border-[#1e2e45] text-white font-mono text-xs rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-[#18263c]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#1e2e45] text-gray-300 hover:bg-[#121e33] text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading || !privateKey.trim()}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>}
                <span>استيراد المحفظة</span>
              </button>
            </div>
          </form>
        )}
        {/* Tab 5: File Import */}
        {activeTab === "file" && (
          <form onSubmit={handleImportFile} className="p-6 space-y-4">
            {/* Format Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">صيغة الملف</label>
              <div className="grid grid-cols-3 gap-2">
                {(["json", "csv", "txt"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFileFormat(fmt)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                      fileFormat === fmt
                        ? "bg-emerald-600/20 border-emerald-500/60 text-emerald-300 shadow"
                        : "bg-[#111c2e] border-[#1e2e45] text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {fmt === "json" ? "data_object" : fmt === "csv" ? "table_chart" : "text_snippet"}
                    </span>
                    <span>.{fmt.toUpperCase()}</span>
                    <span className="text-[10px] opacity-70">
                      {fmt === "json" ? "تصدير الخزانة" : fmt === "csv" ? "جدول بيانات" : "سطر لكل محفظة"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* File Drop Zone */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">رفع الملف</label>
              <label
                htmlFor="file-import-input"
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${
                  fileContent
                    ? "border-emerald-500/60 bg-emerald-500/5"
                    : "border-[#2a3f5a] bg-[#070e1a] hover:border-blue-500/60 hover:bg-blue-500/5"
                }`}
              >
                {fileContent ? (
                  <>
                    <span className="material-symbols-outlined text-4xl text-emerald-400">check_circle</span>
                    <div className="text-center">
                      <p className="text-xs font-bold text-emerald-300">{fileName}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {fileContent.length.toLocaleString()} حرف - جاهز للاستيراد
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setFileContent(null); setFileName(null); setImportResult(null); }}
                      className="text-[11px] text-gray-400 hover:text-rose-400 underline"
                    >
                      تغيير الملف
                    </button>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-gray-500">upload_file</span>
                    <div className="text-center">
                      <p className="text-xs font-bold text-white">اضغط لرفع الملف</p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {fileFormat === "json" && "ملف JSON مصدّر من خزانة Apex"}
                        {fileFormat === "csv" && "ملف CSV يحتوي على أعمدة Seed_Phrase أو Private_Key"}
                        {fileFormat === "txt" && "ملف TXT - سطر لكل Seed Phrase أو Private Key"}
                      </p>
                    </div>
                  </>
                )}
                <input
                  id="file-import-input"
                  type="file"
                  accept={`.${fileFormat}`}
                  className="hidden"
                  onChange={handleFileRead}
                />
              </label>
            </div>

            {/* Format Info Box */}
            {!fileContent && (
              <div className="bg-[#070e1a] border border-[#18263c] rounded-xl p-3.5 space-y-2">
                <p className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-emerald-400">info</span>
                  <span>صيغة ملف .{fileFormat.toUpperCase()} المطلوبة:</span>
                </p>
                <p className="text-[10px] text-gray-500 font-mono leading-5">
                  {fileFormat === "json" && '[{"name": "wallet1", "mnemonic": "word1 word2 ...", "privateKey": "0x..."}, ...]'}
                  {fileFormat === "csv" && "Name,Seed_Phrase,Private_Key\nwallet1,word1 word2...,0x..."}
                  {fileFormat === "txt" && "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12\n0xabcdef1234..."}
                </p>
              </div>
            )}

            {/* Import Result */}
            {importResult && (
              <div className={`rounded-xl p-4 border space-y-2 ${
                importResult.imported > 0
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-rose-500/10 border-rose-500/30"
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-xl ${
                    importResult.imported > 0 ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {importResult.imported > 0 ? "check_circle" : "cancel"}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">
                      تم استيراد {importResult.imported} محفظة بنجاح
                      {importResult.failed > 0 && <span className="text-rose-400 mr-2">({importResult.failed} فشلت)</span>}
                    </p>
                  </div>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-white/10">
                    {importResult.errors.map((err, i) => (
                      <p key={i} className="text-[10px] text-rose-300 font-mono">{err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 flex justify-end gap-3 border-t border-[#18263c]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#1e2e45] text-gray-300 hover:bg-[#121e33] text-xs font-semibold"
              >
                {importResult?.imported ? "إغلاق" : "إلغاء"}
              </button>
              {!importResult?.imported && (
                <button
                  type="submit"
                  disabled={loading || !fileContent}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {loading && <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>}
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span>استيراد الملف</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
