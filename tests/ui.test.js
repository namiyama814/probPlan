// モーダル、テーマ、一覧、検索などブラウザDOMを使うUIテスト。
import { Project } from "../js/models/project.js";
import { ProjectManager } from "../js/models/projectManager.js";
import { Task } from "../js/models/task.js";
import { closeModal, openModal } from "../js/ui/modal.js";
import {
  bindProjectContextMenu,
  closeProjectContextMenu,
} from "../js/ui/projectContextMenu.js";
import { showDeleteProjectModal } from "../js/ui/projectDeleteModal.js";
import {
  renderProjectError,
  renderProjectHeader,
} from "../js/ui/projectDetailView.js";
import { showProjectListModal } from "../js/ui/projectListModal.js";
import {
  showCreateProjectModal,
  showEditProjectModal,
} from "../js/ui/projectModal.js";
import { renderProjectSection } from "../js/ui/projectView.js";
import { renderRecentTaskSection } from "../js/ui/recentTaskView.js";
import { showSimulationModal } from "../js/ui/simulationModal.js";
import { initializeTaskSearch, showTaskSearchModal } from "../js/ui/taskSearch.js";
import {
  showCreateTaskModal,
  showDeleteTaskModal,
  showEditTaskModal,
} from "../js/ui/taskModal.js";
import { renderTaskSection } from "../js/ui/taskView.js";
import { initializeTheme } from "../js/ui/theme.js";
import { escapeHtml } from "../js/ui/escapeHtml.js";
import { assert, assertEqual, createTestSuite } from "./testUtils.js";

const suite = createTestSuite();
const { test } = suite;

function createTask({
  id = crypto.randomUUID(),
  name = "テストタスク",
  status = "todo",
  optimistic = 1,
  mostLikely = 2,
  pessimistic = 3,
  createdAt = "2026-07-30T00:00:00.000Z",
} = {}) {
  return new Task({
    id,
    name,
    status,
    optimistic,
    mostLikely,
    pessimistic,
    createdAt,
  });
}

function createProject({
  id = crypto.randomUUID(),
  name = "テストプロジェクト",
  deadline = null,
  tasks = [],
} = {}) {
  return new Project({ id, name, deadline, tasks });
}

function wait(milliseconds) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}

async function withTestDocument(callback) {
  const originalBody = document.body.innerHTML;

  closeModal(true);
  closeProjectContextMenu();
  document.body.innerHTML = "<main id=\"test-root\"></main>";

  try {
    await callback(document.getElementById("test-root"));
  } finally {
    closeModal(true);
    closeProjectContextMenu();
    document.body.innerHTML = originalBody;
  }
}

test("モーダルは背景クリックでアニメーション終了後に閉じる", async () => {
  await withTestDocument(async () => {
    openModal("<p>確認</p>");

    const overlay = document.querySelector(".modal-overlay");
    overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    assert(overlay.classList.contains("is-closing"), "閉じるアニメーションが始まりません。");
    assertEqual(overlay.getAttribute("aria-hidden"), "true", "閉じる状態を通知できません。");

    await wait(300);
    assert(!document.querySelector(".modal-overlay"), "モーダルが閉じません。");
  });
});

test("テーマ切替は表示と保存内容を更新する", async () => {
  const previousTheme = localStorage.getItem("probplan-theme");

  try {
    await withTestDocument(async root => {
      root.innerHTML = "<button id=\"theme-toggle\"></button>";
      localStorage.setItem("probplan-theme", "dark");

      initializeTheme();

      const button = document.getElementById("theme-toggle");
      assertEqual(document.documentElement.dataset.theme, "dark", "保存済みテーマを適用できません。");
      assertEqual(button.getAttribute("aria-pressed"), "true", "テーマ状態を通知できません。");
      assert(Boolean(button.querySelector("svg")), "テーマアイコンがSVGではありません。");

      button.click();
      assertEqual(document.documentElement.dataset.theme, "light", "テーマを切り替えられません。");
      assertEqual(localStorage.getItem("probplan-theme"), "light", "テーマを保存できません。");
    });
  } finally {
    if (previousTheme === null) {
      localStorage.removeItem("probplan-theme");
    } else {
      localStorage.setItem("probplan-theme", previousTheme);
    }
  }
});

