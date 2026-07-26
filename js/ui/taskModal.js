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

export function showEditTaskModal(task, onUpdateTask) {
  openModal(`
    <div class="relative">
      <h2 class="text-xl font-bold">タスクを編集</h2>
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
        value="${task.name}"
        class="mt-2 w-full rounded-md border border-[var(--color-text)]/10 px-3 py-2"
      >
    </div>

    <div class="mt-4">
      <label class="block text-sm font-medium">最短日数</label>
      <input
        id="optimistic"
        type="number"
        value="${task.optimistic ?? ""}"
        class="mt-2 w-full rounded-md border border-[var(--color-text)]/10 px-3 py-2"
      >
    </div>

    <div class="mt-4">
      <label class="block text-sm font-medium">最頻日数</label>
      <input
        id="most-likely"
        type="number"
        value="${task.mostLikely ?? ""}"
        class="mt-2 w-full rounded-md border border-[var(--color-text)]/10 px-3 py-2"
      >
    </div>

    <div class="mt-4">
      <label class="block text-sm font-medium">最長日数</label>
      <input
        id="pessimistic"
        type="number"
        value="${task.pessimistic ?? ""}"
        class="mt-2 w-full rounded-md border border-[var(--color-text)]/10 px-3 py-2"
      >
    </div>

    <p
      id="task-error"
      class="mt-4 text-sm text-red-500 min-h-5"
    ></p>

    <button
      id="save-task"
      class="mt-6 w-full rounded-md bg-[var(--color-text)] py-2 text-[var(--color-bg)]"
    >
      保存
    </button>
  `);

  document
    .getElementById("close-task-modal")
    .addEventListener("click", closeModal);

  document
    .getElementById("save-task")
    .addEventListener("click", () => {
      const name = document.getElementById("task-name").value.trim();
  
      const optimisticInput = document.getElementById("optimistic");
      const mostLikelyInput = document.getElementById("most-likely");
      const pessimisticInput = document.getElementById("pessimistic");

      const error = document.getElementById("task-error");

      error.textContent = "";

      if (name === "") {
        error.textContent = "タスク名を入力してください";
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
        error.textContent = "見積日数を全て入力してください";
        return;
      }

      if (
        optimistic < 0 ||
        mostLikely < 0 ||
        pessimistic < 0
      ) {
        error.textContent = "日数は0以上で入力してください";
        return;
      }

      if (
        optimistic > mostLikely ||
        mostLikely > pessimistic
      ) {
        error.textContent =
          "最短日数 ≤ 最頻日数 ≤ 最長日数の順で入力してください";
        return;
      }

      onUpdateTask(task, {
          name,
          optimistic,
          mostLikely,
          pessimistic,
      });
        
      closeModal();
    });
}