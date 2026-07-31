// ホーム画面のプロジェクト一覧と、追加・データ入出力メニューを描画する。
import { showCreateProjectModal } from "./projectModal.js";
import { showProjectListModal } from "./projectListModal.js";
import { escapeHtml } from "./escapeHtml.js";
import {
  bindProjectContextMenu,
  closeProjectContextMenu,
} from "./projectContextMenu.js";

let activeDataMenu = null;
let activeDataMenuButton = null;
let dataMenuCloseTimer = null;
let showArchivedProjects = false;

function closeDataMenu() {
  const menu = activeDataMenu;

  if (dataMenuCloseTimer !== null) {
    window.clearTimeout(dataMenuCloseTimer);
    dataMenuCloseTimer = null;
  }

  if (menu) {
    // hidden をすぐ付けると閉じるアニメーションが描画されないため、
    // 先に開閉状態だけを戻してから display を切り替える。
    menu.classList.remove("is-open");
    dataMenuCloseTimer = window.setTimeout(() => {
      menu.classList.add("hidden");
      dataMenuCloseTimer = null;
    }, 150);
  }

  activeDataMenuButton?.setAttribute("aria-expanded", "false");

  activeDataMenu = null;
  activeDataMenuButton = null;

  document.removeEventListener("pointerdown", handleDataMenuPointerDown);
  document.removeEventListener("keydown", handleDataMenuKeydown);
}

function handleDataMenuPointerDown(event) {
  if (
    activeDataMenu?.contains(event.target) ||
    activeDataMenuButton?.contains(event.target)
  ) {
    return;
  }

  closeDataMenu();
}

function handleDataMenuKeydown(event) {
  if (event.key === "Escape") {
    const button = activeDataMenuButton;
    closeDataMenu();
    button?.focus();
    return;
  }

  const items = [...(activeDataMenu?.querySelectorAll('[role="menuitem"]') ?? [])];
  const currentIndex = items.indexOf(document.activeElement);
  if (items.length === 0 || currentIndex < 0) return;

  let nextIndex = currentIndex;
  if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % items.length;
  if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + items.length) % items.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = items.length - 1;
  if (nextIndex === currentIndex) return;

  event.preventDefault();
  items[nextIndex].focus();
}

