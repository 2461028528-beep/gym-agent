"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ALL_DAY_TABS,
  REST_DAY,
  SCHEDULE_ORDER,
  getDayLabel,
  getNextScheduleDay,
  getTrainingDayById,
} from "../workouts";
import {
  appendExerciseHistory,
  getLastExerciseLog,
  getTrainingSuggestion,
  isCompleteLog,
  loadTrainingData,
  saveLastExerciseLog,
  type ExerciseLog,
  type HistoryEntry,
} from "../lib/trainingHabits";
import TrainingSuggestionCard from "./TrainingSuggestion";
import TrainingStatusModal from "./TrainingStatusModal";
import { formatChineseDate } from "../lib/dateFormat";
import {
  saveWorkoutCheckIn,
  type TrainingFeeling,
} from "../lib/trainingStatus";
import {
  loadScheduleDayId,
  saveScheduleDayId,
} from "../lib/scheduleProgress";
import {
  buildExercisesFromDayLogs,
  saveWorkoutSession,
} from "../lib/workoutSessions";

type DayLogs = Record<string, ExerciseLog>;

function emptyLog(): ExerciseLog {
  return { weight: "", sets: "", reps: "" };
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputMode?: "decimal" | "numeric";
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold text-[#333333]">{label}</span>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#e0e0e0] bg-white px-3 py-3 text-sm font-semibold tabular-nums text-[#111111] shadow-sm outline-none transition placeholder:text-[#aaaaaa] focus:border-[#24c789] focus:ring-2 focus:ring-[#24c789]/20 disabled:cursor-not-allowed disabled:bg-[#f0f0f0] disabled:text-[#999999]"
      />
    </label>
  );
}

