import { ProjectManager } from "./models/projectManager.js";
import { StorageService } from "./services/storageService.js";
import {
  createProject,
  deleteProject,
} from "./controllers/projectController.js";
import { renderProjectSection } from "./ui/projectView.js";
import { renderRecentTaskSection } from "./ui/recentTaskView.js";
import { initializeTheme } from "./ui/theme.js";

const projectSection = document.getElementById("project-section");
const taskSection = document.getElementById("task-section");
const resultSection = document.getElementById("result-section");

let manager = StorageService.load();

if (!manager) {
  manager = new ProjectManager();
};

initializeTheme();

function render() {
  renderProjectSection(
    projectSection,
    manager,
    onCreateProject,
    onDeleteProject
  );

  renderRecentTaskSection(
    taskSection,
    manager
  );
};

function onCreateProject(projectName) {
  const project = createProject(manager, projectName);
  render();
};

function onDeleteProject(project) {
  deleteProject(manager, project.id);
  render();
}

render();
