// CLIコマンドからGUIと同じ保存データを更新できることを確認する。
import { StorageService } from "../js/services/storageService.js";
import { executeTerminalCommand } from "../js/services/terminalCommandService.js";
import { assert, assertEqual, createTestSuite } from "./testUtils.js";

const suite = createTestSuite();
const { test } = suite;
const STORAGE_KEY = "probplan";

function withCleanStorage(callback) {
  const savedData = localStorage.getItem(STORAGE_KEY);

  try {
    localStorage.removeItem(STORAGE_KEY);
    callback();
  } finally {
    if (savedData === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, savedData);
    }
  }
}

test("CLIでプロジェクトとタスクを作成して保存できる", () => {
  withCleanStorage(() => {
    const projectResult = executeTerminalCommand(
      "project add \"CLIプロジェクト\" --deadline 2026-09-01"
    );
    assert(projectResult.ok, "CLIでプロジェクトを作成できません。");

    const taskResult = executeTerminalCommand(
      "task add #1 \"CLIタスク\" --deadline 2026-09-02 --priority high --estimate 1,2,4"
    );
    assert(taskResult.ok, "CLIでタスクを作成できません。");

    const manager = StorageService.load();
    const project = manager.projects[0];
    const task = project.tasks[0];

    assertEqual(project.name, "CLIプロジェクト", "プロジェクト名が保存されていません。");
    assertEqual(project.deadline, "2026-09-01", "プロジェクト締切が保存されていません。");
    assertEqual(task.name, "CLIタスク", "タスク名が保存されていません。");
    assertEqual(task.deadline, "2026-09-02", "タスク締切が保存されていません。");
    assertEqual(task.priority, "high", "タスク優先度が保存されていません。");
    assertEqual(task.optimistic, 1, "最短見積が保存されていません。");
    assertEqual(task.mostLikely, 2, "最頻見積が保存されていません。");
    assertEqual(task.pessimistic, 4, "最長見積が保存されていません。");
  });
});

test("CLIでタスクの完了・未完了と一覧表示を操作できる", () => {
  withCleanStorage(() => {
    executeTerminalCommand("project add \"進行管理\"");
    executeTerminalCommand("task add #1 \"レビュー\" --priority medium");

    const doneResult = executeTerminalCommand("task done #1 #1");
    assert(doneResult.ok, "CLIでタスクを完了できません。");
    assertEqual(
      StorageService.load().projects[0].tasks[0].status,
      "completed",
      "完了状態が保存されていません。"
    );

    const listResult = executeTerminalCommand("tasks #1");
    assert(listResult.output.includes("[done] レビュー"), "完了タスクを一覧表示できません。");

    const todoResult = executeTerminalCommand("task todo #1 #1");
    assert(todoResult.ok, "CLIでタスクを未完了に戻せません。");
    assertEqual(
      StorageService.load().projects[0].tasks[0].status,
      "todo",
      "未完了状態が保存されていません。"
    );
  });
});

test("CLIは不正な日付・見積もり・優先度を保存しない", () => {
  withCleanStorage(() => {
    executeTerminalCommand("project add \"検証\"");

    const invalidDeadline = executeTerminalCommand(
      "task add #1 \"日付NG\" --deadline 2026/09/01"
    );
    const invalidPriority = executeTerminalCommand(
      "task add #1 \"優先度NG\" --priority urgent"
    );
    const invalidEstimate = executeTerminalCommand(
      "task add #1 \"見積NG\" --estimate 5,3,1"
    );

    assert(!invalidDeadline.ok, "不正な日付を受け付けています。");
    assert(!invalidPriority.ok, "不正な優先度を受け付けています。");
    assert(!invalidEstimate.ok, "不正な見積順序を受け付けています。");
    assertEqual(
      StorageService.load().projects[0].tasks.length,
      0,
      "不正なタスクが保存されています。"
    );
  });
});

test("CLIでプロジェクトを削除できる", () => {
  withCleanStorage(() => {
    executeTerminalCommand("project add \"削除対象\"");

    const result = executeTerminalCommand("project delete #1");

    assert(result.ok, "CLIでプロジェクトを削除できません。");
    assertEqual(StorageService.load().projects.length, 0, "削除結果が保存されていません。");
  });
});

export function runTerminalCommandServiceTests() {
  return suite.run();
}
