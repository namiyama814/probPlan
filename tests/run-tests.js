// ブラウザ上で外部ライブラリなしに全テストスイートを実行するランナー。
import { runControllerTests } from "./controllers.test.js";
import { runDataTransferServiceTests } from "./dataTransferService.test.js";
import { runModelTests } from "./models.test.js";
import { runSimulationTests } from "./simulation.test.js";
import { runUiTests } from "./ui.test.js";
import { runTutorialTests } from "./tutorial.test.js";
import { runValidationTests } from "./validation.test.js";

export async function runAllTests() {
  // 機能領域ごとの結果を結合し、1件でも失敗したら呼び出し元へ通知する。
  const results = [
    ...(await runDataTransferServiceTests()),
    ...(await runModelTests()),
    ...(await runSimulationTests()),
    ...(await runControllerTests()),
    ...(await runUiTests()),
    ...(await runValidationTests()),
    ...(await runTutorialTests()),
  ];
  const failedTests = results.filter(result => !result.passed);

  console.table(results);

  if (failedTests.length > 0) {
    throw new Error(`${failedTests.length}件のテストが失敗しました。`);
  }

  return results;
}

if (typeof window !== "undefined") {
  window.runProbPlanTests = runAllTests;
}
