export function renderProjectHeader(projectHeader, project) {
  projectHeader.innerHTML = `
    <h1 class="text-3xl font-bold">
      ${project.name}
    </h1>

    <p class="mt-2 text-sm text-[var(--color-text)]/60">
      タスク数：${project.tasks.length}
    </p>
  `;
}