import { openModal, closeModal } from "./modal.js";

export function showCreateTaskModal(onCreateTask) {

openModal(`
  <div class="relative">

    <h2 class="text-xl font-bold">
      新しいタスク
    </h2>

    <button
      id="close-task-modal"
      type="button"
      class="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
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
        class="mt-2 w-full rounded-md border border-[var(--color-text)]/10 px-3 py-2 outline-none focus:border-[var(--color-text)]"
        placeholder="認証画面を実装"
      >
    </div>
    <button
      id="create-task-submit"
      class="mt-6 w-full rounded-md bg-[var(--color-text)] py-2 text-[var(--color-bg)]"
    >
      作成
    </button>
`);

const closeButton = document.getElementById("close-task-modal");
const submitButton = document.getElementById("create-task-submit");
const input = document.getElementById("task-name");

closeButton.addEventListener("click", () => {
  closeModal();
});

submitButton.addEventListener("click", () => {
  const taskName = input.value.trim();
  if (!taskName) { return; }

  onCreateTask(taskName);
  closeModal();
  });
}