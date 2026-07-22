import { openModal } from "./modal.js";

export function renderProjectSection(
  projectSection,
  manager,
  onCreateProject
) {

  // プロジェクトセクション全体を描画
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

  // HTML生成後に取得
  const content = document.getElementById("project-content");
  const addButton = document.getElementById("add-project-button");

  // プロジェクトが存在しない場合
  if (manager.projects.length === 0) {

    addButton.classList.add("hidden");

    content.innerHTML = `
                <button
                    id="empty-create-project"
                    class="w-full h-56 border-2 border-dashed border-[#252525]/10 rounded-md flex flex-col items-center justify-center hover:bg-[#252525]/5 transition"
                >
                    <span class="text-5xl leading-none">+</span>

                    <span class="mt-3 text-sm text-[#252525]/60">
                        プロジェクトを作成
                    </span>
                </button>
            `;

    const createButton = document.getElementById("empty-create-project");

    createButton.addEventListener("click", () => {

      openModal(` <h2 class="text-xl font-bold">新しいプロジェクト</h2>
        <div class="mt-6">
          <label for="project-name" class="block text-sm font-medium" >
            プロジェクト名
          </label> 
          <input id="project-name" type="text" class="mt-2 w-full rounded-md border border-[#252525]/10 px-3 py-2 outline-none focus:border-[#252525]" placeholder="スマイル動画開発" >
        </div>
        <button id="create-project-submit" class="mt-6 w-full rounded-md bg-[#252525] py-2 text-white" >
        作成
        </button> `);

      const submitButton = document.getElementById("create-project-submit");
      const input = document.getElementById("project-name");

      submitButton.addEventListener("click", () => {

        const projectName = input.value.trim();

        if (!projectName) {
          return;
        }

        onCreateProject(projectName);

      });

    });

    return;
  }

  // プロジェクトが存在する場合
  addButton.classList.remove("hidden");

  content.innerHTML = `
        <div class="space-y-2">
            プロジェクト一覧
        </div>
    `;
}