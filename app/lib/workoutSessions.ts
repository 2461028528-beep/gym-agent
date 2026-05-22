import { formatChineseDate } from "./dateFormat";
import { loadTrainingData, type ExerciseLog } from "./trainingHabits";
import {
  getCheckInDateKey,
  getCheckInsForDateKey,
  getFeelingEmoji,
  getFeelingLabel,
  loadWorkoutCheckIns,
  type TrainingFeeling,
  type WorkoutCheckIn,
} from "./trainingStatus";

export type SessionExercise = {
  name: string;
  weight: string;
  sets: string;
  reps: string;
};

export type WorkoutDaySession = {
  sessionId: string;
  dateKey: string;
  date: string;
  weekday: string;
  dayId: string;
  dayLabel: string;
  feeling: TrainingFeeling;
  feelingLabel: string;
  recordedAt: number;
  exercises: SessionExercise[];
};

const STORAGE_KEY = "gym-agent-workout-sessions";
const SESSION_MATCH_MS = 3 * 60 * 1000;

function loadSessions(): WorkoutDaySession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WorkoutDaySession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSessions(sessions: WorkoutDaySession[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(-200)));
  } catch {
    /* ignore */
  }
}

export function saveWorkoutSession(params: {
  dayId: string;
  dayLabel: string;
  feeling: TrainingFeeling;
  exercises: SessionExercise[];
  date?: Date;
}): WorkoutDaySession {
  const now = params.date ?? new Date();
  const { dateLine, weekdayLine, dateKey } = formatChineseDate(now);
  const recordedAt = now.getTime();

  const session: WorkoutDaySession = {
    sessionId: String(recordedAt),
    dateKey,
    date: dateLine,
    weekday: weekdayLine,
    dayId: params.dayId,
    dayLabel: params.dayLabel,
    feeling: params.feeling,
    feelingLabel: getFeelingLabel(params.feeling),
    recordedAt,
    exercises: params.exercises,
  };

  const list = loadSessions();
  list.push(session);
  persistSessions(list);
  return session;
}

export function getSessionsForDateKey(dateKey: string): WorkoutDaySession[] {
  return loadSessions()
    .filter((s) => s.dateKey === dateKey)
    .sort((a, b) => a.recordedAt - b.recordedAt);
}

function reconstructFromHistory(
  checkIn: WorkoutCheckIn,
): SessionExercise[] {
  const historyData = loadTrainingData();
  const exercises: SessionExercise[] = [];
  const windowStart = checkIn.recordedAt - SESSION_MATCH_MS;
  const windowEnd = checkIn.recordedAt + SESSION_MATCH_MS;
  const dateKey = getCheckInDateKey(checkIn);

  for (const [name, entries] of Object.entries(historyData.historyByExercise)) {
    const match = entries.find(
      (entry) =>
        entry.dayId === checkIn.dayId &&
        entry.date === dateKey &&
        entry.recordedAt >= windowStart &&
        entry.recordedAt <= windowEnd,
    );
    if (match) {
      exercises.push({
        name,
        weight: match.weight,
        sets: match.sets,
        reps: match.reps,
      });
    }
  }

  return exercises;
}

function checkInToSession(checkIn: WorkoutCheckIn): WorkoutDaySession {
  return {
    sessionId: String(checkIn.recordedAt),
    dateKey: getCheckInDateKey(checkIn),
    date: checkIn.date,
    weekday: checkIn.weekday,
    dayId: checkIn.dayId,
    dayLabel: checkIn.dayLabel,
    feeling: checkIn.feeling,
    feelingLabel: checkIn.feelingLabel,
    recordedAt: checkIn.recordedAt,
    exercises: reconstructFromHistory(checkIn),
  };
}

/** 优先读会话快照，否则用打卡 + 历史记录回填 */
export function getDayTrainingSessions(dateKey: string): WorkoutDaySession[] {
  const stored = getSessionsForDateKey(dateKey);
  if (stored.length > 0) return stored;

  const checkIns = getCheckInsForDateKey(loadWorkoutCheckIns(), dateKey);
  return checkIns.map(checkInToSession);
}

export function buildExercisesFromDayLogs(
  exerciseNames: string[],
  dayLogs: Record<string, ExerciseLog>,
): SessionExercise[] {
  return exerciseNames
    .map((name) => {
      const log = dayLogs[name];
      if (!log?.weight.trim() && !log?.sets.trim() && !log?.reps.trim()) {
        return null;
      }
      return {
        name,
        weight: log.weight.trim(),
        sets: log.sets.trim(),
        reps: log.reps.trim(),
      };
    })
    .filter((item): item is SessionExercise => item !== null);
}

export { getFeelingEmoji };
