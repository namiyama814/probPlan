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
import { initializeHomePanels } from "./ui/homePanels.js";
import { initializeTaskSearch } from "./ui/taskSearch.js";
import { showUndoToast } from "./ui/undoToast.js";
import { showImportPreviewModal } from "./ui/importPreviewModal.js";
import { shouldShowTutorial, showTutorial } from "./ui/tutorialModal.js";
import {
  createExportFile,
  getExportFileName,
  parseImportData,
} from "./services/dataTransferService.js";
import { addSampleProject } from "./services/sampleDataService.js";

const projectSection = document.getElementById("project-section");
const taskSection = document.getElementById("task-section");
const homePanelScroller = document.getElementById("home-panel-scroll");
const homePanelTabs = [...document.querySelectorAll(".home-panel-tab")];

const savedState = StorageService.loadState();
const APP_STORAGE_KEY = "probplan";

let manager = savedState.manager;
let hasCorruptedData = savedState.status === "corrupted";
let showArchivedProjects = false;

if (!manager) {
  manager = new ProjectManager();
};

initializeTheme();
initializeTaskSearch(() => manager);
initializeHomePanels({
  scroller: homePanelScroller,
  panels: [projectSection, taskSection],
  tabs: homePanelTabs,
});

function render() {
  if (hasCorruptedData) {
    // 保存データが壊れている時は通常描画を止め、復旧操作だけを提示する。
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

function reloadFromStorage() {
  // terminal.html など別画面からlocalStorageが更新された時に、ホームの表示を同期する。
  const currentState = StorageService.loadState();

  manager = currentState.manager ?? new ProjectManager();
  hasCorruptedData = currentState.status === "corrupted";
  showArchivedProjects = false;
  render();
}

function resetCorruptedData() {
  // 壊れたlocalStorageを消して、空のプロジェクト一覧として再描画する。
  StorageService.clear();
  manager = new ProjectManager();
  hasCorruptedData = false;
  showArchivedProjects = false;
  render();
}

function onCreateProject(projectName, deadline) {
  const project = createProject(manager, projectName, deadline);
  render();
  if (project?.id) {
    window.location.href = `detail.html?id=${encodeURIComponent(project.id)}`;
  }
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

function loadSampleData() {
  // チュートリアルからの投入は、既存データを上書きせずサンプルだけ追加する。
  addSampleProject(manager);
  StorageService.save(manager);
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

window.addEventListener("storage", event => {
  if (event.key !== APP_STORAGE_KEY) return;
  reloadFromStorage();
});

if (shouldShowTutorial()) {
  window.requestAnimationFrame(() => {
    showTutorial({ onLoadSampleData: loadSampleData });
  });
}
