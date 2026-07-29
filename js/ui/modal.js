let overlay = null;

export function openModal(content, options = {}) {
  closeModal();

  const {
    maxWidth = "max-w-md"
  } = options;

  overlay = document.createElement("div");

  overlay.className = `
    fixed inset-0
    bg-black/40
    flex items-center justify-center
    p-4
    z-50
  `;

  overlay.innerHTML = `
    <div class="w-full ${maxWidth} rounded-md bg-[var(--color-surface)] border border-[var(--color-text)]/10 p-6 shadow-xl">
      ${content}
    </div>
  `;

  document.body.appendChild(overlay);
}

export function closeModal() {
  if (!overlay) return;

  overlay.remove();
  overlay = null;
}
