"use client";

import {
  FEELING_OPTIONS,
  type TrainingFeeling,
} from "../lib/trainingStatus";

export default function TrainingStatusModal({
  open,
  dayLabel,
  onSelect,
  onCancel,
}: {
  open: boolean;
  dayLabel: string;
  onSelect: (feeling: TrainingFeeling) => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="关闭"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="training-status-title"
        className="animate-sheet-up relative z-10 w-full max-w-lg rounded-t-[1.35rem] border border-[#c7d2fe]/60 bg-gradient-to-b from-white to-[#f5f3ff] px-5 pb-10 pt-3 shadow-[0_-8px_40px_rgba(99,102,241,0.2)] sm:mx-4 sm:rounded-[1.35rem]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#c7d2fe]" />

        <h2
          id="training-status-title"
          className="text-center text-lg font-bold text-[#312e81]"
        >
          今日训练状态
        </h2>
        <p className="mt-1 text-center text-sm text-[#6366f1]">
          {dayLabel} · 请选择本次训练感受
        </p>

        <ul className="mt-5 space-y-2.5">
          {FEELING_OPTIONS.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onSelect(option.id)}
                className="flex w-full items-center justify-between rounded-2xl border border-[#c7d2fe] bg-gradient-to-r from-[#eef2ff] to-[#f3e8ff] px-4 py-4 text-left transition active:scale-[0.98] hover:border-[#a5b4fc] hover:shadow-[0_4px_20px_rgba(99,102,241,0.15)]"
              >
                <span className="text-base font-bold text-[#312e81]">
                  {option.label}
                </span>
                <span className="text-2xl" aria-hidden>
                  {option.emoji}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onCancel}
          className="mt-4 w-full rounded-2xl py-3.5 text-sm font-semibold text-[#6366f1] transition hover:bg-[#eef2ff]"
        >
          取消
        </button>
      </div>
    </div>
  );
}
