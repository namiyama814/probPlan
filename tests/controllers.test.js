// コントローラーがモデル変更と保存処理を正しく連携するかを確認する。
import {
  createProject,
  deleteProject,
  updateProjectDeadline,
  updateProjectName,
} from "../js/controllers/projectController.js";
import {
  createTask,
  deleteTask,
  setTaskCompleted,
  updateTask,
} from "../js/controllers/taskController.js";
import { ProjectManager } from "../js/models/projectManager.js";
import { StorageService } from "../js/services/storageService.js";
import { assert, assertEqual, createTestSuite } from "./testUtils.js";

const suite = createTestSuite();
const { test } = suite;
const STORAGE_KEY = "probplan";

test("プロジェクトとタスクの作成・更新・完了・削除を保存できる", () => {
  const savedData = localStorage.getItem(STORAGE_KEY);

  try {
    const manager = new ProjectManager();
    const project = createProject(
      manager,
      "コントローラーテスト",
      "2026-08-15"
    );
    const task = createTask(manager, project, "テストタスク");

    updateTask(manager, task, {
      name: "更新したタスク",
      optimistic: 1,
      mostLikely: 3,
      pessimistic: 5,
    });
    setTaskCompleted(manager, task, true);
    updateProjectName(manager, project, "名前を更新したプロジェクト");
    updateProjectDeadline(manager, project, "2026-08-20");

    const savedManager = StorageService.load();
    assertEqual(savedManager.projects.length, 1, "プロジェクトが保存されていません。");
    assertEqual(
      savedManager.projects[0].tasks[0].name,
      "更新したタスク",
      "タスク更新が保存されていません。"
    );
    assertEqual(
      savedManager.projects[0].tasks[0].status,
      "completed",
      "タスク完了が保存されていません。"
    );
    assertEqual(
      savedManager.projects[0].name,
      "名前を更新したプロジェクト",
      "プロジェクト名が保存されていません。"
    );
    assertEqual(
      savedManager.projects[0].deadline,
      "2026-08-20",
      "締切日が保存されていません。"
    );

    deleteTask(manager, project, task.id);
    assertEqual(project.tasks.length, 0, "タスクを削除できません。");

    deleteProject(manager, project.id);
    assertEqual(manager.projects.length, 0, "プロジェクトを削除できません。");
    assert(
      StorageService.load().projects.length === 0,
      "プロジェクト削除が保存されていません。"
    );
  } finally {
    if (savedData === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, savedData);
    }
  }
});

test("壊れた保存データがあっても読み込みで画面を壊さない", () => {
  const savedData = localStorage.getItem(STORAGE_KEY);

  try {
    localStorage.setItem(STORAGE_KEY, "{壊れたJSON");
    assertEqual(StorageService.load(), null, "壊れた保存データを安全に扱えません。");
  } finally {
    if (savedData === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, savedData);
    }
  }
});

export function runControllerTests() {
  return suite.run();
}
