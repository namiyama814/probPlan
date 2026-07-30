import { randomTriangular } from "./triangular.js";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function getDeadlineDate(deadline) {
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

function getDaysUntilDeadline(deadline, now) {
  const deadlineDate = getDeadlineDate(deadline);
  if (!deadlineDate) return null;

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const difference = deadlineDate - today;

  return Math.floor(difference / MILLISECONDS_PER_DAY) + 1;
}

function hasValidEstimate(task) {
  const estimates = [
    task.optimistic,
    task.mostLikely,
    task.pessimistic,
  ];

  return estimates.every(value =>
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  ) && task.optimistic <= task.mostLikely &&
    task.mostLikely <= task.pessimistic;
}

export function getProjectDeadlineForecast(
  project,
  now = new Date(),
  iterations = 10000
) {
  if (!project.deadline) {
    return { status: "not-set" };
  }

  const daysRemaining = getDaysUntilDeadline(project.deadline, now);
  if (daysRemaining === null) {
    return { status: "not-set" };
  }

  const remainingTasks = project.tasks.filter(
    task => task.status !== "completed"
  );

  if (remainingTasks.length === 0) {
    return { status: "completed" };
  }

  const missingEstimateCount = remainingTasks.filter(
    task => !hasValidEstimate(task)
  ).length;
  if (missingEstimateCount > 0) {
    return {
      status: "missing-estimates",
      missingEstimateCount,
    };
  }

  if (daysRemaining <= 0) {
    return {
      status: "overdue",
      daysRemaining,
      probability: 0,
    };
  }

  let completedByDeadlineCount = 0;

  for (let iteration = 0; iteration < iterations; iteration++) {
    const totalDuration = remainingTasks.reduce(
      (total, task) => total + randomTriangular(
        task.optimistic,
        task.mostLikely,
        task.pessimistic
      ),
      0
    );

    if (totalDuration <= daysRemaining) {
      completedByDeadlineCount++;
    }
  }

  return {
    status: "available",
    daysRemaining,
    probability: Math.round(
      (completedByDeadlineCount / iterations) * 100
    ),
  };
}
