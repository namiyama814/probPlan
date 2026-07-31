// 初回チュートリアルの表示、進行、スキップ、再表示抑制を確認するテスト。
import { closeModal } from "../js/ui/modal.js";
import {
  shouldShowTutorial,
  showTutorial,
} from "../js/ui/tutorialModal.js";
import { assert, assertEqual, createTestSuite } from "./testUtils.js";

const suite = createTestSuite();
const { test } = suite;
const STORAGE_KEY = "probplan-tutorial-completed";

function wait(milliseconds) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}

test("初回チュートリアルは3ステップで表示され、完了後は再表示しない", async () => {
  const savedValue = localStorage.getItem(STORAGE_KEY);

  try {
    localStorage.removeItem(STORAGE_KEY);
    assert(shouldShowTutorial(), "初回チュートリアルを表示すべきです。");

    showTutorial();
    assertEqual(
      document.querySelector("#tutorial-content h2").textContent,
      "ProbPlanへようこそ",
      "最初のステップを表示できません。"
    );

    document.getElementById("next-tutorial-step").click();
    assertEqual(
      document.querySelector("#tutorial-content h2").textContent,
      "タスクを3点で見積もる",
      "次のステップへ進めません。"
    );

    document.getElementById("next-tutorial-step").click();
    assertEqual(
      document.getElementById("next-tutorial-step").textContent.trim(),
      "はじめる",
      "最終ステップの操作が正しくありません。"
    );

    document.getElementById("next-tutorial-step").click();
    await wait(300);

    assertEqual(
      localStorage.getItem(STORAGE_KEY),
      "true",
      "チュートリアル完了を保存できません。"
    );
    assert(!shouldShowTutorial(), "完了後に再表示されます。");
  } finally {
    closeModal(true);

    if (savedValue === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, savedValue);
    }
  }
});

test("チュートリアルは背景クリックで閉じず、スキップで完了する", async () => {
  const savedValue = localStorage.getItem(STORAGE_KEY);

  try {
    localStorage.removeItem(STORAGE_KEY);
    showTutorial();

    const overlay = document.querySelector(".modal-overlay");
    overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    assert(Boolean(document.querySelector("#tutorial-content")), "背景クリックで閉じてしまいました。");

    document.getElementById("skip-tutorial").click();
    await wait(300);
    assertEqual(localStorage.getItem(STORAGE_KEY), "true", "スキップを保存できません。");
  } finally {
    closeModal(true);

    if (savedValue === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, savedValue);
    }
  }
});

export function runTutorialTests() {
  return suite.run();
}
