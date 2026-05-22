"use client";

import { useMemo } from "react";
import {
  WEEKDAY_LABELS,
  buildMonthGrid,
  type CalendarCell,
} from "../lib/calendarUtils";
import {
  getFeelingEmoji,
  getLatestCheckInForDateKey,
  type WorkoutCheckIn,
} from "../lib/trainingStatus";

export default function TrainingCalendar({
  viewYear,
  viewMonth,
  checkIns,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
  selectedDateKey,
}: {
  viewYear: number;
  viewMonth: number;
  checkIns: WorkoutCheckIn[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (dateKey: string) => void;
  selectedDateKey: string | null;
}) {
  const cells = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  function emojiForCell(cell: CalendarCell): string {
    const latest = getLatestCheckInForDateKey(checkIns, cell.dateKey);
    if (!latest) return "";
    return getFeelingEmoji(latest.feeling);
  }

  return (
    <section className="rounded-2xl border border-[#c7d2fe]/50 bg-white p-4 shadow-[0_4px_24px_rgba(99,102,241,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevMonth}
          className="rounded-xl px-3 py-1.5 text-sm font-bold text-[#4f46e5] hover:bg-[#eef2ff]"
        >
          ‹
        </button>
        <h3 className="text-base font-bold text-[#312e81]">
          {viewYear}年{viewMonth}月
        </h3>
        <button
          type="button"
          onClick={onNextMonth}
          className="rounded-xl px-3 py-1.5 text-sm font-bold text-[#4f46e5] hover:bg-[#eef2ff]"
        >
          ›
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-[11px] font-bold text-[#6366f1]"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const emoji = emojiForCell(cell);
          const isSelected = selectedDateKey === cell.dateKey;
          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => onSelectDay(cell.dateKey)}
              className={`flex min-h-[3.25rem] flex-col items-center justify-center rounded-xl border-2 py-1 transition ${
                isSelected
                  ? "border-[#4f46e5] bg-gradient-to-b from-[#eef2ff] to-[#f3e8ff] shadow-[0_0_0_2px_rgba(99,102,241,0.25)] ring-2 ring-[#a5b4fc]/60"
                  : cell.isToday
                    ? "border-[#a5b4fc] bg-[#fafaff]"
                    : "border-transparent hover:border-[#e0e7ff] hover:bg-[#fafaff]"
              } ${!cell.inCurrentMonth ? "opacity-40" : ""}`}
            >
              <span
                className={`text-xs font-semibold ${
                  cell.isToday ? "text-[#4f46e5]" : "text-[#374151]"
                }`}
              >
                {cell.day}
              </span>
              <span className="mt-0.5 h-5 text-base leading-5">
                {emoji || "\u00A0"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3 text-[10px] text-[#6b7280]">
        <span>😊 简单</span>
        <span>😐 一般</span>
        <span>😭 困难</span>
        <span>空白 未训练</span>
      </div>
    </section>
  );
}
