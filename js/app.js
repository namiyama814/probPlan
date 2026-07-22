import { ProjectManager } from "./models/ProjectManager.js";
import { StorageService } from "./services/storageService.js";
import { renderProjectSection } from "./ui/projectView.js";

const projectSection = document.getElementById("project-section");
const taskSection = document.getElementById("task-section");
const resultSection = document.getElementById("result-section");

let manager = StorageService.load();

if (!manager) {
    manager = new ProjectManager();
}

renderProjectSection(projectSection, manager);

taskSection.innerHTML = `
<h2 class="text-lg font-bold">タスク一覧</h2>
`;

resultSection.innerHTML = `
<h2 class="text-lg font-bold">
    シミュレーション結果
</h2>
`;