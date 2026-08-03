// 保存データを読み込めない場合の復旧導線を表示する。
export function renderDataRecoveryView(projectSection, taskSection, onResetData) {
  projectSection.innerHTML = `
    <div class="flex min-h-80 flex-col items-center justify-center text-center">
      <div
        class="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)] text-[var(--color-danger)]"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-6 w-6"
        >
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
      </div>

      <h2 class="mt-5 text-lg font-bold">
        保存データを読み込めませんでした
      </h2>

      <p class="mt-3 max-w-sm text-sm leading-6 text-[var(--color-text)]/60">
        ブラウザに保存されているデータが壊れている可能性があります。
        壊れたデータを削除すると、新しい状態でアプリを使い始められます。
      </p>

      <button
        id="reset-corrupted-data"
        type="button"
        class="mt-6 rounded-md bg-[var(--color-danger)] px-5 py-2.5 text-sm font-medium text-[var(--color-danger-contrast)] transition-opacity hover:opacity-85"
      >
        壊れたデータを削除して復旧
      </button>
    </div>
  `;

  taskSection.innerHTML = `
    <div class="flex h-56 items-center justify-center text-center">
      <p class="px-4 text-sm leading-6 text-[var(--color-text)]/60">
        復旧すると、プロジェクトとタスクを新しく作成できます。
      </p>
    </div>
  `;

  projectSection
    .querySelector("#reset-corrupted-data")
    .addEventListener("click", onResetData);
}
