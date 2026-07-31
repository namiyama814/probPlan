// 削除直後の短時間だけ、元の状態へ戻す操作を表示する通知。
let activeToast = null;
let hideTimer = null;
let removeTimer = null;

export function hideUndoToast(immediate = false) {
  if (hideTimer !== null) {
    window.clearTimeout(hideTimer);
    hideTimer = null;
  }

  if (removeTimer !== null) {
    window.clearTimeout(removeTimer);
    removeTimer = null;
  }

  if (!activeToast) return;

  if (immediate) {
    activeToast.remove();
    activeToast = null;
    return;
  }

  const toast = activeToast;
  toast.classList.add("is-closing");
  toast.setAttribute("aria-hidden", "true");
  removeTimer = window.setTimeout(() => {
    toast.remove();
    if (activeToast === toast) activeToast = null;
    removeTimer = null;
  }, 180);
}

function replaceUndoToast() {
  hideUndoToast(true);
  activeToast = null;
}

export function showUndoToast(message, onUndo, duration = 5000) {
  replaceUndoToast();

  const toast = document.createElement("div");
  // 横位置はアニメーションの transform で一元管理し、Tailwind の
  // translate ユーティリティと重なって二重にずれないようにする。
  toast.className = "undo-toast fixed bottom-5 left-1/2 z-[70] flex items-center gap-4 rounded-lg bg-[var(--color-text)] px-4 py-3 text-sm text-[var(--color-bg)] shadow-lg";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.innerHTML = `
    <span>${message}</span>
    <button
      type="button"
      class="font-semibold underline underline-offset-2"
      aria-label="${message}を元に戻す"
    >
      元に戻す
    </button>
  `;

  toast.querySelector("button").addEventListener("click", () => {
    onUndo();
    hideUndoToast();
  });

  document.body.appendChild(toast);
  activeToast = toast;
  hideTimer = window.setTimeout(hideUndoToast, duration);
}
