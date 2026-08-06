// GUI・CLI・インポートの各入口が共通で使う、名前と日付の検証ルール。
export const MAX_NAME_LENGTH = 100;

export function isValidName(value) {
  if (typeof value !== "string") return false;

  const name = value.trim();
  return name.length > 0 && name.length <= MAX_NAME_LENGTH;
}

export function isCalendarDateString(value) {
  if (typeof value !== "string") return false;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
}
