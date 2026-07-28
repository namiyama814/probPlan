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
        class="rounded-lg px-3 py-2 hover:bg-[var(--color-text)]/10"
      >
        ✕
      </button>

    </div>

    <div class="mt-6">
      <canvas
        id="histogram"
        class="block w-full"
      ></canvas>
    </div>

    <div class="mt-8 grid grid-cols-2 gap-4">

      <div class="rounded-lg border p-4">
        <p class="text-sm text-gray-500">平均</p>
        <p class="text-2xl font-bold">
          ${result.average.toFixed(1)}日
        </p>
      </div>

      <div class="rounded-lg border p-4">
        <p class="text-sm text-gray-500">50%</p>
        <p class="text-2xl font-bold">
          ${Math.round(result.p50)}日
        </p>
      </div>

      <div class="rounded-lg border p-4">
        <p class="text-sm text-gray-500">80%</p>
        <p class="text-2xl font-bold">
          ${Math.round(result.p80)}日
        </p>
      </div>

      <div class="rounded-lg border p-4">
        <p class="text-sm text-gray-500">90%</p>
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