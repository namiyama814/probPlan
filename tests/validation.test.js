// 必須入力、文字数、見積もり整合性、キーボード送信を確認するテスト。
import { closeModal } from "../js/ui/modal.js";
import {
  showCreateProjectModal,
  showEditProjectModal,
} from "../js/ui/projectModal.js";
import {
  showCreateTaskModal,
  showEditTaskModal,
} from "../js/ui/taskModal.js";
import { assertEqual, createTestSuite } from "./testUtils.js";

const suite = createTestSuite();
const { test } = suite;
const TOO_LONG_NAME = "あ".repeat(101);

function errorText(id) {
  return document.getElementById(id).textContent;
}

test("プロジェクト名の必須・文字数バリデーションを表示する", () => {
  let created = null;

  try {
    showCreateProjectModal(name => {
      created = name;
    });

    const input = document.getElementById("project-name");
    input.value = "  ";
    document.getElementById("create-project-submit").click();

    assertEqual(errorText("create-project-error"), "プロジェクト名を入力してください。", "必須エラーを表示できません。");
    assertEqual(document.activeElement, input, "エラー項目にフォーカスできません。");
    assertEqual(input.getAttribute("aria-invalid"), "true", "入力エラーを通知できません。");

    input.value = TOO_LONG_NAME;
    document.getElementById("create-project-submit").click();
    assertEqual(errorText("create-project-error"), "プロジェクト名は100文字以内で入力してください。", "文字数エラーを表示できません。");
    assertEqual(created, null, "不正なプロジェクトを作成してしまいました。");

    showEditProjectModal({ name: "編集前" }, () => {
      created = "updated";
    });
    const editInput = document.getElementById("edit-project-name-input");
    editInput.value = TOO_LONG_NAME;
    document.getElementById("edit-project-name-form").requestSubmit();
    assertEqual(errorText("edit-project-name-error"), "プロジェクト名は100文字以内で入力してください。", "編集時の文字数エラーを表示できません。");
    assertEqual(created, null, "不正なプロジェクト名を更新してしまいました。");
  } finally {
    closeModal(true);
  }
});

test("タスク名の必須・文字数バリデーションを表示する", () => {
  let created = null;

  try {
    showCreateTaskModal(name => {
      created = name;
    });

    const input = document.getElementById("task-name");
    input.value = "";
    document.getElementById("create-task-submit").click();
    assertEqual(errorText("create-task-error"), "タスク名を入力してください。", "必須エラーを表示できません。");
    assertEqual(document.activeElement, input, "エラー項目にフォーカスできません。");

    input.value = TOO_LONG_NAME;
    document.getElementById("create-task-submit").click();
    assertEqual(errorText("create-task-error"), "タスク名は100文字以内で入力してください。", "文字数エラーを表示できません。");
    assertEqual(created, null, "不正なタスクを作成してしまいました。");
  } finally {
    closeModal(true);
  }
});

test("作成モーダルはEnterキーで送信できる", () => {
  let projectName = null;
  let taskName = null;

  try {
    showCreateProjectModal(name => {
      projectName = name;
    });
    const projectInput = document.getElementById("project-name");
    projectInput.value = "Enterプロジェクト";
    projectInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    assertEqual(projectName, "Enterプロジェクト", "Enterキーでプロジェクトを作成できません。");

    showCreateTaskModal(name => {
      taskName = name;
    });
    const taskInput = document.getElementById("task-name");
    taskInput.value = "Enterタスク";
    taskInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    assertEqual(taskName, "Enterタスク", "Enterキーでタスクを作成できません。");
  } finally {
    closeModal(true);
  }
});

test("タスク見積もりの未入力・範囲・順序エラーを表示する", () => {
  let updated = null;
  const task = {
    name: "編集前",
    optimistic: 1,
    mostLikely: 2,
    pessimistic: 3,
  };

  try {
    showEditTaskModal(task, (_task, data) => {
      updated = data;
    });

    const optimistic = document.getElementById("optimistic");
    const mostLikely = document.getElementById("most-likely");
    const pessimistic = document.getElementById("pessimistic");
    const save = document.getElementById("save-task");

    mostLikely.value = "";
    save.click();
    assertEqual(errorText("task-error"), "見積日数を全て入力してください。", "未入力エラーを表示できません。");
    assertEqual(document.activeElement, mostLikely, "未入力の見積欄にフォーカスできません。");

    mostLikely.value = "2";
    pessimistic.value = "-1";
    save.click();
    assertEqual(errorText("task-error"), "日数は0以上で入力してください。", "範囲エラーを表示できません。");
    assertEqual(document.activeElement, pessimistic, "範囲エラーの見積欄にフォーカスできません。");

    pessimistic.value = "2";
    optimistic.value = "3";
    save.click();
    assertEqual(errorText("task-error"), "最短日数 ≤ 最頻日数 ≤ 最長日数の順で入力してください。", "順序エラーを表示できません。");
    assertEqual(document.activeElement, optimistic, "順序エラーの見積欄にフォーカスできません。");
    assertEqual(updated, null, "不正な見積もりを更新してしまいました。");
  } finally {
    closeModal(true);
  }
});

export function runValidationTests() {
  return suite.run();
}
