import { SCHEDULE_ORDER, type ScheduleDayId } from "../workouts";

const STORAGE_KEY = "gym-agent-schedule-progress";

type ScheduleProgress = {
  currentDayId: ScheduleDayId;
};

const DEFAULT_DAY_ID: ScheduleDayId = SCHEDULE_ORDER[0];

function isValidDayId(id: string): id is ScheduleDayId {
  return (SCHEDULE_ORDER as readonly string[]).includes(id);
}

export function loadScheduleDayId(): ScheduleDayId {
  if (typeof window === "undefined") return DEFAULT_DAY_ID;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DAY_ID;
    const parsed = JSON.parse(raw) as Partial<ScheduleProgress>;
    if (parsed.currentDayId && isValidDayId(parsed.currentDayId)) {
      return parsed.currentDayId;
    }
    return DEFAULT_DAY_ID;
  } catch {
    return DEFAULT_DAY_ID;
  }
}

export function saveScheduleDayId(dayId: ScheduleDayId): void {
  if (typeof window === "undefined") return;
  try {
    const payload: ScheduleProgress = { currentDayId: dayId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}
