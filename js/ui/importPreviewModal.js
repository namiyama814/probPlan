// インポートするデータの概要を表示し、確認後にだけ現在のデータを置き換える。
import { closeModal, openModal } from "./modal.js";

export function showImportPreviewModal(manager, onConfirm) {
  const projectCount = manager.projects.length;
  const taskCount = manager.projects.reduce(
    (total, project) => total + project.tasks.length,
    0
  );

  openModal(`
    <div class="relative">
      <h2 class="text-xl font-bold">インポート内容の確認</h2>
      <button
        id="close-import-preview"
        type="button"
        class="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-[var(--color-text)]/10 hover:text-[var(--color-text)]"
        aria-label="閉じる"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="mt-6 rounded-lg bg-[var(--color-text)]/5 p-4 text-sm">
      <p>プロジェクト：<strong>${projectCount}件</strong></p>
      <p class="mt-2">タスク：<strong>${taskCount}件</strong></p>
    </div>

    <p class="mt-4 text-sm leading-6 text-[var(--color-danger)]">
      現在のプロジェクトとタスクは、インポートした内容に置き換わります。
    </p>

    <div class="mt-6 flex gap-3">
      <button
        id="cancel-import-preview"
        type="button"
        class="flex-1 rounded-md border border-[var(--color-text)]/10 py-2 transition-colors hover:bg-[var(--color-text)]/5"
      >
        キャンセル
      </button>
      <button
        id="confirm-import-preview"
        type="button"
        class="flex-1 rounded-md bg-[var(--color-text)] py-2 text-[var(--color-bg)]"
      >
        インポートする
      </button>
    </div>
  `);

  document
    .getElementById("close-import-preview")
    .addEventListener("click", closeModal);
  document
    .getElementById("cancel-import-preview")
    .addEventListener("click", closeModal);
  document
    .getElementById("confirm-import-preview")
    .addEventListener("click", () => {
      onConfirm(manager);
      closeModal();
    });
}
