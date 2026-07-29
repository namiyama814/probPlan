import { showCreateProjectModal } from "./projectModal.js";

export function renderProjectSection(
  projectSection,
  manager,
  onCreateProject
) {

  projectSection.innerHTML = `
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold">プロジェクト</h2>

      <button
        id="add-project-button"
        class="hidden h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-text)]/5"
        aria-label="プロジェクトを追加"
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
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </button>
    </div>

    <div
      id="project-content"
      class="mt-6"
    ></div>
    `;

  const content = document.getElementById("project-content");
  const addButton = document.getElementById("add-project-button");

  addButton.addEventListener("click", () => {
    showCreateProjectModal(onCreateProject);
  });

  if (manager.projects.length === 0) {

    addButton.classList.remove("flex");
    addButton.classList.add("hidden");


    content.innerHTML = `
      <button
        id="empty-create-project"
        class="w-full h-56 rounded-xl flex flex-col items-center justify-center transition-colors hover:bg-[var(--color-text)]/5"
      >
        <span class="text-5xl leading-none">+</span>

        <span class="mt-3 text-sm text-[var(--color-text)]/60">
          プロジェクトを作成
        </span>
      </button>
    `;

    const createButton = document.getElementById("empty-create-project");

    createButton.addEventListener("click", () => {
      showCreateProjectModal(onCreateProject);
    });

    return;
  }

  addButton.classList.remove("hidden");
  addButton.classList.add("flex");

  content.innerHTML = manager.projects.map(project => {
    const progress = project.getProgress();

    return `
      <button
        class="project-card w-full rounded-xl p-4 text-left transition-colors hover:bg-[var(--color-text)]/5"
        data-project-id="${project.id}"
      >
        <h3 class="font-semibold">
          ${project.name}
        </h3>

        <div class="mt-1 flex items-center justify-between text-sm">
          <span class="text-[var(--color-text)]/60">
            タスク数：${project.tasks.length}
          </span>
          <span class="font-medium">${progress}%</span>
        </div>

        <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-text)]/10">
          <div
            class="h-full rounded-full bg-[var(--color-text)] transition-[width] duration-300"
            style="width: ${progress}%"
          ></div>
        </div>
      </button>
    `;
  }).join("");

  content.querySelectorAll(".project-card").forEach(button => {
    button.addEventListener("click", () => {
      const projectId = button.dataset.projectId;
      window.location.href = `detail.html?id=${projectId}`;
    });
  });
}
