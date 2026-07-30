import { getProjectDeadlineForecast } from "../simulation/projectSimulation.js";
import { showEditProjectModal } from "./projectModal.js";

function renderDeadlineForecast(project) {
  const forecast = getProjectDeadlineForecast(project);

  if (forecast.status === "available") {
    return `
      <div class="mt-4">
        <div class="flex items-center justify-between text-sm">
          <span class="text-[var(--color-text)]/60">期限達成率</span>
          <span class="font-medium">${forecast.probability}%</span>
        </div>

        <div
          class="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-text)]/10"
          role="progressbar"
          aria-label="期限達成率"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="${forecast.probability}"
        >
          <div
            class="h-full rounded-full bg-[var(--color-text)] transition-[width] duration-300"
            style="width: ${forecast.probability}%"
          ></div>
        </div>

        <p class="mt-2 text-xs text-[var(--color-text)]/60">
          締切まであと${forecast.daysRemaining}日
        </p>
      </div>
    `;
  }

  if (forecast.status === "missing-estimates") {
    return `
      <p class="mt-4 text-xs leading-5 text-[var(--color-text)]/60">
        未完了タスク${forecast.missingEstimateCount}件の見積もりを入力すると、期限達成率を算出できます。
      </p>
    `;
  }

  if (forecast.status === "overdue") {
    return `
      <div class="mt-4 flex items-center justify-between text-sm">
        <span class="text-[var(--color-text)]/60">期限達成率</span>
        <span class="font-medium">0%</span>
      </div>

      <p class="mt-2 text-xs text-[var(--color-danger)]">
        締切日を過ぎています。
      </p>
    `;
  }

  if (forecast.status === "completed") {
    return `
      <p class="mt-4 text-xs text-[var(--color-text)]/60">
        すべてのタスクが完了しています。
      </p>
    `;
  }

  return `
    <p class="mt-4 text-xs leading-5 text-[var(--color-text)]/60">
      締切日を設定すると、期限達成率を確認できます。
    </p>
  `;
}

export function renderProjectHeader(
  projectHeader,
  project,
  onUpdateProjectDeadline,
  onUpdateProjectName = () => {},
  isDeadlineSettingsOpen = false,
  onToggleDeadlineSettings = () => {}
) {
  const progress = project.getProgress();

  projectHeader.innerHTML = `
    <div class="max-w-2xl">
      <div class="group flex items-center gap-2">
        <h1 class="text-3xl font-bold">
          ${project.name}
        </h1>

        <button
          id="edit-project-name"
          type="button"
          class="flex h-9 w-9 shrink-0 pointer-events-none items-center justify-center rounded-lg text-[var(--color-text)]/60 opacity-0 transition-[opacity,colors] hover:bg-[var(--color-text)]/5 hover:text-[var(--color-text)] group-hover:pointer-events-auto group-hover:opacity-100 focus:pointer-events-auto focus:opacity-100"
          aria-label="プロジェクト名を編集"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      </div>

      <p class="mt-2 text-sm text-[var(--color-text)]/60">
        タスク数：${project.tasks.length}
      </p>

      <div class="mt-6 max-w-xl">
        <div class="flex items-center justify-between text-sm">
          <span class="text-[var(--color-text)]/60">プロジェクト進捗</span>
          <span class="font-medium">${progress}%</span>
        </div>

        <div
          class="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-text)]/10"
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

        <button
          id="toggle-deadline-settings"
          type="button"
          class="mt-4 flex items-center gap-1.5 text-sm text-[var(--color-text)]/60 transition-colors hover:text-[var(--color-text)]"
          aria-expanded="${isDeadlineSettingsOpen}"
          aria-controls="deadline-settings"
        >
          詳細設定
          <svg
            id="deadline-settings-icon"
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 transition-transform ${
              isDeadlineSettingsOpen ? "rotate-180" : ""
            }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <section
          id="deadline-settings"
          class="deadline-settings ${
            isDeadlineSettingsOpen ? "is-open" : ""
          }"
          aria-hidden="${!isDeadlineSettingsOpen}"
          ${isDeadlineSettingsOpen ? "" : "inert"}
        >
          <div class="deadline-settings-content">
            <div class="mt-4 border-t border-[var(--color-text)]/10 pt-4">
              <div class="flex items-center justify-between gap-3">
                <span class="text-sm text-[var(--color-text)]/60">締切日</span>
                <input
                  id="project-deadline"
                  type="date"
                  value="${project.deadline ?? ""}"
                  class="h-8 rounded-md border border-[var(--color-text)]/10 px-2 text-xs"
                  aria-label="締切日"
                >
              </div>

              ${renderDeadlineForecast(project)}
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  const deadlineSettingsButton = projectHeader.querySelector(
    "#toggle-deadline-settings"
  );
  const deadlineSettings = projectHeader.querySelector(
    "#deadline-settings"
  );
  const deadlineSettingsIcon = projectHeader.querySelector(
    "#deadline-settings-icon"
  );
  projectHeader
    .querySelector("#edit-project-name")
    .addEventListener("click", () => {
      showEditProjectModal(project, onUpdateProjectName);
    });

  deadlineSettingsButton.addEventListener("click", () => {
    const isOpen = deadlineSettings.classList.toggle("is-open");

    deadlineSettingsButton.setAttribute("aria-expanded", String(isOpen));
    deadlineSettingsIcon.classList.toggle("rotate-180", isOpen);
    deadlineSettings.setAttribute("aria-hidden", String(!isOpen));
    deadlineSettings.inert = !isOpen;
    onToggleDeadlineSettings(isOpen);
  });

  projectHeader
    .querySelector("#project-deadline")
    .addEventListener("change", event => {
      onUpdateProjectDeadline(event.target.value || null);
    });
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
