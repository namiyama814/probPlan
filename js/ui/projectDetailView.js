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

export function renderProjectError(
  projectHeader,
  taskSection,
  { title, description }
) {
  projectHeader.className =
    "flex min-h-[70vh] items-center justify-center";

  projectHeader.innerHTML = `
    <div class="max-w-md text-center">
      <div
        class="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-text)]/10 bg-[var(--color-surface)]"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-6 w-6 text-[var(--color-text)]/60"
        >
          <path d="M3 7h6l2 2h10v10H3z"/>
          <path d="M9 14h6"/>
        </svg>
      </div>

      <h1 class="mt-6 text-2xl font-bold">
        ${title}
      </h1>

      <p class="mt-3 text-sm leading-6 text-[var(--color-text)]/60">
        ${description}
      </p>

      <a
        href="./index.html"
        class="mt-7 inline-flex items-center justify-center rounded-md bg-[var(--color-text)] px-5 py-2.5 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-85"
      >
        ホームに戻る
      </a>
    </div>
  `;

  taskSection.innerHTML = "";
  taskSection.hidden = true;
}
