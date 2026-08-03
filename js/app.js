// ホーム画面のエントリポイント。保存データを読み込み、各UIと操作を接続する。
import { ProjectManager } from "./models/projectManager.js";
import { StorageService } from "./services/storageService.js";
import {
  createProject,
  deleteProject,
  toggleProjectArchive,
} from "./controllers/projectController.js";
import { renderProjectSection } from "./ui/projectView.js";
import { renderRecentTaskSection } from "./ui/recentTaskView.js";
import { renderDataRecoveryView } from "./ui/dataRecoveryView.js";
import { initializeTheme } from "./ui/theme.js";
import { initializeTaskSearch } from "./ui/taskSearch.js";
import { showUndoToast } from "./ui/undoToast.js";
import { showImportPreviewModal } from "./ui/importPreviewModal.js";
import { shouldShowTutorial, showTutorial } from "./ui/tutorialModal.js";
import {
  createExportFile,
  getExportFileName,
  parseImportData,
} from "./services/dataTransferService.js";

const projectSection = document.getElementById("project-section");
const taskSection = document.getElementById("task-section");

const savedState = StorageService.loadState();

let manager = savedState.manager;
let hasCorruptedData = savedState.status === "corrupted";
let showArchivedProjects = false;

if (!manager) {
  manager = new ProjectManager();
};

initializeTheme();
initializeTaskSearch(() => manager);

function render() {
  if (hasCorruptedData) {
    renderDataRecoveryView(projectSection, taskSection, resetCorruptedData);
    return;
  }

  // データ更新後はホームの2セクションを同じマネージャーから再描画する。
  renderProjectSection(
    projectSection,
    manager,
    onCreateProject,
    onDeleteProject,
    exportData,
    importData,
    onToggleProjectArchive,
    onToggleArchivedProjects,
    showArchivedProjects
  );

  renderRecentTaskSection(
    taskSection,
    manager
  );
};

function resetCorruptedData() {
  StorageService.clear();
  manager = new ProjectManager();
  hasCorruptedData = false;
  showArchivedProjects = false;
  render();
}

function onCreateProject(projectName, deadline) {
  const project = createProject(manager, projectName, deadline);
  render();
};

function onDeleteProject(project) {
  const originalIndex = manager.projects.indexOf(project);
  deleteProject(manager, project.id);
  render();
  showUndoToast("プロジェクトを削除しました", () => {
    manager.projects.splice(originalIndex, 0, project);
    StorageService.save(manager);
    render();
  });
}

function onToggleProjectArchive(project) {
  toggleProjectArchive(manager, project);
  render();
}

function onToggleArchivedProjects(isVisible) {
  showArchivedProjects = isVisible;
  render();
}

function showDataTransferStatus(message, isError = false) {
  const dataTransferStatus = document.getElementById(
    "data-transfer-status"
  );

  if (!dataTransferStatus) return;

  dataTransferStatus.textContent = message;
  dataTransferStatus.classList.remove("hidden");
  dataTransferStatus.classList.toggle(
    "text-[var(--color-danger)]",
    isError
  );
  dataTransferStatus.classList.toggle(
    "text-[var(--color-muted)]",
    !isError
  );
}

function clearDataTransferStatus() {
  const dataTransferStatus = document.getElementById(
    "data-transfer-status"
  );

  if (!dataTransferStatus) return;

  dataTransferStatus.textContent = "";
  dataTransferStatus.classList.add("hidden");
}

function exportData() {
  clearDataTransferStatus();

  const url = URL.createObjectURL(createExportFile(manager));
  const link = document.createElement("a");

  link.href = url;
  link.download = getExportFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function importData(event) {
  // ファイル選択の結果を検証し、成功したデータだけを現在の状態へ置き換える。
  const [file] = event.target.files;

  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".pplp")) {
    showDataTransferStatus(
      ".pplpファイルを選択してください。",
      true
    );
    event.target.value = "";
    return;
  }

  try {
    const importedManager = parseImportData(await file.text());

    showImportPreviewModal(importedManager, confirmedManager => {
      manager = confirmedManager;
      StorageService.save(manager);
      render();
    });
  } catch {
    showDataTransferStatus(
      "ファイルを読み込めませんでした。内容を確認してください。",
      true
    );
  } finally {
    event.target.value = "";
  }
}

render();

if (shouldShowTutorial()) {
  window.requestAnimationFrame(showTutorial);
}
