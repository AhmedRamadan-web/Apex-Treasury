"use client";

import { useState } from "react";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTransfer: (transfer: {
    recipient: string;
    amount: string;
    asset: string;
    memo: string;
  }) => void;
}

export default function TransferModal({
  isOpen,
  onClose,
  onSendTransfer,
}: TransferModalProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState("ETH");
  const [memo, setMemo] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount) return;

    onSendTransfer({
      recipient,
      amount,
      asset,
      memo,
    });

    setRecipient("");
    setAmount("");
    setMemo("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
        <div className="p-6 border-b border-outline-variant/60 flex justify-between items-center bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">
                swap_horiz
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface">إنشاء تحويل جديد</h3>
              <p className="text-xs text-on-surface-variant">
                تحويل الأصول بين محافظ الخزانة أو إلى جهات خارجية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              عنوان المستلم (Recipient Address)
            </label>
            <input
              type="text"
              required
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-surface border border-outline-variant text-on-surface font-mono rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                العملة / الأصل
              </label>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full bg-surface border border-outline-variant text-on-surface rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDC">USD Coin (USDC)</option>
                <option value="USDT">Tether (USDT)</option>
                <option value="WBTC">Wrapped BTC (WBTC)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                المبلغ
              </label>
              <input
                type="text"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface border border-outline-variant text-on-surface font-mono rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              ملاحظات المعاملة (Memo)
            </label>
            <input
              type="text"
              placeholder="مثال: دفع مستحقات الموردين لشهر مايو"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full bg-surface border border-outline-variant text-on-surface rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/40 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-variant text-sm font-semibold transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all shadow-md"
            >
              تأكيد وإرسال
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
