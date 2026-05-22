const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function formatChineseDate(date: Date): {
  dateLine: string;
  weekdayLine: string;
  dateKey: string;
} {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return {
    dateLine: `${year}年${month}月${day}日`,
    weekdayLine: WEEKDAYS[date.getDay()] ?? "",
    dateKey: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
}
