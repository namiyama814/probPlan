let overlay = null;

export function openModal(content) {

    closeModal();

    overlay = document.createElement("div");

    overlay.className = `
        fixed inset-0
        bg-black/40
        flex items-center justify-center
        p-4
        z-50
    `;

    overlay.innerHTML = `
        <div
            class="w-full max-w-md rounded-md bg-white border border-[#252525]/10 p-6"
        >
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