// 独自拡張子.pplpのJSONを、安全に書き出し・読み込みするサービス。
import { ProjectManager } from "../models/projectManager.js";
import { isValidName, isCalendarDateString } from "../validation.js";

const ID_PATTERN = /^[A-Za-z0-9_-]+$/;

function isObject(value) {
  return typeof value === "object" && value !== null;
}

function isValidId(value) {
  return typeof value === "string" && ID_PATTERN.test(value);
}

function areValidEstimates(task) {
  // 見積もり未設定は許可するが、一部欠落や順序逆転は取込時に拒否する。
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
  return isCalendarDateString(value);
}

function isValidTask(task) {
  return isObject(task) &&
    isValidId(task.id) &&
    isValidName(task.name) &&
    isOptionalDeadline(task.deadline) &&
    (task.priority === undefined || ["high", "medium", "low"].includes(task.priority)) &&
    areValidEstimates(task) &&
    (task.status === undefined ||
      task.status === "todo" ||
      task.status === "completed") &&
    (task.createdAt === undefined ||
      task.createdAt === null ||
      typeof task.createdAt === "string");
}

function isValidData(data) {
  // ID重複も確認し、画面のdata属性やメニューを壊すデータを入れない。
  if (!isObject(data) || !Array.isArray(data.projects)) return false;

  const projectIds = new Set();

  return data.projects.every(project => {
    if (!isObject(project) ||
      !isValidId(project.id) ||
      projectIds.has(project.id) ||
      !isValidName(project.name) ||
      !isOptionalDeadline(project.deadline) ||
      (project.archived !== undefined && typeof project.archived !== "boolean") ||
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
  // JSON構文とアプリ固有の形式を段階的に検証してからモデルへ変換する。
  const data = JSON.parse(json);

  if (!isValidData(data)) {
    throw new Error("ファイル形式が正しくありません。");
  }

  return ProjectManager.fromJSON(data);
}
