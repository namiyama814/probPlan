import { StorageService } from "./services/storageService.js";
import { renderProjectHeader } from "./ui/projectDetailView.js";
import { renderTaskSection } from "./ui/taskView.js";
import {
  createTask,
  deleteTask,
  setTaskCompleted,
  updateTask,
} from "./controllers/taskController.js";
import { initializeTheme } from "./ui/theme.js";

const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");

const manager = StorageService.load();

const project = manager.projects.find(
    project => project.id === projectId
);

const projectHeader = document.getElementById("project-header");
const taskSection = document.getElementById("task-section");

initializeTheme();

function render() {
  renderProjectHeader(
    projectHeader,
    project
  );

  renderTaskSection(
    taskSection,
    project,
    onCreateTask,
    onUpdateTask,
    onDeleteTask,
    onSetTaskCompleted
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

function onUpdateTask(task, data) {
  updateTask(
    manager,
    task,
    data
  );
  render();
}

function onDeleteTask(task) {
  deleteTask(
    manager,
    project,
    task.id
  );
  render();
}

function onSetTaskCompleted(task, isCompleted) {
  setTaskCompleted(
    manager,
    task,
    isCompleted
  );
  render();
}
