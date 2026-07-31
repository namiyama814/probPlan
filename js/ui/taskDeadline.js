// タスク締切を一覧向けの表示情報へ変換するヘルパー。
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDeadline(deadline) {
  if (typeof deadline !== "string") return null;

  const match = deadline.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function getTaskDeadlineInfo(deadline, now = new Date()) {
  const date = parseDeadline(deadline);
  if (!date) return null;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysRemaining = Math.floor((date - today) / MILLISECONDS_PER_DAY);
  const label = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);

  return {
    label,
    daysRemaining,
    isOverdue: daysRemaining < 0,
  };
}
