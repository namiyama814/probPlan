// 初回チュートリアルから投入できる、機能確認用のサンプルプロジェクトを作る。
import { Project } from "../models/project.js";
import { Task } from "../models/task.js";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(baseDate, days) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);

  return date;
}

export function createSampleProject(baseDate = new Date()) {
  // 現在日を基準に期限を相対生成し、いつ触っても「締切が近い」サンプルにする。
  const project = Project.create(
    "サンプル：コンテスト応募準備",
    formatDate(addDays(baseDate, 20))
  );

  [
    {
      name: "応募要件を整理する",
      optimistic: 1,
      mostLikely: 2,
      pessimistic: 3,
      deadlineOffset: 1,
      priority: "high",
      status: "completed",
      createdOffset: -4,
    },
    {
      name: "ホーム画面の体験を磨く",
      optimistic: 2,
      mostLikely: 3,
      pessimistic: 5,
      deadlineOffset: 5,
      priority: "high",
      status: "todo",
      createdOffset: -3,
    },
    {
      name: "タスク詳細と予測を確認する",
      optimistic: 3,
      mostLikely: 5,
      pessimistic: 8,
      deadlineOffset: 10,
      priority: "medium",
      status: "todo",
      createdOffset: -2,
    },
    {
      name: "テストと最終調整を行う",
      optimistic: 1,
      mostLikely: 2,
      pessimistic: 4,
      deadlineOffset: 14,
      priority: "medium",
      status: "todo",
      createdOffset: -1,
    },
  ].forEach(taskData => {
    project.addTask(Task.create({
      name: taskData.name,
      optimistic: taskData.optimistic,
      mostLikely: taskData.mostLikely,
      pessimistic: taskData.pessimistic,
      deadline: formatDate(addDays(baseDate, taskData.deadlineOffset)),
      priority: taskData.priority,
      status: taskData.status,
      createdAt: addDays(baseDate, taskData.createdOffset).toISOString(),
    }));
  });

  return project;
}

export function addSampleProject(manager, baseDate = new Date()) {
  // 既存のユーザーデータは消さず、試作用プロジェクトだけを末尾に追加する。
  const project = createSampleProject(baseDate);
  manager.addProject(project);

  return project;
}
