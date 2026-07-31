// プロジェクト削除前に対象と不可逆操作であることを確認するモーダル。
import { openModal, closeModal } from "./modal.js";

export function showDeleteProjectModal(project, onDeleteProject) {
  openModal(`
    <div class="relative">
      <h2 class="text-xl font-bold">プロジェクトを削除</h2>

      <button
        id="close-delete-project-modal"
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

    <p class="mt-6 text-sm leading-6 text-[var(--color-text)]/70">
      「<span id="delete-project-name"></span>」を削除します。
      ${
        project.tasks.length > 0
          ? `含まれる${project.tasks.length}件のタスクも削除されます。`
          : ""
      }
      この操作は元に戻せません。
    </p>

    <div class="mt-6 flex gap-3">
      <button
        id="cancel-delete-project"
        type="button"
        class="flex-1 rounded-md border border-[var(--color-text)]/10 py-2 transition-colors hover:bg-[var(--color-text)]/5"
      >
        キャンセル
      </button>
      <button
        id="confirm-delete-project"
        type="button"
        class="flex-1 rounded-md bg-[var(--color-danger)] py-2 text-[var(--color-danger-contrast)]"
      >
        削除
      </button>
    </div>
  `);

  document.getElementById("delete-project-name").textContent =
    project.name;

  document
    .getElementById("close-delete-project-modal")
    .addEventListener("click", closeModal);

  document
    .getElementById("cancel-delete-project")
    .addEventListener("click", closeModal);

  document
    .getElementById("confirm-delete-project")
    .addEventListener("click", () => {
      onDeleteProject(project);
      closeModal();
    });
}
