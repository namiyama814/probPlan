import { openModal, closeModal } from "./modal.js";
import { runTaskSimulation } from "../simulation/taskSimulation.js";
import { drawHistogram } from "../simulation/histogram.js";

export function showSimulationModal(task) {

  const result = runTaskSimulation(task);

  openModal(`
    <div class="flex items-center justify-between">

      <h2 class="text-2xl font-bold">
        シミュレーション結果
      </h2>

      <button
        id="close-modal"
        type="button"
        class="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-[var(--color-text)]/10 hover:text-[var(--color-text)]"
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

    <div class="mt-6">
      <canvas
        id="histogram"
        class="block w-full"
      ></canvas>
    </div>

    <div class="mt-8 grid grid-cols-2 gap-4">

      <div class="rounded-lg border border-[var(--color-text)]/10 p-4">
        <p class="text-sm text-[var(--color-muted)]">平均</p>
        <p class="text-2xl font-bold">
          ${result.average.toFixed(1)}日
        </p>
      </div>

      <div class="rounded-lg border border-[var(--color-text)]/10 p-4">
        <p class="text-sm text-[var(--color-muted)]">50%</p>
        <p class="text-2xl font-bold">
          ${Math.round(result.p50)}日
        </p>
      </div>

      <div class="rounded-lg border border-[var(--color-text)]/10 p-4">
        <p class="text-sm text-[var(--color-muted)]">80%</p>
        <p class="text-2xl font-bold">
          ${Math.round(result.p80)}日
        </p>
      </div>

      <div class="rounded-lg border border-[var(--color-text)]/10 p-4">
        <p class="text-sm text-[var(--color-muted)]">90%</p>
        <p class="text-2xl font-bold">
          ${Math.round(result.p90)}日
        </p>
      </div>

    </div>
  `, {
    maxWidth: "max-w-4xl"
  });

  requestAnimationFrame(() => {
    const canvas = document.getElementById("histogram");
  
    const width = canvas.clientWidth;
    const height = Math.min(width * 0.45, 250);
  
    const dpr = window.devicePixelRatio || 1;
    canvas.style.height = `${height}px`;
  
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
  
    drawHistogram(canvas, result.samples);
  });

  document
    .getElementById("close-modal")
    .addEventListener("click", closeModal);
}
