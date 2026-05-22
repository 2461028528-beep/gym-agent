import { formatChineseDate } from "./dateFormat";

export type TrainingFeeling = "easy" | "normal" | "hard";

export type WorkoutCheckIn = {
  date: string;
  /** YYYY-MM-DD，便于日历检索 */
  dateKey: string;
  weekday: string;
  dayId: string;
  dayLabel: string;
  feeling: TrainingFeeling;
  feelingLabel: string;
  recordedAt: number;
};

const STORAGE_KEY = "gym-agent-workout-checkins";

export const FEELING_OPTIONS: {
  id: TrainingFeeling;
  label: string;
  emoji: string;
}[] = [
  { id: "easy", label: "简单", emoji: "😊" },
  { id: "normal", label: "一般", emoji: "😐" },
  { id: "hard", label: "困难", emoji: "😭" },
];

export function loadWorkoutCheckIns(): WorkoutCheckIn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WorkoutCheckIn[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistCheckIns(checkIns: WorkoutCheckIn[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkIns));
  } catch {
    /* ignore */
  }
}

export function saveWorkoutCheckIn(params: {
  dayId: string;
  dayLabel: string;
  feeling: TrainingFeeling;
  date?: Date;
}): WorkoutCheckIn {
  const now = params.date ?? new Date();
  const { dateLine, weekdayLine, dateKey } = formatChineseDate(now);
  const option = FEELING_OPTIONS.find((o) => o.id === params.feeling);

  const entry: WorkoutCheckIn = {
    date: dateLine,
    dateKey,
    weekday: weekdayLine,
    dayId: params.dayId,
    dayLabel: params.dayLabel,
    feeling: params.feeling,
    feelingLabel: option ? `${option.label} ${option.emoji}` : params.feeling,
    recordedAt: now.getTime(),
  };

  const list = loadWorkoutCheckIns();
  list.push(entry);
  persistCheckIns(list.slice(-120));
  return entry;
}

export function getFeelingLabel(feeling: TrainingFeeling): string {
  const option = FEELING_OPTIONS.find((o) => o.id === feeling);
  return option ? `${option.label} ${option.emoji}` : feeling;
}

export function getCheckInDateKey(checkIn: WorkoutCheckIn): string {
  if (checkIn.dateKey) return checkIn.dateKey;
  return formatChineseDate(new Date(checkIn.recordedAt)).dateKey;
}

export function getFeelingEmoji(feeling: TrainingFeeling): string {
  return FEELING_OPTIONS.find((o) => o.id === feeling)?.emoji ?? "";
}

export function getCheckInsForDateKey(
  checkIns: WorkoutCheckIn[],
  dateKey: string,
): WorkoutCheckIn[] {
  return checkIns.filter((c) => getCheckInDateKey(c) === dateKey);
}

export function getLatestCheckInForDateKey(
  checkIns: WorkoutCheckIn[],
  dateKey: string,
): WorkoutCheckIn | undefined {
  const list = getCheckInsForDateKey(checkIns, dateKey);
  return list[list.length - 1];
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function endOfWeekSunday(date: Date): Date {
  const start = startOfWeekMonday(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function getProfileStats(checkIns: WorkoutCheckIn[]) {
  const uniqueDays = new Set(checkIns.map(getCheckInDateKey));
  const weekStart = startOfWeekMonday(new Date()).getTime();
  const weekEnd = endOfWeekSunday(new Date()).getTime();
  const weekSessions = checkIns.filter(
    (c) => c.recordedAt >= weekStart && c.recordedAt <= weekEnd,
  ).length;

  return {
    totalTrainingDays: uniqueDays.size,
    weekTrainingCount: weekSessions,
  };
}
