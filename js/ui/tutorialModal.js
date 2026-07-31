// 初回アクセス時だけ表示する3ステップのチュートリアル。
import { closeModal, openModal } from "./modal.js";

const TUTORIAL_STORAGE_KEY = "probplan-tutorial-completed";

const steps = [
  {
    title: "ProbPlanへようこそ",
    description:
      "不確実なタスクを、最短・最頻・最長の3点見積もりから予測するタスク管理ツールです。",
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 3v18h18"/>
        <path d="M7 16v-4"/>
        <path d="M12 16V8"/>
        <path d="M17 16V5"/>
      </svg>
    `,
  },
  {
    title: "タスクを3点で見積もる",
    description:
      "各タスクに最短・最頻・最長の日数を入力すると、作業のばらつきを含めた予測を確認できます。",
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 19V5"/>
        <path d="M4 19h16"/>
        <path d="m7 15 4-4 3 2 4-6"/>
      </svg>
    `,
  },
  {
    title: "完了の見通しを立てる",
    description:
      "プロジェクト詳細の「詳細設定」では、完了予測と締切達成率を確認できます。検索は⌘ KまたはCtrl + Kで開けます。",
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 2"/>
      </svg>
    `,
  },
];

export function shouldShowTutorial() {
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY) !== "true";
  } catch {
    return true;
  }
}

function completeTutorial() {
  // 完了・スキップのどちらでも、次回から自動表示しない。
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
  } catch {
    // 保存できない環境でも、現在のセッションではチュートリアルを閉じる。
  }

  closeModal();
}

export function showTutorial() {
  let stepIndex = 0;

  openModal(
    '<div id="tutorial-content"></div>',
    {
      maxWidth: "max-w-lg",
      closeOnBackdrop: false,
    }
  );

  const content = document.getElementById("tutorial-content");

  function renderStep() {
    // ステップを描き直すたびにボタンの役割と表示を更新する。
    const step = steps[stepIndex];
    const isLastStep = stepIndex === steps.length - 1;

    content.innerHTML = `
      <div class="flex items-center justify-between gap-4">
        <span class="text-xs text-[var(--color-text)]/60">
          ${stepIndex + 1} / ${steps.length}
        </span>
        <button
          id="skip-tutorial"
          type="button"
          class="text-sm text-[var(--color-text)]/60 transition-colors hover:text-[var(--color-text)]"
        >
          スキップ
        </button>
      </div>

      <div class="mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-text)]/10">
        ${step.icon}
      </div>

      <h2 class="mt-6 text-2xl font-bold">${step.title}</h2>
      <p class="mt-3 text-sm leading-6 text-[var(--color-text)]/70">
        ${step.description}
      </p>

      <div class="mt-8 flex items-center justify-between gap-3">
        <button
          id="previous-tutorial-step"
          type="button"
          class="rounded-md px-3 py-2 text-sm text-[var(--color-text)]/60 transition-colors hover:bg-[var(--color-text)]/5 hover:text-[var(--color-text)] ${
            stepIndex === 0 ? "invisible" : ""
          }"
        >
          戻る
        </button>

        <button
          id="next-tutorial-step"
          type="button"
          class="rounded-md bg-[var(--color-text)] px-4 py-2 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-85"
        >
          ${isLastStep ? "はじめる" : "次へ"}
        </button>
      </div>
    `;

    content
      .querySelector("#skip-tutorial")
      .addEventListener("click", completeTutorial);
    content
      .querySelector("#previous-tutorial-step")
      .addEventListener("click", () => {
        if (stepIndex === 0) return;

        stepIndex--;
        renderStep();
      });
    content
      .querySelector("#next-tutorial-step")
      .addEventListener("click", () => {
        if (isLastStep) {
          completeTutorial();
          return;
        }

        stepIndex++;
        renderStep();
      });
  }

  renderStep();
}
