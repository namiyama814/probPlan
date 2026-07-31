// 削除直後の短時間だけ、元の状態へ戻す操作を表示する通知。
let activeToast = null;
let hideTimer = null;

export function hideUndoToast() {
  if (hideTimer !== null) {
    window.clearTimeout(hideTimer);
    hideTimer = null;
  }

  activeToast?.remove();
  activeToast = null;
}

export function showUndoToast(message, onUndo, duration = 5000) {
  hideUndoToast();

  const toast = document.createElement("div");
  toast.className = "fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-4 rounded-lg bg-[var(--color-text)] px-4 py-3 text-sm text-[var(--color-bg)] shadow-lg";
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
