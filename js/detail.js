import { StorageService } from "./services/storageService.js";
import {
  renderProjectError,
  renderProjectHeader,
} from "./ui/projectDetailView.js";
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
const project = projectId
  ? manager?.getProject(projectId)
  : null;

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

if (!projectId) {
  document.title = "プロジェクトが指定されていません | ProbPlan";
  renderProjectError(
    projectHeader,
    taskSection,
    {
      title: "プロジェクトが指定されていません",
      description:
        "ホーム画面から表示するプロジェクトを選択してください。",
    }
  );
} else if (!project) {
  document.title = "プロジェクトが見つかりません | ProbPlan";
  renderProjectError(
    projectHeader,
    taskSection,
    {
      title: "プロジェクトが見つかりません",
      description:
        "削除されたか、URLが正しくない可能性があります。",
    }
  );
} else {
  render();
}

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
