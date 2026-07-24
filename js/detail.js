import { StorageService } from "./services/storageService.js";
import { renderProjectHeader } from "./ui/projectDetailView.js";
import { renderTaskSection } from "./ui/taskView.js";
import { createTask } from "./controllers/taskController.js";

const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");

const manager = StorageService.load();

const project = manager.projects.find(
    project => project.id === projectId
);

const projectHeader = document.getElementById("project-header");
const taskSection = document.getElementById("task-section");

function render() {
  renderProjectHeader(
    projectHeader,
    project
  );

  renderTaskSection(
    taskSection,
    project,
    onCreateTask
  );
}

render();

function onCreateTask(taskName) {
  createTask(
    manager,
    project,
    taskName
  );
  render();
}