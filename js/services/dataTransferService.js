import { ProjectManager } from "../models/projectManager.js";

const MAX_NAME_LENGTH = 100;

function isObject(value) {
  return typeof value === "object" && value !== null;
}

function isValidName(value) {
  if (typeof value !== "string") return false;

  const name = value.trim();
  return name.length > 0 && name.length <= MAX_NAME_LENGTH;
}

function areValidEstimates(task) {
  const estimates = [
    task.optimistic,
    task.mostLikely,
    task.pessimistic,
  ];
  const isUnset = estimates.every(value => value === null || value === undefined);

  if (isUnset) return true;
  if (estimates.some(value => typeof value !== "number" || !Number.isFinite(value) || value < 0)) {
    return false;
  }

  return task.optimistic <= task.mostLikely &&
    task.mostLikely <= task.pessimistic;
}

function isOptionalDeadline(value) {
  if (value === null || value === undefined) return true;
  if (typeof value !== "string") return false;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
}

function isValidTask(task) {
  return isObject(task) &&
    typeof task.id === "string" &&
    task.id.trim().length > 0 &&
    isValidName(task.name) &&
    areValidEstimates(task) &&
    (task.status === undefined ||
      task.status === "todo" ||
      task.status === "completed") &&
    (task.createdAt === undefined ||
      task.createdAt === null ||
      typeof task.createdAt === "string");
}

function isValidData(data) {
  if (!isObject(data) || !Array.isArray(data.projects)) return false;

  const projectIds = new Set();

  return data.projects.every(project => {
    if (!isObject(project) ||
      typeof project.id !== "string" ||
      project.id.trim().length === 0 ||
      projectIds.has(project.id) ||
      !isValidName(project.name) ||
      !isOptionalDeadline(project.deadline) ||
      !Array.isArray(project.tasks)) {
      return false;
    }

    projectIds.add(project.id);
    const taskIds = new Set();

    return project.tasks.every(task => {
      if (!isValidTask(task) || taskIds.has(task.id)) return false;
      taskIds.add(task.id);
      return true;
    });
  });
}

export function createExportFile(manager) {
  return new Blob(
    [JSON.stringify({ projects: manager.projects }, null, 2)],
    { type: "application/json" }
  );
}

export function getExportFileName(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  return `probplan-${formattedDate}.pplp`;
}

export function parseImportData(json) {
  const data = JSON.parse(json);

  if (!isValidData(data)) {
    throw new Error("ファイル形式が正しくありません。");
  }

  return ProjectManager.fromJSON(data);
}
