import { ProjectManager } from "./models/projectManager.js";
import { StorageService } from "./services/storageService.js";
import {
  createProject,
  deleteProject,
} from "./controllers/projectController.js";
import { renderProjectSection } from "./ui/projectView.js";
import { renderRecentTaskSection } from "./ui/recentTaskView.js";
import { initializeTheme } from "./ui/theme.js";
import {
  createExportFile,
  getExportFileName,
  parseImportData,
} from "./services/dataTransferService.js";

const projectSection = document.getElementById("project-section");
const taskSection = document.getElementById("task-section");

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
    onDeleteProject,
    exportData,
    importData
  );

  renderRecentTaskSection(
    taskSection,
    manager
  );
};

function onCreateProject(projectName, deadline) {
  const project = createProject(manager, projectName, deadline);
  render();
};

function onDeleteProject(project) {
  deleteProject(manager, project.id);
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

    manager = importedManager;
    StorageService.save(manager);
    render();
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
