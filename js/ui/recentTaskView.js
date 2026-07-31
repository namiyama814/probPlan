// ホーム画面に最新の未完了タスクだけを表示する。
import { escapeHtml } from "./escapeHtml.js";

export function renderRecentTaskSection(taskSection, manager) {
  const recentTasks = manager.getRecentTasks(3, {
    includeCompleted: false,
  });

  taskSection.innerHTML = `
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold">タスク一覧</h2>
    </div>

    <div class="mt-6 space-y-1">
      ${recentTasks.length === 0
        ? `
          <div class="flex h-56 items-center justify-center">
            <p class="text-sm text-[var(--color-text)]/60">
              未完了のタスクはありません
            </p>
          </div>
        `
        : recentTasks.map(({ task, project }) => `
          <button
            class="recent-task-card w-full rounded-xl p-4 text-left transition-colors hover:bg-[var(--color-text)]/5"
            data-project-id="${project.id}"
            data-task-id="${task.id}"
            type="button"
          >
            <div class="min-w-0">
              <h3 class="truncate font-medium">
                ${escapeHtml(task.name)}
              </h3>

              <p class="mt-1 truncate text-sm text-[var(--color-text)]/60">
                ${escapeHtml(project.name)}
              </p>
            </div>
          </button>
        `).join("")}
    </div>
  `;

  taskSection.querySelectorAll(".recent-task-card").forEach(button => {
    button.addEventListener("click", () => {
      window.location.href =
        `detail.html?id=${button.dataset.projectId}`;
    });
  });
}
