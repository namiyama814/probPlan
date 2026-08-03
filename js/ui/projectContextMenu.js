// プロジェクトカードの右クリック／キーボードメニューを管理する。
import { showDeleteProjectModal } from "./projectDeleteModal.js";

const LONG_PRESS_DURATION = 550;
const LONG_PRESS_MOVE_TOLERANCE = 10;

let contextMenu = null;

function handlePointerDown(event) {
  if (contextMenu?.contains(event.target)) return;
  closeProjectContextMenu();
}

function handleKeydown(event) {
  if (event.key === "Escape") {
    closeProjectContextMenu();
  }
}

export function closeProjectContextMenu() {
  const menu = contextMenu;
  contextMenu = null;

  if (menu) {
    menu.classList.remove("is-open");
    window.setTimeout(() => {
      menu.remove();
    }, 160);
  }

  document.removeEventListener("pointerdown", handlePointerDown);
  document.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("resize", closeProjectContextMenu);
  window.removeEventListener("scroll", closeProjectContextMenu, true);
}

function openProjectContextMenu(
  x,
  y,
  project,
  onDeleteProject,
  onToggleArchive
) {
  // 既存メニューを閉じてから新しい位置に1つだけ表示する。
  closeProjectContextMenu();
  document.querySelectorAll(".project-context-menu").forEach(menu => {
    menu.remove();
  });

  contextMenu = document.createElement("div");
  contextMenu.className = `
    project-context-menu
    fixed z-[60] w-48 rounded-md
    border border-[var(--color-text)]/10
    bg-[var(--color-surface)] p-1 shadow-lg
  `;
  contextMenu.setAttribute("role", "menu");

  contextMenu.innerHTML = `
    <button
      id="context-toggle-archive"
      type="button"
      role="menuitem"
      class="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-[var(--color-text)]/5 focus:bg-[var(--color-text)]/5"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M3 7h18" />
        <path d="M5 7v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" />
        <path d="M9 11h6" />
        <path d="M10 3h4a2 2 0 0 1 2 2v2H8V5a2 2 0 0 1 2-2Z" />
      </svg>
      ${project.archived ? "アーカイブを解除" : "アーカイブする"}
    </button>
    <button
      id="context-delete-project"
      type="button"
      role="menuitem"
      class="mt-1 flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm text-[var(--color-danger)] outline-none transition-colors hover:bg-[var(--color-danger-soft)] focus:bg-[var(--color-danger-soft)]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M3 6h18"/>
        <path d="M8 6V4h8v2"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v5"/>
        <path d="M14 11v5"/>
      </svg>
      プロジェクトを削除
    </button>
  `;

  document.body.appendChild(contextMenu);

  const menuRect = contextMenu.getBoundingClientRect();
  const margin = 8;
  const left = Math.min(
    Math.max(x, margin),
    window.innerWidth - menuRect.width - margin
  );
  const top = Math.min(
    Math.max(y, margin),
    window.innerHeight - menuRect.height - margin
  );

  contextMenu.style.left = `${left}px`;
  contextMenu.style.top = `${top}px`;
  window.requestAnimationFrame(() => {
    if (contextMenu) contextMenu.classList.add("is-open");
  });

  contextMenu
    .querySelector("#context-delete-project")
    .addEventListener("click", () => {
      closeProjectContextMenu();
      showDeleteProjectModal(project, onDeleteProject);
    });

  contextMenu
    .querySelector("#context-toggle-archive")
    .addEventListener("click", () => {
      closeProjectContextMenu();
      onToggleArchive(project);
    });

  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", closeProjectContextMenu);
  window.addEventListener("scroll", closeProjectContextMenu, true);

  contextMenu.querySelector("button").focus();
}

export function bindProjectContextMenu(
  card,
  project,
  onDeleteProject,
  onToggleArchive = () => {}
) {
  let longPressTimer = null;
  let longPressStart = null;
  let suppressNextClick = false;

  const clearLongPress = () => {
    if (longPressTimer) {
      window.clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    longPressStart = null;
  };

  const openFromLongPress = event => {
    const cardRect = card.getBoundingClientRect();
    const x = event.clientX || cardRect.left + 16;
    const y = event.clientY || cardRect.top + 16;

    // 長押し後に発火するclickで詳細画面へ遷移しないよう、次のclickだけ止める。
    suppressNextClick = true;
    openProjectContextMenu(
      x,
      y,
      project,
      onDeleteProject,
      onToggleArchive
    );
  };

  card.addEventListener("click", event => {
    if (!suppressNextClick) return;

    suppressNextClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  card.addEventListener("contextmenu", event => {
    event.preventDefault();

    openProjectContextMenu(
      event.clientX,
      event.clientY,
      project,
      onDeleteProject,
      onToggleArchive
    );
  });

  card.addEventListener("pointerdown", event => {
    if (!["touch", "pen"].includes(event.pointerType)) return;
    if (event.button !== 0) return;

    // スマホでは右クリックできないため、一定時間押し続けた時だけ同じメニューを開く。
    clearLongPress();
    longPressStart = {
      x: event.clientX,
      y: event.clientY,
    };
    longPressTimer = window.setTimeout(() => {
      longPressTimer = null;
      openFromLongPress(event);
    }, LONG_PRESS_DURATION);
  });

  card.addEventListener("pointermove", event => {
    if (!longPressStart) return;

    const moved =
      Math.abs(event.clientX - longPressStart.x) >
        LONG_PRESS_MOVE_TOLERANCE ||
      Math.abs(event.clientY - longPressStart.y) >
        LONG_PRESS_MOVE_TOLERANCE;

    // スクロールやスワイプを長押しと誤判定しないよう、指が動いたらキャンセルする。
    if (moved) clearLongPress();
  });

  card.addEventListener("pointerup", clearLongPress);
  card.addEventListener("pointercancel", clearLongPress);
  card.addEventListener("pointerleave", clearLongPress);

  card.addEventListener("keydown", event => {
    const isKeyboardMenu =
      event.key === "ContextMenu" ||
      (event.shiftKey && event.key === "F10");

    if (!isKeyboardMenu) return;

    event.preventDefault();

    const cardRect = card.getBoundingClientRect();
    openProjectContextMenu(
      cardRect.left + 16,
      cardRect.top + 16,
      project,
      onDeleteProject,
      onToggleArchive
    );
  });
}
