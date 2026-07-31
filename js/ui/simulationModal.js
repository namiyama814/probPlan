// タスクシミュレーションの結果、ヒストグラム、共有操作をまとめて表示する。
import { openModal, closeModal } from "./modal.js";
import { runTaskSimulation } from "../simulation/taskSimulation.js";
import { drawHistogram } from "../simulation/histogram.js";

async function copyToClipboard(text) {
  // 標準Clipboard APIが使えない環境では、従来のtextarea方式へフォールバックする。
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // フォールバックのコピー処理を試みる。
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.className = "fixed opacity-0";

  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("クリップボードへのコピーに失敗しました。");
  }
}

export function showSimulationModal(task) {

  const result = runTaskSimulation(task);
  // 共有文言は画面の確率表示と同じ結果から生成する。
  const shareText = `${task.name}は50%の確率で${Math.round(result.p50)}日、80%の確率で${Math.round(result.p80)}日、90%の確率で${Math.round(result.p90)}日で終了します`;

  openModal(`
    <div class="flex items-center justify-between">

      <h2 class="text-2xl font-bold">
        シミュレーション結果
      </h2>

      <div class="flex items-center gap-2">
        <button
          id="copy-simulation-result"
          type="button"
          class="flex h-8 items-center gap-1.5 rounded-full px-3 text-sm text-[var(--color-muted)] transition-colors hover:bg-[var(--color-text)]/10 hover:text-[var(--color-text)]"
          aria-label="シミュレーション結果をコピー"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 16V4M8 8l4-4 4 4M5 14v5h14v-5"
            />
          </svg>
          <span>共有</span>
        </button>

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

  const copyButton = document.getElementById("copy-simulation-result");
  const copyLabel = copyButton.querySelector("span");

  copyButton.addEventListener("click", async () => {
    try {
      await copyToClipboard(shareText);
      copyLabel.textContent = "コピーしました";
    } catch {
      copyLabel.textContent = "コピーに失敗しました";
    }

    window.setTimeout(() => {
      if (document.body.contains(copyButton)) {
        copyLabel.textContent = "共有";
      }
    }, 2000);
  });
}
