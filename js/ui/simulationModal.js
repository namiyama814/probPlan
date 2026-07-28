import { openModal, closeModal } from "./modal.js";
import { runSimulation } from "../simulation/monteCarlo.js";

export function showSimulationModal(project) {

    const result = runSimulation(project);

    openModal(`
      <div class="relative">
        <h2 class="text-xl font-bold">
          シミュレーション結果
        </h2>

        <button
          id="close-simulation-modal"
          type="button"
          class="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
          aria-label="閉じる"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
          </svg>
        </button>
      </div>

      <div class="mt-6 space-y-3">
        <div class="rounded-lg border p-4">
          <p class="text-sm text-gray-500">平均</p>
          <p class="text-2xl font-bold">
            ${result.average.toFixed(1)} 日
          </p>
        </div>

        <div class="rounded-lg border p-4">
          <p class="text-sm text-gray-500">50%で完了</p>
          <p class="text-2xl font-bold">
            ${Math.round(result.p50)} 日
          </p>
        </div>

        <div class="rounded-lg border p-4">
          <p class="text-sm text-gray-500">80%で完了</p>
          <p class="text-2xl font-bold">
            ${Math.round(result.p80)} 日
          </p>
        </div>

        <div class="rounded-lg border p-4">
          <p class="text-sm text-gray-500">90%で完了</p>
          <p class="text-2xl font-bold">
            ${Math.round(result.p90)} 日
          </p>
        </div>
      </div>
    `);

    document
      .getElementById("close-simulation-modal")
      .addEventListener("click", closeModal);
}