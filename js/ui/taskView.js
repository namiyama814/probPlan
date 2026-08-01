// 詳細画面のタスク一覧。編集・シミュレーション・完了・削除をまとめる。
import { showSimulationModal } from "./simulationModal.js";
import { escapeHtml } from "./escapeHtml.js";
import { getTaskDeadlineInfo } from "./taskDeadline.js";
import {
  showCreateTaskModal,
  showDeleteTaskModal,
  showEditTaskModal,
} from "./taskModal.js";

let activeTaskMenu = null;
let activeTaskMenuButton = null;
let taskMenuCloseTimer = null;

const PRIORITY_LABELS = { high: "高", medium: "中", low: "低" };

function handleMenuKeydown(event) {
  if (event.key === "Escape") {
    const button = activeTaskMenuButton;
    closeActiveTaskMenu();
    button?.focus();
    return;
  }

  const items = [...(activeTaskMenu?.querySelectorAll('[role="menuitem"]') ?? [])];
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

function closeActiveTaskMenu() {
  const menu = activeTaskMenu;

  if (taskMenuCloseTimer !== null) {
    window.clearTimeout(taskMenuCloseTimer);
    taskMenuCloseTimer = null;
  }

  if (menu) {
    // 閉じる状態を先に反映し、アニメーション完了後に非表示へ戻す。
    menu.classList.remove("is-open");
    taskMenuCloseTimer = window.setTimeout(() => {
      menu.classList.add("hidden");
      taskMenuCloseTimer = null;
    }, 150);
  }

  activeTaskMenuButton?.setAttribute("aria-expanded", "false");

  activeTaskMenu = null;
  activeTaskMenuButton = null;

  document.removeEventListener("click", closeActiveTaskMenu);
  document.removeEventListener("keydown", handleMenuKeydown);
}

export function renderTaskSection(
    taskSection,
    project,
    onCreateTask,
    onUpdateTask,
    onDeleteTask,
    onSetTaskCompleted
) {
  // タスク更新後の再描画で、古いメニュー状態とイベントを残さない。
  closeActiveTaskMenu();

  taskSection.innerHTML = `
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">
        タスク一覧
      </h2>
  
      <button
        id="add-task-button"
        class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-text)]/5"
        aria-label="タスクを追加"
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
        >
          <path d="M12 5v14"/>
          <path d="M5 12h14"/>
        </svg>
      </button>
    </div>
  
    <div
      id="task-list"
      class="mt-6 space-y-2"
    >
      ${project.tasks.length === 0
        ? `
          <div class="flex min-h-40 items-center justify-center rounded-xl">
            <p class="text-sm text-[var(--color-text)]/60">
              タスクはまだありません
            </p>
          </div>
        `
        : project.tasks.map(task => {
        const deadline = getTaskDeadlineInfo(task.deadline);
        const deadlineMarkup = deadline
          ? `<p class="mt-1 text-xs ${deadline.isOverdue ? "text-[var(--color-danger)]" : "text-[var(--color-text)]/60"}">
              ${deadline.isOverdue ? "期限超過" : "期限"}：${deadline.label}
            </p>`
          : "";

        return `
        <div
          class="flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-[var(--color-text)]/5"
        >
      
          <button
            class="task-card min-w-0 flex-1 text-left"
            data-task-id="${task.id}"
          >
            <h3 class="truncate font-medium ${
              task.status === "completed"
                ? "text-[var(--color-text)]/50 line-through"
                : ""
            }">
                ${escapeHtml(task.name)}
            </h3>
            <span class="mt-1 inline-flex rounded-full px-2 py-0.5 text-xs ${
              task.priority === "high"
                ? "bg-[var(--color-danger-soft)] text-[var(--color-danger)]"
                : "bg-[var(--color-text)]/10 text-[var(--color-text)]/70"
            }">
              優先度：${PRIORITY_LABELS[task.priority] ?? PRIORITY_LABELS.medium}
            </span>

            <p class="mt-1 text-sm text-[var(--color-text)]/60">
              ${task.status === "completed" ? "完了 · " : ""}${
                task.optimistic === null
                  ? "見積未設定"
                  : `${task.optimistic} / ${task.mostLikely} / ${task.pessimistic} 日`
              }
            </p>
            ${deadlineMarkup}
          </button>

          <div class="ml-4 flex items-center gap-1">
            <button
              class="simulation-button flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-text)]/10"
              data-task-id="${task.id}"
              type="button"
              title="シミュレーション"
              aria-label="タスクをシミュレーション"
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
                <path d="M3 3v18h18"/>
                <path d="M7 16v-4"/>
                <path d="M12 16V8"/>
                <path d="M17 16V5"/>
              </svg>
            </button>

            <div class="relative">
              <button
                class="task-menu-button flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-text)]/10"
                data-task-id="${task.id}"
                type="button"
                aria-label="タスクのメニュー"
                aria-haspopup="menu"
                aria-expanded="false"
                aria-controls="task-menu-${task.id}"
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
                id="task-menu-${task.id}"
                class="task-menu absolute right-0 top-11 z-30 hidden w-44 rounded-md border border-[var(--color-text)]/10 bg-[var(--color-surface)] p-1 shadow-lg"
                role="menu"
              >
                <button
                  class="task-completion-button flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--color-text)]/5"
                  data-task-id="${task.id}"
                  data-completed="${task.status === "completed"}"
                  type="button"
                  role="menuitem"
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
                    ${
                      task.status === "completed"
                        ? `
                          <path d="M3 12a9 9 0 1 0 3-6.7"/>
                          <path d="M3 3v6h6"/>
                        `
                        : `
                          <path d="m5 12 4 4L19 6"/>
                        `
                    }
                  </svg>
                  ${
                    task.status === "completed"
                      ? "未完了に戻す"
                      : "完了にする"
                  }
                </button>

                <div class="my-1 border-t border-[var(--color-text)]/10"></div>

                <button
                  class="task-delete-button flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-soft)]"
                  data-task-id="${task.id}"
                  type="button"
                  role="menuitem"
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
                    <path d="M3 6h18"/>
                    <path d="M8 6V4h8v2"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v5"/>
                    <path d="M14 11v5"/>
                  </svg>
                  タスクを削除
                </button>
              </div>
            </div>
          </div>

        </div>
      `;
      }).join("")}
    </div>
  `;

  taskSection.querySelectorAll(".task-card").forEach(button => {
    button.addEventListener("click", () => {
      const taskId = button.dataset.taskId;
      const task = project.getTask(taskId);
      showEditTaskModal(task, onUpdateTask);
    });
  });

  taskSection.querySelectorAll(".simulation-button").forEach(button => {
    button.addEventListener("click", () => {
      const task =
        project.getTask(button.dataset.taskId);
      showSimulationModal(task);
    });
  });

  taskSection.querySelectorAll(".task-menu-button").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();

      const menu = taskSection.querySelector(
        `#task-menu-${button.dataset.taskId}`
      );
      const wasOpen = activeTaskMenu === menu;

      closeActiveTaskMenu();

      if (wasOpen) return;

      activeTaskMenu = menu;
      activeTaskMenuButton = button;
      if (taskMenuCloseTimer !== null) {
        window.clearTimeout(taskMenuCloseTimer);
        taskMenuCloseTimer = null;
      }
      menu.classList.remove("hidden");
      // display の反映後に開く状態を付けて、開くアニメーションを開始する。
      window.requestAnimationFrame(() => {
        if (activeTaskMenu === menu) menu.classList.add("is-open");
      });
      button.setAttribute("aria-expanded", "true");
      menu.querySelector('[role="menuitem"]')?.focus();

      document.addEventListener("click", closeActiveTaskMenu);
      document.addEventListener("keydown", handleMenuKeydown);
    });
  });

  taskSection.querySelectorAll(".task-completion-button").forEach(button => {
    button.addEventListener("click", () => {
      const task = project.getTask(button.dataset.taskId);
      const isCompleted = button.dataset.completed === "true";

      onSetTaskCompleted(task, !isCompleted);
    });
  });

  taskSection.querySelectorAll(".task-delete-button").forEach(button => {
    button.addEventListener("click", () => {
      const task = project.getTask(button.dataset.taskId);

      closeActiveTaskMenu();
      showDeleteTaskModal(task, onDeleteTask);
    });
  });

  const addButton = taskSection.querySelector("#add-task-button");

  addButton.addEventListener("click", () => {
    showCreateTaskModal(onCreateTask);
  });
}
