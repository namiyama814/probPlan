export function renderProjectHeader(projectHeader, project) {
  const progress = project.getProgress();

  projectHeader.innerHTML = `
    <h1 class="text-3xl font-bold">
      ${project.name}
    </h1>

    <p class="mt-2 text-sm text-[var(--color-text)]/60">
      タスク数：${project.tasks.length}
    </p>

    <div class="mt-5 max-w-md">
      <div class="flex items-center justify-between text-sm">
        <span class="text-[var(--color-text)]/60">プロジェクト進捗</span>
        <span class="font-medium">${progress}%</span>
      </div>

      <div
        class="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-text)]/10"
        role="progressbar"
        aria-label="プロジェクト進捗"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${progress}"
      >
        <div
          class="h-full rounded-full bg-[var(--color-text)] transition-[width] duration-300"
          style="width: ${progress}%"
        ></div>
      </div>
    </div>
  `;
}
