import { openModal, closeModal } from "./modal.js";
import {
  MAX_NAME_LENGTH,
  clearFieldError,
  showFieldError,
  validateName,
} from "./formValidation.js";

export function showCreateProjectModal(onCreateProject) {
  openModal(`
    <div class="relative">
      <h2 class="text-xl font-bold">
        新しいプロジェクト
      </h2>

      <button
        id="close-project-modal"
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
        >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
        </svg>
      </button>
    </div>
    <div class="mt-6">
      <label
        for="project-name"
        class="block text-sm font-medium"
      >
        プロジェクト名
      </label>

      <input
        id="project-name"
        type="text"
        maxlength="${MAX_NAME_LENGTH}"
        aria-describedby="create-project-error"
        class="mt-2 w-full rounded-md border border-[var(--color-text)]/10 px-3 py-2 outline-none focus:border-[var(--color-text)]"
        placeholder="スマイル動画開発"
      >
      <p
        id="create-project-error"
        class="mt-2 min-h-5 text-sm text-[var(--color-danger)]"
        role="alert"
        aria-live="polite"
      ></p>
    </div>

    <div class="mt-4">
      <label
        for="project-deadline"
        class="block text-sm font-medium"
      >
        締切日（任意）
      </label>

      <input
        id="project-deadline"
        type="date"
        class="mt-2 w-full rounded-md border border-[var(--color-text)]/10 px-3 py-2 outline-none focus:border-[var(--color-text)]"
      >
    </div>

    <button
      id="create-project-submit"
      type="button"
      class="mt-6 w-full rounded-md bg-[var(--color-text)] py-2 text-[var(--color-bg)]"
    >
      作成
    </button>
  `);

  const closeButton = document.getElementById("close-project-modal");
  const submitButton = document.getElementById("create-project-submit");
  const input = document.getElementById("project-name");
  const deadlineInput = document.getElementById("project-deadline");
  const error = document.getElementById("create-project-error");

  closeButton.addEventListener("click", () => {
    closeModal();
  });

  submitButton.addEventListener("click", () => {
    const validation = validateName(input.value, "プロジェクト名");

    if (validation.error) {
      showFieldError(error, input, validation.error);
      return;
    }

    clearFieldError(error, [input]);
    onCreateProject(validation.value, deadlineInput.value || null);
    closeModal();
  });
};

export function showEditProjectModal(project, onUpdateProjectName) {
  openModal(`
    <div class="relative">
      <h2 class="text-xl font-bold">プロジェクト名を編集</h2>

      <button
        id="close-edit-project-modal"
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

    <form id="edit-project-name-form" class="mt-6" novalidate>
      <label
        for="edit-project-name-input"
        class="block text-sm font-medium"
      >
        プロジェクト名
      </label>

      <input
        id="edit-project-name-input"
        type="text"
        maxlength="${MAX_NAME_LENGTH}"
        aria-describedby="edit-project-name-error"
        required
        class="mt-2 w-full rounded-md border border-[var(--color-text)]/10 px-3 py-2 outline-none focus:border-[var(--color-text)]"
      >

      <p
        id="edit-project-name-error"
        class="mt-2 min-h-5 text-sm text-[var(--color-danger)]"
        role="alert"
        aria-live="polite"
      ></p>

      <button
        type="submit"
        class="mt-4 w-full rounded-md bg-[var(--color-text)] py-2 text-[var(--color-bg)] transition-opacity hover:opacity-85"
      >
        保存
      </button>
    </form>
  `);

  const closeButton = document.getElementById("close-edit-project-modal");
  const form = document.getElementById("edit-project-name-form");
  const input = document.getElementById("edit-project-name-input");
  const error = document.getElementById("edit-project-name-error");

  input.value = project.name;

  closeButton.addEventListener("click", closeModal);

  form.addEventListener("submit", event => {
    event.preventDefault();

    const validation = validateName(input.value, "プロジェクト名");

    if (validation.error) {
      showFieldError(error, input, validation.error);
      return;
    }

    clearFieldError(error, [input]);

    if (validation.value !== project.name) {
      onUpdateProjectName(validation.value);
    }

    closeModal();
  });

  window.requestAnimationFrame(() => {
    input.focus();
    input.select();
  });
}
