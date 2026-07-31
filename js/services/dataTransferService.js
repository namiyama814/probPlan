import { ProjectManager } from "../models/projectManager.js";

function isObject(value) {
  return typeof value === "object" && value !== null;
}

function isOptionalNumber(value) {
  return value === null ||
    value === undefined ||
    (typeof value === "number" && Number.isFinite(value));
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
    typeof task.name === "string" &&
    isOptionalNumber(task.optimistic) &&
    isOptionalNumber(task.mostLikely) &&
    isOptionalNumber(task.pessimistic) &&
    (task.status === undefined ||
      task.status === "todo" ||
      task.status === "completed") &&
    (task.createdAt === undefined ||
      task.createdAt === null ||
      typeof task.createdAt === "string");
}

function isValidData(data) {
  return isObject(data) &&
    Array.isArray(data.projects) &&
    data.projects.every(project =>
      isObject(project) &&
      typeof project.id === "string" &&
      typeof project.name === "string" &&
      isOptionalDeadline(project.deadline) &&
      Array.isArray(project.tasks) &&
      project.tasks.every(isValidTask)
    );
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
