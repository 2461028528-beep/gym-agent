import type { TrainingSuggestion } from "../lib/trainingHabits";

export default function TrainingSuggestionCard({
  suggestion,
  historyCount,
}: {
  suggestion: TrainingSuggestion;
  historyCount: number;
}) {
  return (
    <div className="mt-3 rounded-xl border border-[#c7d2fe] bg-gradient-to-r from-[#eef2ff] to-[#f3e8ff] px-3.5 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold text-[#4f46e5]">AI 训练建议</p>
        <span className="text-[10px] font-medium text-[#6366f1]">
          已记录 {historyCount} 次
        </span>
      </div>
      <p className="mt-1.5 text-sm font-semibold leading-snug text-[#312e81]">
        {suggestion.message}
      </p>
    </div>
  );
}
