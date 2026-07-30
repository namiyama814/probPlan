import { closeModal, openModal } from "./modal.js";

function isMacPlatform() {
  const platform = navigator.userAgentData?.platform ?? navigator.platform;

  return /Mac|iPhone|iPad|iPod/i.test(platform);
}

function getShortcutLabel() {
  return isMacPlatform() ? "⌘ K" : "Ctrl + K";
}

function renderSearchResults(container, manager, query) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    container.innerHTML = `
      <p class="px-3 py-8 text-center text-sm text-[var(--color-text)]/60">
        すべてのプロジェクトからタスクを検索できます。
      </p>
    `;
    return;
  }

  const results = manager?.searchTasks(normalizedQuery) ?? [];

  if (results.length === 0) {
    container.innerHTML = `
      <p class="px-3 py-8 text-center text-sm text-[var(--color-text)]/60">
        一致するタスクはありません。
      </p>
    `;
    return;
  }

  container.replaceChildren(
    ...results.map(({ task, project }) => {
      const button = document.createElement("button");
      const name = document.createElement("span");
      const metadata = document.createElement("span");

      button.type = "button";
      button.className =
        "flex w-full items-center justify-between gap-4 rounded-md px-3 py-3 text-left transition-colors hover:bg-[var(--color-text)]/5 focus:bg-[var(--color-text)]/5 focus:outline-none";
      name.className = "min-w-0 truncate text-sm font-medium";
      metadata.className = "shrink-0 text-xs text-[var(--color-text)]/60";

      name.textContent = task.name;
      metadata.textContent = `${project.name}${
        task.status === "completed" ? " · 完了" : ""
      }`;

      button.append(name, metadata);
      button.addEventListener("click", () => {
        window.location.href = `./detail.html?id=${encodeURIComponent(project.id)}`;
      });

      return button;
    })
  );
}

export function showTaskSearchModal(manager) {
  openModal(
    `
      <div class="relative">
        <h2 class="text-xl font-bold">タスクを検索</h2>

        <button
          id="close-task-search-modal"
          type="button"
          class="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-[var(--color-text)]/10 hover:text-[var(--color-text)]"
          aria-label="閉じる"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="relative mt-6">
        <label for="task-search-input" class="sr-only">タスクを検索</label>
        <input
          id="task-search-input"
          type="text"
          role="searchbox"
          autocomplete="off"
          enterkeyhint="search"
          placeholder="タスク名を入力"
          class="w-full rounded-md border border-[var(--color-text)]/10 py-2 pl-3 pr-10 outline-none focus:border-[var(--color-text)]"
        >

        <button
          id="clear-task-search"
          type="button"
          class="absolute right-1 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--color-text)]/60 transition-colors hover:bg-[var(--color-text)]/5 hover:text-[var(--color-text)]"
          aria-label="検索文字列をクリア"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div
        id="task-search-results"
        class="mt-3 max-h-80 overflow-y-auto"
        aria-live="polite"
      ></div>

      <p class="mt-4 text-xs text-[var(--color-text)]/60">
        <kbd class="rounded border border-[var(--color-text)]/15 px-1.5 py-0.5">${getShortcutLabel()}</kbd>
        でいつでも開けます。
      </p>
    `,
    { maxWidth: "max-w-xl" }
  );

  const closeButton = document.getElementById("close-task-search-modal");
  const input = document.getElementById("task-search-input");
  const results = document.getElementById("task-search-results");
  const clearButton = document.getElementById("clear-task-search");

  function updateSearchResults() {
    renderSearchResults(results, manager, input.value);
    clearButton.classList.toggle("hidden", input.value.length === 0);
  }

  updateSearchResults();

  closeButton.addEventListener("click", closeModal);
  input.addEventListener("input", () => {
    updateSearchResults();
  });
  clearButton.addEventListener("click", () => {
    input.value = "";
    updateSearchResults();
    input.focus();
  });
  input.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  window.requestAnimationFrame(() => input.focus());
}

export function initializeTaskSearch(getManager) {
  document.addEventListener("keydown", event => {
    const isMacShortcut =
      event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey &&
      event.code === "KeyK";
    const isWindowsShortcut =
      event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey &&
      event.code === "KeyK";

    const isShortcut = isMacPlatform()
      ? isMacShortcut
      : isWindowsShortcut;

    if (event.isComposing || !isShortcut) return;

    event.preventDefault();
    showTaskSearchModal(getManager());
  });
}