test("ユーザー入力をHTMLとして解釈せず表示する", async () => {
  await withTestDocument(async root => {
    const unsafeName = "<img src=x onerror=alert(1)>";
    const project = createProject({ name: unsafeName });

    renderProjectSection(root, new ProjectManager([project]), () => {}, () => {}, () => {}, () => {});

    assertEqual(
      root.querySelector(".project-card h3").textContent.trim(),
      unsafeName,
      "プロジェクト名を安全に表示できません。"
    );
    assertEqual(root.querySelectorAll(".project-card img").length, 0, "プロジェクト名がHTMLとして実行されます。");
    assertEqual(escapeHtml(unsafeName), "&lt;img src=x onerror=alert(1)&gt;", "HTMLエスケープが正しくありません。");
  });
});

test("プロジェクトの作成・編集・削除モーダルは各コールバックを実行する", async () => {
  await withTestDocument(async () => {
    let created = null;
    showCreateProjectModal((name, deadline) => {
      created = { name, deadline };
    });
    document.getElementById("project-name").value = "新規プロジェクト";
    document.getElementById("project-deadline").value = "2026-08-20";
    document.getElementById("create-project-submit").click();
    assertEqual(created.name, "新規プロジェクト", "プロジェクト作成名を渡せません。");
    assertEqual(created.deadline, "2026-08-20", "締切日を渡せません。");

    const project = createProject({ name: "変更前" });
    let renamed = null;
    showEditProjectModal(project, name => {
      renamed = name;
    });
    const editInput = document.getElementById("edit-project-name-input");
    editInput.value = "変更後";
    document.getElementById("edit-project-name-form").requestSubmit();
    assertEqual(renamed, "変更後", "プロジェクト名を更新できません。");

    let deleted = null;
    showDeleteProjectModal(project, value => {
      deleted = value;
    });
    assert(Boolean(document.querySelector("#close-delete-project-modal svg")), "閉じるSVGがありません。");
    document.getElementById("confirm-delete-project").click();
    assertEqual(deleted, project, "削除対象を渡せません。");
  });
});

test("プロジェクト一覧は3件表示・追加一覧・データメニューを操作できる", async () => {
  await withTestDocument(async root => {
    const projects = Array.from({ length: 4 }, (_, index) =>
      createProject({ id: `project-${index}`, name: `プロジェクト${index}` })
    );
    const manager = new ProjectManager(projects);
    let exportCount = 0;

    renderProjectSection(
      root,
      manager,
      () => {},
      () => {},
      () => { exportCount++; },
      () => {}
    );

    assertEqual(root.querySelectorAll(".project-card").length, 3, "ホームに3件だけ表示できません。");
    root.querySelector("#data-menu-button").click();
    assertEqual(root.querySelector("#data-menu").classList.contains("hidden"), false, "データメニューを開けません。");
    root.querySelector("#export-data-button").click();
    assertEqual(exportCount, 1, "エクスポート操作を呼び出せません。");

    root.querySelector("#show-more-projects").click();
    assertEqual(document.querySelectorAll(".overflow-project-card").length, 1, "追加プロジェクトをモーダルに表示できません。");
  });
});

test("プロジェクトの右クリックメニューから削除確認を開ける", async () => {
  await withTestDocument(async root => {
    const project = createProject({ tasks: [createTask()] });
    let deleted = null;
    const card = document.createElement("button");
    root.appendChild(card);
    bindProjectContextMenu(card, project, value => {
      deleted = value;
    });

    card.dispatchEvent(new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: 20,
      clientY: 20,
    }));
    document.getElementById("context-delete-project").click();
    document.getElementById("confirm-delete-project").click();

    assertEqual(deleted, project, "右クリック削除を実行できません。");
  });
});

test("タスク作成・編集・完了切替・削除のUI操作を実行できる", async () => {
  await withTestDocument(async root => {
    let created = null;
    showCreateTaskModal(name => {
      created = name;
    });
    document.getElementById("task-name").value = "新規タスク";
    document.getElementById("create-task-submit").click();
    assertEqual(created, "新規タスク", "タスク作成名を渡せません。");

    const task = createTask({ name: "変更前" });
    let updated = null;
    showEditTaskModal(task, (target, data) => {
      updated = { target, data };
    });
    document.getElementById("task-name").value = "変更後";
    document.getElementById("optimistic").value = "2";
    document.getElementById("most-likely").value = "3";
    document.getElementById("pessimistic").value = "5";
    document.getElementById("save-task").click();
    assertEqual(updated.target, task, "編集対象を渡せません。");
    assertEqual(updated.data.name, "変更後", "タスク名を更新できません。");
    assertEqual(updated.data.pessimistic, 5, "見積もりを更新できません。");

    const project = createProject({ tasks: [task] });
    let completion = null;
    renderTaskSection(root, project, () => {}, () => {}, () => {}, (target, completed) => {
      completion = { target, completed };
    });
    root.querySelector(".task-menu-button").click();
    root.querySelector(".task-completion-button").click();
    assertEqual(completion.target, task, "完了対象を渡せません。");
    assertEqual(completion.completed, true, "完了状態を切り替えられません。");

    let deleted = null;
    showDeleteTaskModal(task, value => {
      deleted = value;
    });
    document.getElementById("confirm-delete-task").click();
    assertEqual(deleted, task, "タスク削除を実行できません。");
  });
});

