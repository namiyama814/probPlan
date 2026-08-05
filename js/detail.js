// プロジェクト詳細画面のエントリポイント。URLのidから対象を決め、タスク操作を接続する。
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
  reorderTask,
} from "./controllers/taskController.js";
import {
  updateProjectDeadline,
  updateProjectName,
} from "./controllers/projectController.js";
import { initializeTheme } from "./ui/theme.js";
import { initializeTaskSearch } from "./ui/taskSearch.js";
import { showUndoToast } from "./ui/undoToast.js";

const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");
const APP_STORAGE_KEY = "probplan";

let manager = StorageService.load();
let project = projectId
  ? manager?.getProject(projectId)
  : null;

const projectHeader = document.getElementById("project-header");
const taskSection = document.getElementById("task-section");
let isDeadlineSettingsOpen = false;

initializeTheme();
initializeTaskSearch(() => manager);

function setProjectPageTitle(targetProject) {
  const projectName = targetProject?.name?.trim();
  if (projectName) {
    document.title = `${projectName} - ProbPlan`;
  }
}

function render() {
  // 対象がない場合も空画面にせず、原因が分かるエラー表示へ切り替える。
  renderProjectHeader(
    projectHeader,
    project,
    onUpdateProjectDeadline,
    onUpdateProjectName,
    isDeadlineSettingsOpen,
    onToggleDeadlineSettings
  );

  renderTaskSection(
    taskSection,
    project,
    onCreateTask,
    onUpdateTask,
    onDeleteTask,
    onSetTaskCompleted,
    onReorderTask
  );
}

function renderCurrentState() {
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
    return;
  }

  if (!project) {
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
    return;
  }

  render();
  setProjectPageTitle(project);
}

function reloadFromStorage() {
  // CLI画面など別タブからの更新を、詳細画面のタスク一覧へ即座に反映する。
  manager = StorageService.load();
  project = projectId && manager
    ? manager.getProject(projectId)
    : null;
  renderCurrentState();
}

function onCreateTask(taskName, deadline, priority) {
  createTask(
    manager,
    project,
    taskName,
    deadline,
    priority
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
  const originalIndex = project.tasks.indexOf(task);
  deleteTask(
    manager,
    project,
    task.id
  );
  render();
  showUndoToast("タスクを削除しました", () => {
    project.tasks.splice(originalIndex, 0, task);
    StorageService.save(manager);
    render();
  });
}

function onSetTaskCompleted(task, isCompleted) {
  setTaskCompleted(
    manager,
    task,
    isCompleted
  );
  render();
}

function onReorderTask(taskId, targetTaskId) {
  reorderTask(manager, project, taskId, targetTaskId);
  render();
}

function onUpdateProjectDeadline(deadline) {
  updateProjectDeadline(manager, project, deadline);
  render();
}

function onUpdateProjectName(projectName) {
  updateProjectName(manager, project, projectName);
  render();
}

function onToggleDeadlineSettings(isOpen) {
  isDeadlineSettingsOpen = isOpen;
}

renderCurrentState();

window.addEventListener("storage", event => {
  if (event.key !== APP_STORAGE_KEY) return;
  reloadFromStorage();
});
