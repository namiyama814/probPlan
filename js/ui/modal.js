// 全モーダルで共有するオーバーレイ管理。閉じる時はCSSアニメーションも開始する。
let overlay = null;
let previousFocusedElement = null;

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"])",
].join(",");

function removeOverlay(target) {
  target.remove();
}

export function openModal(content, options = {}) {
  // 新しいモーダルを開く前に、前のモーダルを即時除去して二重表示を防ぐ。
  closeModal(true);

  const {
    maxWidth = "max-w-md",
    closeOnBackdrop = true,
    closeOnEscape = true,
  } = options;

  previousFocusedElement = document.activeElement;

  overlay = document.createElement("div");

  overlay.className = `
    modal-overlay
    fixed inset-0
    bg-black/40
    flex items-center justify-center
    p-4
    z-50
  `;

  overlay.innerHTML = `
    <div
      class="modal-content w-full ${maxWidth} rounded-md bg-[var(--color-surface)] border border-[var(--color-text)]/10 p-6 shadow-xl"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      ${content}
    </div>
  `;

  const modalContent = overlay.querySelector(".modal-content");

  overlay.addEventListener("keydown", event => {
    if (event.key === "Escape" && closeOnEscape) {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = [...modalContent.querySelectorAll(FOCUSABLE_SELECTOR)];
    if (focusable.length === 0) {
      event.preventDefault();
      modalContent.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  overlay.addEventListener("click", event => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      closeModal();
    }
  });

  document.body.appendChild(overlay);

  window.requestAnimationFrame(() => {
    const firstFocusable = modalContent.querySelector(FOCUSABLE_SELECTOR);
    (firstFocusable ?? modalContent).focus();
  });
}

export function closeModal(immediately = false) {
  if (!overlay) return;

  const closingOverlay = overlay;
  overlay = null;

  const restoreFocus = () => {
    if (previousFocusedElement?.isConnected) {
      previousFocusedElement.focus();
    }
    previousFocusedElement = null;
  };

  if (immediately) {
    // テストや再描画時はアニメーションを待たずに片付ける。
    removeOverlay(closingOverlay);
    restoreFocus();
    return;
  }

  closingOverlay.classList.add("is-closing");
  closingOverlay.setAttribute("aria-hidden", "true");

  const closeTimer = window.setTimeout(() => {
    removeOverlay(closingOverlay);
    restoreFocus();
  }, 250);

  const handleAnimationEnd = event => {
    if (event.target === closingOverlay) {
      window.clearTimeout(closeTimer);
      removeOverlay(closingOverlay);
      restoreFocus();
      closingOverlay.removeEventListener(
        "animationend",
        handleAnimationEnd
      );
    }
  };

  closingOverlay.addEventListener("animationend", handleAnimationEnd);
}
