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
                class="hidden rounded-md border border-[--color-text]/10 p-2 hover:bg-[--color-text]/5"
                aria-label="プロジェクトを追加"
            >
                +
            </button>
        </div>

        <div
            id="project-content"
            class="mt-6"
        ></div>
    `;

    const content = document.getElementById("project-content");
    const addButton = document.getElementById("add-project-button");

    if (manager.projects.length === 0) {

        addButton.classList.add("hidden");

        content.innerHTML = `
            <button
                id="empty-create-project"
                class="w-full h-56 border-2 border-dashed border-[--color-text]/10 rounded-md flex flex-col items-center justify-center hover:bg-[--color-text]/5 transition"
            >
                <span class="text-5xl leading-none">+</span>

                <span class="mt-3 text-sm text-[--color-text]/60">
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

    content.innerHTML = `
        <div class="space-y-2">
            プロジェクト一覧
        </div>
    `;
}