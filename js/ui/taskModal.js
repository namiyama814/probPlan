// タスク作成・編集・削除の各モーダルを提供する。
import { openModal, closeModal } from "./modal.js";
import {
  MAX_NAME_LENGTH,
  clearFieldError,
  showFieldError,
  validateName,
} from "./formValidation.js";

export function showCreateTaskModal(onCreateTask) {

openModal(`
  <div class="relative">

    <h2 class="text-xl font-bold">
      新しいタスク
    </h2>

    <button
      id="close-task-modal"
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
        for="task-name"
        class="block text-sm font-medium"
      >
        タスク名
      </label>

      <input
        id="task-name"
        type="text"
        maxlength="${MAX_NAME_LENGTH}"
        aria-describedby="create-task-error"
        class="mt-2 w-full rounded-md border border-[var(--color-text)]/10 px-3 py-2 outline-none focus:border-[var(--color-text)]"
        placeholder="認証画面を実装"
      >
      <p
        id="create-task-error"
        class="mt-2 min-h-5 text-sm text-[var(--color-danger)]"
        role="alert"
        aria-live="polite"
      ></p>
    </div>
    <div class="mt-4">
      <label for="task-deadline" class="block text-sm font-medium">期限日（任意）</label>
      <input
        id="task-deadline"
        type="date"
        class="mt-2 w-full rounded-md border border-[var(--color-text)]/10 px-3 py-2"
      >
    </div>
    <button
      id="create-task-submit"
      type="button"
      class="mt-6 w-full rounded-md bg-[var(--color-text)] py-2 text-[var(--color-bg)]"
    >
      作成
    </button>
`);

const closeButton = document.getElementById("close-task-modal");
const submitButton = document.getElementById("create-task-submit");
const input = document.getElementById("task-name");
const deadlineInput = document.getElementById("task-deadline");
const error = document.getElementById("create-task-error");

closeButton.addEventListener("click", () => {
  closeModal();
});

submitButton.addEventListener("click", () => {
  const validation = validateName(input.value, "タスク名");

  if (validation.error) {
    showFieldError(error, input, validation.error);
    return;
  }

  clearFieldError(error, [input]);
  onCreateTask(validation.value, deadlineInput.value || null);
  closeModal();
  });

input.addEventListener("keydown", event => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  submitButton.click();
});
}