test("ホームの最新未完了タスク表示とタスク検索・クリア操作を確認できる", async () => {
  await withTestDocument(async root => {
    const project = createProject({
      id: "search-project",
      name: "検索プロジェクト",
      tasks: [
        createTask({ id: "todo", name: "認証画面", createdAt: "2026-07-31T00:00:00.000Z" }),
        createTask({ id: "done", name: "完了済み", status: "completed" }),
      ],
    });
    const manager = new ProjectManager([project]);

    renderRecentTaskSection(root, manager);
    assertEqual(root.querySelectorAll(".recent-task-card").length, 1, "完了済みタスクを除外できません。");

    showTaskSearchModal(manager);
    const input = document.getElementById("task-search-input");
    input.value = "認証";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    assertEqual(document.querySelectorAll("#task-search-results button").length, 1, "タスク検索結果を表示できません。");
    document.getElementById("clear-task-search").click();
    assertEqual(input.value, "", "検索文字列をクリアできません。");
    assertEqual(document.activeElement, input, "クリア後に検索欄へフォーカスできません。");
  });
});

test("プロジェクト詳細の進捗・完了予測・締切マーカーを開閉できる", async () => {
  await withTestDocument(async root => {
    const project = createProject({
      deadline: "2030-08-20",
      tasks: [
        createTask({ id: "done", status: "completed", optimistic: 1, mostLikely: 1, pessimistic: 1 }),
        createTask({ id: "todo", optimistic: 3, mostLikely: 3, pessimistic: 3 }),
      ],
    });
    let deadline = null;
    let isOpen = null;

    renderProjectHeader(root, project, value => {
      deadline = value;
    }, () => {}, false, value => {
      isOpen = value;
    });

    assertEqual(root.querySelector("[role=progressbar]").getAttribute("aria-valuenow"), "50", "進捗バーが正しくありません。");
    root.querySelector("#toggle-deadline-settings").click();
    assertEqual(isOpen, true, "詳細設定を開けません。");
    assert(root.querySelector("#deadline-probability-marker").classList.contains("is-visible"), "期限マーカーを表示できません。");
    assert(root.textContent.includes("プロジェクト完了予測"), "完了予測を表示できません。");
    root.querySelector("#project-deadline").value = "2030-09-01";
    root.querySelector("#project-deadline").dispatchEvent(new Event("change"));
    assertEqual(deadline, "2030-09-01", "締切更新を通知できません。");

    renderProjectError(root, document.createElement("section"), {
      title: "プロジェクトが見つかりません",
      description: "確認してください。",
    });
    assert(root.textContent.includes("プロジェクトが見つかりません"), "エラー画面を表示できません。");
  });
});

test("タスクシミュレーションの共有ボタンは結果をコピーする", async () => {
  const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  let copied = "";

  try {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async text => {
          copied = text;
        },
      },
    });

    await withTestDocument(async () => {
      showSimulationModal(createTask({ name: "共有タスク", optimistic: 2, mostLikely: 2, pessimistic: 2 }));
      await new Promise(resolve => requestAnimationFrame(resolve));
      document.getElementById("copy-simulation-result").click();
      await wait(0);

      assert(copied.includes("共有タスクは50%の確率で2日"), "シミュレーション結果をコピーできません。");
      assertEqual(document.querySelector("#copy-simulation-result span").textContent, "コピーしました", "コピー結果を表示できません。");
    });
  } finally {
    if (clipboardDescriptor) {
      Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
    } else {
      delete navigator.clipboard;
    }
  }
});

test("検索ショートカットで検索モーダルを開ける", async () => {
  await withTestDocument(async () => {
    const manager = new ProjectManager();
    initializeTaskSearch(() => manager);

    const isMac = /Mac|iPhone|iPad|iPod/i.test(
      navigator.userAgentData?.platform ?? navigator.platform
    );
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      code: "KeyK",
      metaKey: isMac,
      ctrlKey: !isMac,
    });

    document.dispatchEvent(event);

    assert(event.defaultPrevented, "検索ショートカットを処理できません。");
    assert(Boolean(document.querySelector("#task-search-input")), "検索モーダルを開けません。");
  });
});

export function runUiTests() {
  return suite.run();
}
