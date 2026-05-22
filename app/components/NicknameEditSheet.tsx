"use client";

import { useEffect, useState } from "react";

export default function NicknameEditSheet({
  open,
  initialNickname,
  onSave,
  onClose,
}: {
  open: boolean;
  initialNickname: string;
  onSave: (nickname: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialNickname);

  useEffect(() => {
    if (open) setValue(initialNickname);
  }, [open, initialNickname]);

  if (!open) return null;

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSave(trimmed);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="关闭"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-sheet-up relative z-10 w-full max-w-lg rounded-t-[1.35rem] border border-[#c7d2fe]/60 bg-gradient-to-b from-white to-[#f5f3ff] px-5 pb-10 pt-3 shadow-[0_-8px_40px_rgba(99,102,241,0.25)]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#c7d2fe]" />
        <h2 className="text-center text-lg font-bold text-[#312e81]">
          编辑昵称
        </h2>
        <p className="mt-1 text-center text-sm text-[#6366f1]">
          最多 12 个字符
        </p>

        <label className="mt-6 block">
          <span className="sr-only">昵称</span>
          <input
            type="text"
            maxLength={12}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
            className="w-full rounded-2xl border-2 border-[#c7d2fe] bg-white px-4 py-3.5 text-center text-lg font-bold text-[#312e81] outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20"
            placeholder="输入昵称"
          />
        </label>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-[#e0e7ff] py-3.5 text-sm font-bold text-[#6b7280]"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="flex-1 rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)] disabled:opacity-50"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
