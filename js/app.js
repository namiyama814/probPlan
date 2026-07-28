import { ProjectManager } from "./models/projectManager.js";
import { StorageService } from "./services/storageService.js";
import { createProject } from "./controllers/projectController.js";
import { renderProjectSection } from "./ui/projectView.js";

const projectSection = document.getElementById("project-section");
const taskSection = document.getElementById("task-section");
const resultSection = document.getElementById("result-section");

let manager = StorageService.load();

if (!manager) {
  manager = new ProjectManager();
};

function render() {
  renderProjectSection(
    projectSection,
    manager,
    onCreateProject
  );

  taskSection.innerHTML = `
      <h2 class="text-lg font-bold">タスク一覧</h2>
    `;
};

function onCreateProject(projectName) {
  const project = createProject(manager, projectName);
  render();
};

render();