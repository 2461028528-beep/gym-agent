"use client";

import { formatDateKeyDisplay } from "../lib/calendarUtils";
import {
  getFeelingEmoji,
  type WorkoutDaySession,
} from "../lib/workoutSessions";

export default function DayDetailSheet({
  open,
  dateKey,
  sessions,
  onClose,
}: {
  open: boolean;
  dateKey: string | null;
  sessions: WorkoutDaySession[];
  onClose: () => void;
}) {
  if (!open || !dateKey) return null;

  const hasTraining = sessions.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="关闭"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-sheet-up relative z-10 max-h-[78vh] w-full max-w-lg overflow-y-auto rounded-t-[1.35rem] border border-[#c7d2fe]/60 bg-gradient-to-b from-white to-[#f5f3ff] px-5 pb-10 pt-3 shadow-[0_-8px_40px_rgba(99,102,241,0.25)]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#c7d2fe]" />

        <h2 className="text-center text-lg font-bold text-[#312e81]">
          训练详情
        </h2>
        <p className="mt-1 text-center text-sm font-medium text-[#6366f1]">
          {formatDateKeyDisplay(dateKey)}
        </p>

        {!hasTraining ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[#c7d2fe] bg-[#fafaff] px-4 py-10 text-center">
            <p className="text-sm font-semibold text-[#6b7280]">
              当天没有训练记录
            </p>
          </div>
        ) : (
          <ul className="mt-5 space-y-4">
            {sessions.map((session) => (
              <li
                key={session.sessionId}
                className="overflow-hidden rounded-2xl border border-[#c7d2fe] bg-gradient-to-br from-[#eef2ff] to-[#f3e8ff] shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 border-b border-[#c7d2fe]/50 bg-white/50 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold text-[#6366f1]">
                      {session.date} {session.weekday}
                    </p>
                    <p className="mt-1 text-base font-bold text-[#312e81]">
                      {session.dayLabel}
                    </p>
                    <p className="mt-1 text-xs text-[#6b7280]">
                      {new Date(session.recordedAt).toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#6366f1]">
                      今日训练状态
                    </p>
                    <span className="mt-1 block text-3xl" aria-hidden>
                      {getFeelingEmoji(session.feeling)}
                    </span>
                  </div>
                </div>

                {session.exercises.length > 0 ? (
                  <ul className="divide-y divide-[#e0e7ff]/80 px-4 py-1">
                    {session.exercises.map((exercise) => (
                      <li
                        key={`${session.sessionId}-${exercise.name}`}
                        className="py-3"
                      >
                        <p className="text-sm font-bold text-[#312e81]">
                          {exercise.name}
                        </p>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          <div className="rounded-lg bg-white/70 px-2 py-1.5 text-center">
                            <p className="text-[10px] text-[#6366f1]">重量</p>
                            <p className="text-xs font-bold text-[#312e81]">
                              {exercise.weight || "—"}
                            </p>
                          </div>
                          <div className="rounded-lg bg-white/70 px-2 py-1.5 text-center">
                            <p className="text-[10px] text-[#6366f1]">组数</p>
                            <p className="text-xs font-bold text-[#312e81]">
                              {exercise.sets || "—"}
                            </p>
                          </div>
                          <div className="rounded-lg bg-white/70 px-2 py-1.5 text-center">
                            <p className="text-[10px] text-[#6366f1]">次数</p>
                            <p className="text-xs font-bold text-[#312e81]">
                              {exercise.reps || "—"}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-4 text-center text-xs text-[#6b7280]">
                    休息日，无动作记录
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl border border-[#c7d2fe] bg-white py-3.5 text-sm font-bold text-[#4f46e5] shadow-sm"
        >
          关闭
        </button>
      </div>
    </div>
  );
}
