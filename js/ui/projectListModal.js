import { openModal, closeModal } from "./modal.js";
import { bindProjectContextMenu } from "./projectContextMenu.js";
import { escapeHtml } from "./escapeHtml.js";

export function showProjectListModal(projects, onDeleteProject) {
  openModal(`
    <div class="relative">
      <h2 class="text-xl font-bold">その他のプロジェクト</h2>

      <p class="mt-1 text-sm text-[var(--color-text)]/60">
        ${projects.length}件
      </p>

      <button
        id="close-project-list-modal"
        type="button"
        class="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-[var(--color-text)]/10 hover:text-[var(--color-text)]"
        aria-label="閉じる"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <div
      id="overflow-project-list"
      class="mt-6 max-h-[60vh] space-y-1 overflow-y-auto pr-1"
    >
      ${projects.map(project => {
        const progress = project.getProgress();

        return `
          <button
            class="overflow-project-card w-full rounded-xl p-4 text-left transition-colors hover:bg-[var(--color-text)]/5"
            data-project-id="${project.id}"
            type="button"
          >
            <h3 class="truncate font-semibold">
              ${escapeHtml(project.name)}
            </h3>

            <div class="mt-1 flex items-center justify-between text-sm">
              <span class="text-[var(--color-text)]/60">
                タスク数：${project.tasks.length}
              </span>
              <span class="font-medium">${progress}%</span>
            </div>

            <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-text)]/10">
              <div
                class="h-full rounded-full bg-[var(--color-text)]"
                style="width: ${progress}%"
              ></div>
            </div>
          </button>
        `;
      }).join("")}
    </div>
  `, {
    maxWidth: "max-w-xl"
  });

  document
    .getElementById("close-project-list-modal")
    .addEventListener("click", closeModal);

  document
    .querySelectorAll(".overflow-project-card")
    .forEach(button => {
      const project = projects.find(
        project => project.id === button.dataset.projectId
      );

      button.addEventListener("click", () => {
        window.location.href =
          `detail.html?id=${button.dataset.projectId}`;
      });

      bindProjectContextMenu(
        button,
        project,
        onDeleteProject
      );
    });
}
