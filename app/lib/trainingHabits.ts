export type ExerciseLog = {
  weight: string;
  sets: string;
  reps: string;
};

export type HistoryEntry = ExerciseLog & {
  recordedAt: number;
  /** YYYY-MM-DD */
  date: string;
  dayId: string;
};

type StoredTrainingData = {
  lastByExercise: Record<string, ExerciseLog>;
  historyByExercise: Record<string, HistoryEntry[]>;
};

const STORAGE_KEY = "gym-agent-training-habits";
const CONSECUTIVE_SESSIONS_FOR_SUGGESTION = 3;
const HIGH_WEIGHT_KG = 60;
const MAX_HISTORY_ENTRIES = 48;

function emptyStorage(): StoredTrainingData {
  return { lastByExercise: {}, historyByExercise: {} };
}

function formatRecordDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isCompleteLog(log: ExerciseLog): boolean {
  return (
    log.weight.trim() !== "" &&
    log.sets.trim() !== "" &&
    log.reps.trim() !== ""
  );
}

export function parseWeight(value: string): number {
  const n = parseFloat(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function parseSets(value: string): number {
  const n = parseInt(value.replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

export function parseReps(value: string): number {
  return parseSets(value);
}

function normalizedMetrics(log: ExerciseLog) {
  return {
    weight: parseWeight(log.weight),
    sets: parseSets(log.sets),
    reps: parseReps(log.reps),
  };
}

export function loadTrainingData(): StoredTrainingData {
  if (typeof window === "undefined") return emptyStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStorage();
    const parsed = JSON.parse(raw) as StoredTrainingData;
    return {
      lastByExercise: parsed.lastByExercise ?? {},
      historyByExercise: parsed.historyByExercise ?? {},
    };
  } catch {
    return emptyStorage();
  }
}

function persistTrainingData(data: StoredTrainingData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota or private mode */
  }
}

export function getLastExerciseLog(exerciseName: string): ExerciseLog | null {
  const last = loadTrainingData().lastByExercise[exerciseName];
  if (!last) return null;
  if (!last.weight && !last.sets && !last.reps) return null;
  return { ...last };
}

export function saveLastExerciseLog(
  exerciseName: string,
  log: ExerciseLog,
): void {
  const data = loadTrainingData();
  data.lastByExercise[exerciseName] = { ...log };
  persistTrainingData(data);
}

export function getExerciseHistory(exerciseName: string): HistoryEntry[] {
  return loadTrainingData().historyByExercise[exerciseName] ?? [];
}

export function getExerciseHistoryCount(exerciseName: string): number {
  return getExerciseHistory(exerciseName).length;
}

/** 每次完成训练都追加一条记录，不去重 */
export function appendExerciseHistory(
  exerciseName: string,
  log: ExerciseLog,
  dayId: string,
): HistoryEntry | null {
  if (!isCompleteLog(log)) return null;

  const data = loadTrainingData();
  const history = data.historyByExercise[exerciseName] ?? [];
  const now = new Date();

  const entry: HistoryEntry = {
    weight: log.weight.trim(),
    sets: log.sets.trim(),
    reps: log.reps.trim(),
    recordedAt: now.getTime(),
    date: formatRecordDate(now),
    dayId,
  };

  history.push(entry);
  data.historyByExercise[exerciseName] = history.slice(-MAX_HISTORY_ENTRIES);
  data.lastByExercise[exerciseName] = {
    weight: entry.weight,
    sets: entry.sets,
    reps: entry.reps,
  };
  persistTrainingData(data);
  return entry;
}

export type TrainingSuggestion = {
  message: string;
  kind: "weight" | "reps";
};

function lastThreeAreIdentical(history: HistoryEntry[]): boolean {
  if (history.length < CONSECUTIVE_SESSIONS_FOR_SUGGESTION) return false;

  const recent = history.slice(-CONSECUTIVE_SESSIONS_FOR_SUGGESTION);
  const baseline = normalizedMetrics(recent[0]);

  if (baseline.weight <= 0 || baseline.sets <= 0 || baseline.reps <= 0) {
    return false;
  }

  return recent.every((entry) => {
    const m = normalizedMetrics(entry);
    return (
      m.weight === baseline.weight &&
      m.sets === baseline.sets &&
      m.reps === baseline.reps
    );
  });
}

export function getTrainingSuggestionFromHistory(
  history: HistoryEntry[],
): TrainingSuggestion | null {
  if (!lastThreeAreIdentical(history)) return null;

  const weight = normalizedMetrics(history[history.length - 1]).weight;

  if (weight >= HIGH_WEIGHT_KG) {
    return {
      kind: "reps",
      message: "当前重量表现稳定，建议增加 1-2 次 repetitions",
    };
  }

  return {
    kind: "weight",
    message: "建议下次增加 2.5kg",
  };
}

export function getTrainingSuggestion(
  exerciseName: string,
  historyOverride?: HistoryEntry[],
): TrainingSuggestion | null {
  const history = historyOverride ?? getExerciseHistory(exerciseName);
  return getTrainingSuggestionFromHistory(history);
}
