import { runControllerTests } from "./controllers.test.js";
import { runDataTransferServiceTests } from "./dataTransferService.test.js";
import { runModelTests } from "./models.test.js";
import { runSimulationTests } from "./simulation.test.js";
import { runUiTests } from "./ui.test.js";

export async function runAllTests() {
  const results = [
    ...(await runDataTransferServiceTests()),
    ...(await runModelTests()),
    ...(await runSimulationTests()),
    ...(await runControllerTests()),
    ...(await runUiTests()),
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
