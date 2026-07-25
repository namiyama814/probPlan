import { showCreateTaskModal } from "./taskModal.js";

export function renderTaskSection(
  taskSection,
  project,
  onCreateTask
) {
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
      ${project.tasks.map(task => `
        <button class="w-full rounded-xl p-4 text-left transition-colors hover:bg-[var(--color-text)]/5">
          <h3 class="font-medium">${task.name}</h3>
          <p class="mt-1 text-sm text-[var(--color-text)]/60">見積未設定</p>
        </button>
      `).join("")}
    </div>
  `;

  const addButton = document.getElementById("add-task-button");

  addButton.addEventListener("click", () => {
    showCreateTaskModal(onCreateTask);
  });
}