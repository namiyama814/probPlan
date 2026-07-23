import { StorageService } from "./services/storageService.js";

const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");

const manager = StorageService.load();

const project = manager.projects.find(
    project => project.id === projectId
);

console.log(project);

const projectHeader = document.getElementById("project-header");

projectHeader.innerHTML = `
    <h1 class="text-3xl font-bold">
        ${project.name}
    </h1>

    <p class="mt-2 text-sm text-[var(--color-text)]/60">
        タスク数：${project.tasks.length}
    </p>
`;