import {
  showCreateTaskModal,
  showEditTaskModal
} from "./taskModal.js";

export function renderTaskSection(
    taskSection,
    project,
    onCreateTask,
    onUpdateTask
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
        <div
          class="flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-[var(--color-text)]/5"
        >
      
          <button
            class="task-card flex-1 text-left"
            data-task-id="${task.id}"
          >
            <h3 class="font-medium">
              ${task.name}
            </h3>
      
            <p class="mt-1 text-sm text-[var(--color-text)]/60">
              ${
                task.optimistic === null
                  ? "見積未設定"
                  : `${task.optimistic} / ${task.mostLikely} / ${task.pessimistic} 日`
              }
            </p>
          </button>
      
          <button
            class="simulation-button ml-4 flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-text)]/10"
            data-task-id="${task.id}"
            title="シミュレーション"
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
              <path d="M3 3v18h18"/>
              <path d="M7 16v-4"/>
              <path d="M12 16V8"/>
              <path d="M17 16V5"/>
            </svg>
          </button>
      
        </div>
      `).join("")}
    </div>
  `;

  document.querySelectorAll(".task-card").forEach(button => {
    button.addEventListener("click", () => {
      const taskId = button.dataset.taskId;
      const task = project.getTask(taskId);
      showEditTaskModal(task, onUpdateTask);
    });
  });

  const addButton = document.getElementById("add-task-button");

  addButton.addEventListener("click", () => {
    showCreateTaskModal(onCreateTask);
  });
}