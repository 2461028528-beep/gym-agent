export const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

export function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateKeyDisplay(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${date.getFullYear()}年${month}月${day}日 ${weekdays[date.getDay()]}`;
}

export type CalendarCell = {
  dateKey: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
};

export function buildMonthGrid(
  viewYear: number,
  viewMonth: number,
): CalendarCell[] {
  const today = new Date();
  const todayKey = toDateKey(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  );

  const firstOfMonth = new Date(viewYear, viewMonth - 1, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const cellCount = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const cells: CalendarCell[] = [];

  for (let i = 0; i < cellCount; i += 1) {
    const date = new Date(viewYear, viewMonth - 1, 1 - startOffset + i);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const dateKey = toDateKey(y, m, d);
    cells.push({
      dateKey,
      day: d,
      inCurrentMonth: date.getMonth() === viewMonth - 1,
      isToday: dateKey === todayKey,
    });
  }

  return cells;
}
