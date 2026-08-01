// モデル単体の進捗、検索、削除、最新タスク取得を確認するテスト。
import { ProjectManager } from "../js/models/projectManager.js";
import { Project } from "../js/models/project.js";
import { Task } from "../js/models/task.js";
import { assert, assertEqual, createTestSuite } from "./testUtils.js";

const suite = createTestSuite();
const { test } = suite;

function createTask({
  id,
  name,
  status = "todo",
  createdAt = "2026-07-30T00:00:00.000Z",
}) {
  return new Task({
    id,
    name,
    optimistic: 1,
    mostLikely: 2,
    pessimistic: 3,
    status,
    createdAt,
  });
}

test("タスクを完了・未完了に切り替え、見積もりを更新できる", () => {
  const task = createTask({ id: "task-1", name: "調査" });

  task.setCompleted(true);
  assertEqual(task.status, "completed", "完了状態へ変更できません。");
  assertEqual(task.getProgress(), 100, "完了タスクの進捗が正しくありません。");

  task.setCompleted(false);
  task.update({
    name: "詳細調査",
    optimistic: 2,
    mostLikely: 5,
    pessimistic: 9,
  });

  assertEqual(task.status, "todo", "未完了状態へ戻せません。");
  assertEqual(task.name, "詳細調査", "タスク名を更新できません。");
  assertEqual(task.pessimistic, 9, "見積もりを更新できません。");
});

test("タスクの優先度を保持・更新できる", () => {
  const task = new Task({ id: "priority-task", name: "優先タスク", priority: "high" });
  assertEqual(task.priority, "high", "優先度を保持できません。");

  task.update({
    name: task.name,
    optimistic: 1,
    mostLikely: 2,
    pessimistic: 3,
    priority: "low",
  });
  assertEqual(task.priority, "low", "優先度を更新できません。");
});

test("プロジェクト進捗を完了タスクの割合から計算できる", () => {
  const project = new Project({
    id: "project-1",
    name: "リリース準備",
  });

  assertEqual(project.getProgress(), 0, "タスクなしの進捗は0%です。");

  project.addTask(createTask({ id: "task-1", name: "A", status: "completed" }));
  project.addTask(createTask({ id: "task-2", name: "B", status: "completed" }));
  project.addTask(createTask({ id: "task-3", name: "C" }));

  project.setDeadline("2026-08-15");

  assertEqual(project.getProgress(), 67, "プロジェクト進捗が正しくありません。");
  assertEqual(project.deadline, "2026-08-15", "締切日を更新できません。");
});

test("タスクとプロジェクトをIDで削除できる", () => {
  const project = new Project({
    id: "project-1",
    name: "削除テスト",
    tasks: [
      createTask({ id: "task-1", name: "残すタスク" }),
      createTask({ id: "task-2", name: "削除するタスク" }),
    ],
  });
  const manager = new ProjectManager([project]);

  project.removeTask("task-2");
  assertEqual(project.tasks.length, 1, "タスクを削除できません。");
  assertEqual(project.getTask("task-2"), undefined, "削除したタスクが残っています。");

  manager.removeProject("project-1");
  assertEqual(manager.projects.length, 0, "プロジェクトを削除できません。");
});

test("タスクの並び順を移動できる", () => {
  const first = createTask({ id: "task-1", name: "1" });
  const second = createTask({ id: "task-2", name: "2" });
  const third = createTask({ id: "task-3", name: "3" });
  const project = new Project({ id: "project-order", name: "並び替え", tasks: [first, second, third] });

  project.moveTask("task-3", "task-1");
  assertEqual(project.tasks.map(task => task.id).join(","), "task-3,task-1,task-2", "タスクを並び替えられません。");
});

test("全プロジェクトからタスク名を検索できる", () => {
  const manager = new ProjectManager([
    new Project({
      id: "project-1",
      name: "開発",
      tasks: [
        createTask({ id: "task-1", name: "認証画面を実装" }),
        createTask({ id: "task-2", name: "APIを接続" }),
      ],
    }),
    new Project({
      id: "project-2",
      name: "運用",
      tasks: [
        createTask({ id: "task-3", name: "認証ログを確認", status: "completed" }),
      ],
    }),
  ]);

  const results = manager.searchTasks("認証");

  assertEqual(results.length, 2, "検索結果の件数が正しくありません。");
  assertEqual(results[0].project.name, "開発", "別プロジェクトを検索できません。");
  assertEqual(results[1].task.name, "認証ログを確認", "完了タスクも検索対象に含める必要があります。");
  assertEqual(manager.searchTasks(" api ").length, 1, "大文字小文字を区別せずに検索できません。");
  assertEqual(manager.searchTasks("").length, 0, "空の検索語では結果を返しません。");
});

test("最新3件の未完了タスクだけを新しい順に取得できる", () => {
  const project = new Project({
    id: "project-1",
    name: "ホーム表示テスト",
    tasks: [
      createTask({
        id: "task-1",
        name: "古い未完了",
        createdAt: "2026-07-30T00:00:00.000Z",
      }),
      createTask({
        id: "task-2",
        name: "完了タスク",
        status: "completed",
        createdAt: "2026-07-30T04:00:00.000Z",
      }),
      createTask({
        id: "task-3",
        name: "中間の未完了",
        createdAt: "2026-07-30T02:00:00.000Z",
      }),
      createTask({
        id: "task-4",
        name: "最新の未完了",
        createdAt: "2026-07-30T03:00:00.000Z",
      }),
      createTask({
        id: "task-5",
        name: "次に古い未完了",
        createdAt: "2026-07-30T01:00:00.000Z",
      }),
    ],
  });
  const manager = new ProjectManager([project]);
  const recentTasks = manager.getRecentTasks(3, { includeCompleted: false });

  assertEqual(recentTasks.length, 3, "タスク件数の上限が正しくありません。");
  assertEqual(recentTasks[0].task.name, "最新の未完了", "並び順が正しくありません。");
  assertEqual(recentTasks[1].task.name, "中間の未完了", "並び順が正しくありません。");
  assertEqual(recentTasks[2].task.name, "次に古い未完了", "完了タスクが除外されていません。");
  assert(
    recentTasks.every(({ task }) => task.status === "todo"),
    "完了タスクが一覧に含まれています。"
  );
});

export function runModelTests() {
  return suite.run();
}
