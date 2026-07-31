let overlay = null;

function removeOverlay(target) {
  target.remove();
}

export function openModal(content, options = {}) {
  closeModal(true);

  const {
    maxWidth = "max-w-md",
    closeOnBackdrop = true,
  } = options;

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
    <div class="modal-content w-full ${maxWidth} rounded-md bg-[var(--color-surface)] border border-[var(--color-text)]/10 p-6 shadow-xl">
      ${content}
    </div>
  `;

  overlay.addEventListener("click", event => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      closeModal();
    }
  });

  document.body.appendChild(overlay);
}

export function closeModal(immediately = false) {
  if (!overlay) return;

  const closingOverlay = overlay;
  overlay = null;

  if (immediately) {
    removeOverlay(closingOverlay);
    return;
  }

  closingOverlay.classList.add("is-closing");
  closingOverlay.setAttribute("aria-hidden", "true");

  const closeTimer = window.setTimeout(() => {
    removeOverlay(closingOverlay);
  }, 250);

  const handleAnimationEnd = event => {
    if (event.target === closingOverlay) {
      window.clearTimeout(closeTimer);
      removeOverlay(closingOverlay);
      closingOverlay.removeEventListener(
        "animationend",
        handleAnimationEnd
      );
    }
  };

  closingOverlay.addEventListener("animationend", handleAnimationEnd);
}