export function showEditTaskModal(task, onUpdateTask) {
  openModal(`
    <div class="relative">
      <h2 class="text-xl font-bold">タスクを編集</h2>
      <button
        id="close-task-modal"
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
        for="task-name"
        class="block text-sm font-medium"
      >
        タスク名
      </label>
      <input
        id="task-name"
        type="text"
        maxlength="${MAX_NAME_LENGTH}"
        aria-describedby="task-error"
        class="mt-2 w-full rounded-md border border-[var(--color-text)]/10 px-3 py-2"
      >
    </div>

    <div class="mt-4">
      <label for="task-deadline" class="block text-sm font-medium">期限日（任意）</label>
      <input
        id="task-deadline"
        type="date"
        class="mt-2 w-full rounded-md border border-[var(--color-text)]/10 px-3 py-2"
      >
    </div>

    <div class="mt-4">
      <label for="optimistic" class="block text-sm font-medium">最短日数</label>
      <input
        id="optimistic"
        type="number"
        min="0"
        step="0.1"
        aria-describedby="task-error"
        class="mt-2 w-full rounded-md border border-[var(--color-text)]/10 px-3 py-2"
      >
    </div>

    <div class="mt-4">
      <label for="most-likely" class="block text-sm font-medium">最頻日数</label>
      <input
        id="most-likely"
        type="number"
        min="0"
        step="0.1"
        aria-describedby="task-error"
        class="mt-2 w-full rounded-md border border-[var(--color-text)]/10 px-3 py-2"
      >
    </div>

    <div class="mt-4">
      <label for="pessimistic" class="block text-sm font-medium">最長日数</label>
      <input
        id="pessimistic"
        type="number"
        min="0"
        step="0.1"
        aria-describedby="task-error"
        class="mt-2 w-full rounded-md border border-[var(--color-text)]/10 px-3 py-2"
      >
    </div>

    <p
      id="task-error"
      class="mt-4 min-h-5 text-sm text-[var(--color-danger)]"
      role="alert"
      aria-live="polite"
    ></p>

    <button
      id="save-task"
      type="button"
      class="mt-6 w-full rounded-md bg-[var(--color-text)] py-2 text-[var(--color-bg)]"
    >
      保存
    </button>
  `);

  document.getElementById("task-name").value = task.name;
  document.getElementById("optimistic").value = task.optimistic ?? "";
  document.getElementById("most-likely").value = task.mostLikely ?? "";
  document.getElementById("pessimistic").value = task.pessimistic ?? "";
  document.getElementById("task-deadline").value = task.deadline ?? "";

  document
    .getElementById("close-task-modal")
    .addEventListener("click", closeModal);

  document
    .getElementById("save-task")
    .addEventListener("click", () => {
      const nameInput = document.getElementById("task-name");

      const optimisticInput = document.getElementById("optimistic");
      const mostLikelyInput = document.getElementById("most-likely");
      const pessimisticInput = document.getElementById("pessimistic");
      const deadlineInput = document.getElementById("task-deadline");

      const error = document.getElementById("task-error");

      const inputs = [
        nameInput,
        optimisticInput,
        mostLikelyInput,
        pessimisticInput,
      ];
      clearFieldError(error, inputs);

      const nameValidation = validateName(nameInput.value, "タスク名");

      if (nameValidation.error) {
        showFieldError(error, nameInput, nameValidation.error);
        return;
      }

      const optimistic =
        optimisticInput.value === ""
          ? null
          : Number(optimisticInput.value);

      const mostLikely =
        mostLikelyInput.value === ""
          ? null
          : Number(mostLikelyInput.value);

      const pessimistic =
        pessimisticInput.value === ""
          ? null
          : Number(pessimisticInput.value);

      if (
        optimistic === null ||
        mostLikely === null ||
        pessimistic === null
      ) {
        // 3点見積もりは順序が予測の前提になるため、保存前に確認する。
        const missingInput = [optimisticInput, mostLikelyInput, pessimisticInput]
          .find(input => input.value === "");
        showFieldError(error, missingInput, "見積日数を全て入力してください。");
        return;
      }

      if (
        !Number.isFinite(optimistic) ||
        !Number.isFinite(mostLikely) ||
        !Number.isFinite(pessimistic) ||
        optimistic < 0 ||
        mostLikely < 0 ||
        pessimistic < 0
      ) {
        const invalidInput = [optimisticInput, mostLikelyInput, pessimisticInput]
          .find(input => !Number.isFinite(Number(input.value)) || Number(input.value) < 0);
        showFieldError(error, invalidInput, "日数は0以上で入力してください。");
        return;
      }

      if (
        optimistic > mostLikely ||
        mostLikely > pessimistic
      ) {
        showFieldError(
          error,
          optimisticInput,
          "最短日数 ≤ 最頻日数 ≤ 最長日数の順で入力してください。"
        );
        return;
      }

      onUpdateTask(task, {
          name: nameValidation.value,
          optimistic,
          mostLikely,
          pessimistic,
          deadline: deadlineInput.value || null,
      });

      closeModal();
    });
}

export function showDeleteTaskModal(task, onDeleteTask) {
  openModal(`
    <div class="relative">
      <h2 class="text-xl font-bold">タスクを削除</h2>
      <button
        id="close-delete-task-modal"
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

    <p class="mt-6 text-sm leading-6 text-[var(--color-text)]/70">
      「<span id="delete-task-name"></span>」を削除します。
      この操作は元に戻せません。
    </p>

    <div class="mt-6 flex gap-3">
      <button
        id="cancel-delete-task"
        type="button"
        class="flex-1 rounded-md border border-[var(--color-text)]/10 py-2 transition-colors hover:bg-[var(--color-text)]/5"
      >
        キャンセル
      </button>
      <button
        id="confirm-delete-task"
        type="button"
        class="flex-1 rounded-md bg-[var(--color-danger)] py-2 text-[var(--color-danger-contrast)]"
      >
        削除
      </button>
    </div>
  `);

  document.getElementById("delete-task-name").textContent = task.name;

  document
    .getElementById("close-delete-task-modal")
    .addEventListener("click", closeModal);

  document
    .getElementById("cancel-delete-task")
    .addEventListener("click", closeModal);

  document
    .getElementById("confirm-delete-task")
    .addEventListener("click", () => {
      onDeleteTask(task);
      closeModal();
    });
}
