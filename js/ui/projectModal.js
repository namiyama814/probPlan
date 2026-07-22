import { openModal, closeModal } from "./modal.js";

export function showCreateProjectModal(onCreateProject) {
  openModal(`
        <h2 class="text-xl font-bold">
            新しいプロジェクト
        </h2>

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
                class="mt-2 w-full rounded-md border border-[var(--color-text)]/10 px-3 py-2 outline-none focus:border-[var(--color-text)]"
                placeholder="スマイル動画開発"
            >
        </div>

        <button
            id="create-project-submit"
            class="mt-6 w-full rounded-md bg-[var(--color-text)] py-2 text-[var(--color-bg)]"
        >
            作成
        </button>
    `);

  const submitButton = document.getElementById("create-project-submit");
  const input = document.getElementById("project-name");

  submitButton.addEventListener("click", () => {
    const projectName = input.value.trim();

    if (!projectName) {
      return;
    }

    onCreateProject(projectName);

    closeModal();
  });
}