export default function WorkoutHome() {
  const [currentDayId, setCurrentDayId] = useState<string>(SCHEDULE_ORDER[0]);
  const [logsByDay, setLogsByDay] = useState<Record<string, DayLogs>>({});
  const [storageReady, setStorageReady] = useState(false);
  const [historyByExercise, setHistoryByExercise] = useState<
    Record<string, HistoryEntry[]>
  >({});
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [dateDisplay, setDateDisplay] = useState(() =>
    formatChineseDate(new Date()),
  );

  const isRestDay = currentDayId === REST_DAY.id;
  const activeDay = useMemo(
    () => getTrainingDayById(currentDayId),
    [currentDayId],
  );
  const dayLogs = logsByDay[currentDayId] ?? {};
  const currentLabel = getDayLabel(currentDayId);

  const statusText = isRestDay ? "恢复日" : "准备开练";

  const statusTone = isRestDay ? "text-[#3b9eff]" : "text-[#24c789]";

  useEffect(() => {
    const data = loadTrainingData();
    setHistoryByExercise(data.historyByExercise);
    setCurrentDayId(loadScheduleDayId());
    setStorageReady(true);
  }, []);

  useEffect(() => {
    const tick = () => setDateDisplay(formatChineseDate(new Date()));
    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!storageReady || isRestDay || !activeDay) return;

    setLogsByDay((prev) => {
      const day = prev[currentDayId] ?? {};
      let changed = false;
      const nextDay: DayLogs = { ...day };

      for (const exerciseName of activeDay.exercises) {
        const current = nextDay[exerciseName];
        const hasInput =
          current &&
          (current.weight.trim() ||
            current.sets.trim() ||
            current.reps.trim());

        if (hasInput) continue;

        const last = getLastExerciseLog(exerciseName);
        if (last) {
          nextDay[exerciseName] = { ...last };
          changed = true;
        }
      }

      if (!changed) return prev;
      return { ...prev, [currentDayId]: nextDay };
    });
  }, [currentDayId, storageReady, isRestDay, activeDay]);

  function updateLog(
    exerciseName: string,
    field: keyof ExerciseLog,
    value: string,
  ) {
    setLogsByDay((prev) => {
      const currentDay = prev[currentDayId] ?? {};
      const currentExercise = currentDay[exerciseName] ?? emptyLog();
      const updated: ExerciseLog = {
        ...currentExercise,
        [field]: value,
      };

      saveLastExerciseLog(exerciseName, updated);

      return {
        ...prev,
        [currentDayId]: {
          ...currentDay,
          [exerciseName]: updated,
        },
      };
    });
  }

  function recordDayHistoryToStorage() {
    if (!activeDay) return;

    const next: Record<string, HistoryEntry[]> = { ...historyByExercise };

    for (const exerciseName of activeDay.exercises) {
      const log = dayLogs[exerciseName];
      if (!log || !isCompleteLog(log)) continue;

      const entry = appendExerciseHistory(exerciseName, log, currentDayId);
      if (!entry) continue;

      next[exerciseName] = [...(next[exerciseName] ?? []), entry].slice(-48);
    }

    setHistoryByExercise(next);
  }

  function finalizeWorkout(feeling: TrainingFeeling) {
    if (!isRestDay) {
      recordDayHistoryToStorage();
    }

    saveWorkoutCheckIn({
      dayId: currentDayId,
      dayLabel: currentLabel,
      feeling,
    });

    const sessionExercises =
      activeDay && !isRestDay
        ? buildExercisesFromDayLogs(activeDay.exercises, dayLogs)
        : [];

    saveWorkoutSession({
      dayId: currentDayId,
      dayLabel: currentLabel,
      feeling,
      exercises: sessionExercises,
    });

    const nextDayId = getNextScheduleDay(currentDayId);
    saveScheduleDayId(nextDayId);
    setCurrentDayId(nextDayId);
    setStatusModalOpen(false);
  }

  function handleCompleteClick() {
    setStatusModalOpen(true);
  }

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-lg flex-col overflow-hidden bg-[#f5f6f8] text-[#111111]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#e8faf3] to-transparent"
      />

      <header className="relative z-10 px-6 pb-2 pt-14">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#24c789]">
              健身智能体
            </p>
            <h1 className="mt-2 text-[2rem] font-bold tracking-tight text-[#111111]">
              晚上好
            </h1>
          </div>
          <time
            dateTime={dateDisplay.dateKey}
            className="shrink-0 text-right text-xs font-semibold leading-relaxed text-[#333333]"
          >
            <span className="block text-[#111111]">{dateDisplay.dateLine}</span>
            <span className="block text-[#6366f1]">{dateDisplay.weekdayLine}</span>
          </time>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-3.5 py-2 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            {!isRestDay && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#24c789] opacity-40" />
            )}
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                isRestDay ? "bg-[#3b9eff]" : "bg-[#24c789]"
              }`}
            />
          </span>
          <span className="text-xs font-medium text-[#333333]">今日训练状态</span>
          <span className={`text-xs font-bold ${statusTone}`}>{statusText}</span>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col px-6 pb-36 pt-6">
        <section className="mb-6">
          <p className="text-sm font-bold text-[#24c789]">今日训练</p>
          <h2 className="mt-1 text-[2.25rem] font-black tracking-tight text-[#111111]">
            {currentLabel}
          </h2>
          <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-[#5c5c5c]">
            {isRestDay
              ? "让身体充分恢复，为下一轮训练蓄力。"
              : "根据恢复与负荷，由 AI 智能调整今日容量。"}
          </p>
        </section>

        <div className="mb-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
          {ALL_DAY_TABS.map((day) => {
            const isActive = day.id === currentDayId;
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => setCurrentDayId(day.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                  isActive
                    ? "bg-[#24c789] text-white shadow-[0_4px_12px_rgba(36,199,137,0.4)]"
                    : "border border-[#e0e0e0] bg-white text-[#333333] hover:border-[#24c789]/50 hover:text-[#111111]"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>

        {isRestDay ? (
          <section className="rounded-2xl border border-[#ebebeb] bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f4ff] text-3xl">
              🧘
            </div>
            <h3 className="mt-6 text-center text-2xl font-black text-[#111111]">
              今天是恢复日
            </h3>
            <p className="mt-3 text-center text-base font-medium leading-relaxed text-[#5c5c5c]">
              建议进行拉伸和低强度有氧
            </p>
            <ul className="mt-6 space-y-3 text-sm font-medium text-[#333333]">
              <li className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-[#3b9eff]" />
                泡沫轴放松 10–15 分钟
              </li>
              <li className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-[#3b9eff]" />
                步行或单车 20–30 分钟
              </li>
              <li className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-[#3b9eff]" />
                保证睡眠与补水
              </li>
            </ul>
          </section>
        ) : (
          activeDay && (
            <ul className="flex flex-col gap-3">
              {activeDay.exercises.map((exerciseName, index) => {
                const log = dayLogs[exerciseName] ?? emptyLog();
                const exerciseHistory = historyByExercise[exerciseName] ?? [];
                const historyCount = exerciseHistory.length;
                const suggestion = storageReady
                  ? getTrainingSuggestion(exerciseName, exerciseHistory)
                  : null;

                return (
                  <li
                    key={`${currentDayId}-${exerciseName}`}
                    className="rounded-2xl border border-[#ebebeb] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#24c789] text-sm font-black text-white">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-bold leading-snug text-[#111111]">
                          {exerciseName}
                        </h3>
                        <p className="mt-0.5 text-xs font-medium text-[#24c789]">
                          智能体推荐
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[#f0f0f0] pt-4">
                      <FieldInput
                        label="重量"
                        value={log.weight}
                        onChange={(v) => updateLog(exerciseName, "weight", v)}
                        placeholder="kg"
                        inputMode="decimal"
                      />
                      <FieldInput
                        label="组数"
                        value={log.sets}
                        onChange={(v) => updateLog(exerciseName, "sets", v)}
                        placeholder="组"
                        inputMode="numeric"
                      />
                      <FieldInput
                        label="次数"
                        value={log.reps}
                        onChange={(v) => updateLog(exerciseName, "reps", v)}
                        placeholder="次"
                        inputMode="numeric"
                      />
                    </div>
                    {suggestion && (
                      <TrainingSuggestionCard
                        suggestion={suggestion}
                        historyCount={historyCount}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-[4.25rem] z-20 mx-auto max-w-lg px-6 pb-4 pt-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f5f6f8] to-transparent"
        />
        <button
          type="button"
          onClick={handleCompleteClick}
          className="relative w-full rounded-2xl bg-[#24c789] py-4 text-base font-bold text-white shadow-[0_6px_20px_rgba(36,199,137,0.45)] transition hover:bg-[#1fb87d] active:scale-[0.98]"
        >
          完成今日训练
        </button>
      </footer>

      <TrainingStatusModal
        open={statusModalOpen}
        dayLabel={currentLabel}
        onSelect={finalizeWorkout}
        onCancel={() => setStatusModalOpen(false)}
      />
    </div>
  );
}
