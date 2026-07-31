// .pplpの書き出し・読み込み・不正データ拒否を確認するテスト。
import {
  createExportFile,
  getExportFileName,
  parseImportData,
} from "../js/services/dataTransferService.js";
import { ProjectManager } from "../js/models/projectManager.js";
import { Project } from "../js/models/project.js";
import { Task } from "../js/models/task.js";

const tests = [];

function test(name, callback) {
  tests.push({ name, callback });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  assert(
    actual === expected,
    `${message}\n期待値: ${expected}\n実際: ${actual}`
  );
}

function assertThrows(callback, message) {
  let didThrow = false;

  try {
    callback();
  } catch {
    didThrow = true;
  }

  assert(didThrow, message);
}

function createDataFixture() {
  return {
    projects: [
      {
        id: "project-1",
        name: "Webサイト制作",
        deadline: "2026-08-15",
        tasks: [
          {
            id: "task-1",
            name: "デザイン作成",
            optimistic: 2,
            mostLikely: 4,
            pessimistic: 8,
            status: "completed",
            createdAt: "2026-07-30T00:00:00.000Z",
          },
          {
            id: "task-2",
            name: "実装",
          optimistic: null,
          mostLikely: null,
          pessimistic: null,
            deadline: "2026-08-20",
            status: "todo",
            createdAt: "2026-07-30T01:00:00.000Z",
          },
        ],
      },
    ],
  };
}

test("エクスポート用ファイルにプロジェクトとタスクを保存できる", async () => {
  const fixture = createDataFixture();
  const file = createExportFile({ projects: fixture.projects });
  const exportedData = JSON.parse(await file.text());

  assertEqual(file.type, "application/json", "MIMEタイプが正しくありません。");
  assertEqual(exportedData.projects.length, 1, "プロジェクト数が一致しません。");
  assertEqual(
    exportedData.projects[0].deadline,
    "2026-08-15",
    "締切日が保存されていません。"
  );
  assertEqual(
    exportedData.projects[0].tasks[1].name,
    "実装",
    "タスク名が保存されていません。"
  );
});

test("エクスポートファイル名にローカル日付と.pplp拡張子を使う", () => {
  const date = new Date(2026, 6, 3);

  assertEqual(
    getExportFileName(date),
    "probplan-2026-07-03.pplp",
    "エクスポートファイル名が正しくありません。"
  );
});

test("有効な.pplpデータをモデルとして復元できる", () => {
  const manager = parseImportData(JSON.stringify(createDataFixture()));

  assert(
    manager instanceof ProjectManager,
    "ProjectManagerとして復元されていません。"
  );
  assert(
    manager.projects[0] instanceof Project,
    "Projectとして復元されていません。"
  );
  assert(
    manager.projects[0].tasks[0] instanceof Task,
    "Taskとして復元されていません。"
  );
  assertEqual(
    manager.projects[0].deadline,
    "2026-08-15",
    "締切日が復元されていません。"
  );
  assertEqual(
    manager.projects[0].getProgress(),
    50,
    "タスクの完了状態が復元されていません。"
  );
});

test("JSONとして壊れたデータを拒否する", () => {
  assertThrows(
    () => parseImportData("{ projects: [}"),
    "壊れたJSONが受け入れられました。"
  );
});

test("プロジェクトまたはタスクの形式が不正なデータを拒否する", () => {
  const invalidData = {
    projects: [
      {
        id: "project-1",
        name: "不正なプロジェクト",
        tasks: [
          {
            id: "task-1",
            name: "不正なタスク",
            optimistic: 1,
            mostLikely: 2,
            pessimistic: 3,
            status: "invalid-status",
          },
        ],
      },
    ],
  };

  assertThrows(
    () => parseImportData(JSON.stringify(invalidData)),
    "不正なデータ形式が受け入れられました。"
  );
});

test("空の名前・不正な見積もり・重複IDを含むデータを拒否する", () => {
  const invalidFixtures = [
    {
      projects: [{ id: "project-1", name: " ", tasks: [] }],
    },
    {
      projects: [{
        id: "project-1",
        name: "有効なプロジェクト",
        tasks: [{
          id: "task-1",
          name: "不正な見積もり",
          optimistic: 3,
          mostLikely: 2,
          pessimistic: 1,
        }],
      }],
    },
    {
      projects: [
        { id: "project-1", name: "A", tasks: [] },
        { id: "project-1", name: "B", tasks: [] },
      ],
    },
    {
      projects: [{
        id: "project\"><script>",
        name: "危険なID",
        tasks: [],
      }],
    },
  ];

  invalidFixtures.forEach(fixture => {
    assertThrows(
      () => parseImportData(JSON.stringify(fixture)),
      "不正な取込データが受け入れられました。"
    );
  });
});

export async function runDataTransferServiceTests() {
  const results = [];

  for (const { name, callback } of tests) {
    try {
      await callback();
      results.push({ name, passed: true });
    } catch (error) {
      results.push({
        name,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}