export function renderProjectSection(
  projectSection,
  manager,
  onCreateProject,
  onDeleteProject,
  onExportData,
  onImportData,
  onToggleProjectArchive = () => {},
  onToggleArchivedProjects = () => {},
  archivedProjectsVisible = false
) {
  // 再描画時に古い右クリック／データメニューのイベントを解除する。
  showArchivedProjects = archivedProjectsVisible;
  closeProjectContextMenu();
  closeDataMenu();

  projectSection.innerHTML = `
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold">プロジェクト</h2>

      <div class="flex items-center gap-1">
        <button
          id="add-project-button"
          class="hidden h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-text)]/5"
          aria-label="プロジェクトを追加"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>

        <div class="relative">
          <button
            id="data-menu-button"
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-text)]/5"
            aria-label="データのメニュー"
            aria-haspopup="menu"
            aria-expanded="false"
            aria-controls="data-menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="h-5 w-5"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="5" cy="12" r="1.6"/>
              <circle cx="12" cy="12" r="1.6"/>
              <circle cx="19" cy="12" r="1.6"/>
            </svg>
          </button>

          <div
            id="data-menu"
            class="data-menu absolute right-0 top-11 z-30 hidden w-44 rounded-md border border-[var(--color-text)]/10 bg-[var(--color-surface)] p-1 shadow-lg"
            role="menu"
          >
            <button
              id="toggle-archived-projects"
              type="button"
              role="menuitem"
              class="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--color-text)]/5"
              aria-pressed="${showArchivedProjects}"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M3 7h18" />
                <path d="M5 7v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" />
                <path d="M9 11h6" />
                <path d="M10 3h4a2 2 0 0 1 2 2v2H8V5a2 2 0 0 1 2-2Z" />
              </svg>
              ${showArchivedProjects ? "通常を表示" : "アーカイブを表示"}
            </button>

            <button
              id="export-data-button"
              type="button"
              role="menuitem"
              class="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--color-text)]/5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
              エクスポート
            </button>

            <button
              id="import-data-button"
              type="button"
              role="menuitem"
              class="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--color-text)]/5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M12 21V9" />
                <path d="m17 14-5-5-5 5" />
                <path d="M5 3h14" />
              </svg>
              インポート
            </button>
          </div>

          <input
            id="import-data-input"
            type="file"
            accept=".pplp"
            class="hidden"
          >
        </div>
      </div>
    </div>

    <div
      id="project-content"
      class="mt-6"
    ></div>

    <p
      id="data-transfer-status"
      class="mt-3 hidden text-sm text-[var(--color-muted)]"
      role="status"
      aria-live="polite"
    ></p>
    `;

  const content = document.getElementById("project-content");
  const addButton = document.getElementById("add-project-button");
  const dataMenuButton = document.getElementById("data-menu-button");
  const dataMenu = document.getElementById("data-menu");
  const archivedToggle = document.getElementById("toggle-archived-projects");
  const exportButton = document.getElementById("export-data-button");
  const importButton = document.getElementById("import-data-button");
  const importInput = document.getElementById("import-data-input");

  archivedToggle.addEventListener("click", () => {
    showArchivedProjects = !showArchivedProjects;
    closeDataMenu();
    onToggleArchivedProjects(showArchivedProjects);
  });

  addButton.addEventListener("click", () => {
    showCreateProjectModal(onCreateProject);
  });

  dataMenuButton.addEventListener("click", event => {
    event.stopPropagation();

    if (activeDataMenu === dataMenu) {
      closeDataMenu();
      return;
    }

    closeDataMenu();

    activeDataMenu = dataMenu;
    activeDataMenuButton = dataMenuButton;
    if (dataMenuCloseTimer !== null) {
      window.clearTimeout(dataMenuCloseTimer);
      dataMenuCloseTimer = null;
    }
    dataMenu.classList.remove("hidden");
    // display の反映後に状態を変更して、開くアニメーションを確実に開始する。
    window.requestAnimationFrame(() => {
      if (activeDataMenu === dataMenu) dataMenu.classList.add("is-open");
    });
    dataMenuButton.setAttribute("aria-expanded", "true");
    dataMenu.querySelector('[role="menuitem"]')?.focus();

    document.addEventListener("pointerdown", handleDataMenuPointerDown);
    document.addEventListener("keydown", handleDataMenuKeydown);
  });

  exportButton.addEventListener("click", () => {
    closeDataMenu();
    onExportData();
  });

  importButton.addEventListener("click", () => {
    closeDataMenu();
    importInput.click();
  });

  importInput.addEventListener("change", event => {
    onImportData(event);
  });

  const listedProjects = manager.projects.filter(
    project => showArchivedProjects || !project.archived
  );

  if (listedProjects.length === 0) {

    addButton.classList.remove("flex");
    addButton.classList.add("hidden");


    content.innerHTML = `
      <button
        id="empty-create-project"
        class="w-full h-56 rounded-xl flex flex-col items-center justify-center transition-colors hover:bg-[var(--color-text)]/5"
      >
        <span class="text-5xl leading-none">+</span>

        <span class="mt-3 text-sm text-[var(--color-text)]/60">
          プロジェクトを作成
        </span>
      </button>
    `;

    const createButton = document.getElementById("empty-create-project");

    createButton.addEventListener("click", () => {
      showCreateProjectModal(onCreateProject);
    });

    return;
  }

  addButton.classList.remove("hidden");
  addButton.classList.add("flex");

  const visibleProjects = listedProjects.slice(0, 3);
  const overflowProjects = listedProjects.slice(3);

  content.innerHTML = visibleProjects.map(project => {
    const progress = project.getProgress();

    return `
      <button
        class="project-card w-full rounded-xl p-4 text-left transition-colors hover:bg-[var(--color-text)]/5"
        data-project-id="${project.id}"
      >
        <h3 class="font-semibold ${project.archived ? "text-[var(--color-text)]/50" : ""}">
        ${escapeHtml(project.name)}
        </h3>
        ${project.archived ? `<span class="text-xs text-[var(--color-muted)]">アーカイブ済み</span>` : ""}

        <div class="mt-1 flex items-center justify-between text-sm">
          <span class="text-[var(--color-text)]/60">
            タスク数：${project.tasks.length}
          </span>
          <span class="font-medium">${progress}%</span>
        </div>

        <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-text)]/10">
          <div
            class="h-full rounded-full bg-[var(--color-text)] transition-[width] duration-300"
            style="width: ${progress}%"
          ></div>
        </div>
      </button>
    `;
  }).join("") + (
    overflowProjects.length > 0
      ? `
        <button
          id="show-more-projects"
          type="button"
          class="mt-2 flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm text-[var(--color-text)]/60 transition-colors hover:bg-[var(--color-text)]/5 hover:text-[var(--color-text)]"
        >
          <span>その他のプロジェクトを表示</span>
        </button>
      `
      : ""
  );

  content.querySelectorAll(".project-card").forEach(button => {
    const project = manager.getProject(button.dataset.projectId);

    button.addEventListener("click", () => {
      const projectId = button.dataset.projectId;
      window.location.href = `detail.html?id=${projectId}`;
    });

    bindProjectContextMenu(
      button,
      project,
      onDeleteProject,
      onToggleProjectArchive
    );
  });

  content
    .querySelector("#show-more-projects")
    ?.addEventListener("click", () => {
      showProjectListModal(
        overflowProjects,
        onDeleteProject,
        onToggleProjectArchive
      );
    });
}
