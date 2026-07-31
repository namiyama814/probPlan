import { runTaskSimulation } from "../js/simulation/taskSimulation.js";
import {
  getProjectCompletionForecast,
  getProjectDeadlineForecast,
} from "../js/simulation/projectSimulation.js";
import { randomTriangular } from "../js/simulation/triangular.js";
import { assert, assertEqual, createTestSuite } from "./testUtils.js";

const suite = createTestSuite();
const { test } = suite;

test("三角分布の乱数は最小値から最大値の範囲に収まる", () => {
  const originalRandom = Math.random;

  try {
    Math.random = () => 0;
    assertEqual(randomTriangular(2, 4, 8), 2, "最小値を返せません。");
    assertEqual(
      randomTriangular(0, 0, 0),
      0,
      "同じ見積もり値を返せません。"
    );

    Math.random = () => 0.999999;
    const value = randomTriangular(2, 4, 8);
    assert(value >= 2 && value <= 8, "最大値の範囲を超えています。");
  } finally {
    Math.random = originalRandom;
  }
});

test("タスクシミュレーションは指定回数の結果と確率別の日数を返す", () => {
  const originalRandom = Math.random;

  try {
    Math.random = () => 0.5;

    const result = runTaskSimulation(
      {
        optimistic: 2,
        mostLikely: 4,
        pessimistic: 8,
      },
      20
    );

    assertEqual(result.samples.length, 20, "試行回数が正しくありません。");
    assert(
      result.samples.every(value => value >= 2 && value <= 8),
      "シミュレーション結果が見積もりの範囲を超えています。"
    );
    assertEqual(result.p50, result.p80, "同じ乱数での50%と80%が一致しません。");
    assertEqual(result.p80, result.p90, "同じ乱数での80%と90%が一致しません。");
    assertEqual(result.average, result.p50, "平均値と確率別の日数が一致しません。");
  } finally {
    Math.random = originalRandom;
  }
});

test("プロジェクト全体の完了予測を未完了タスクから算出できる", () => {
  const forecast = getProjectCompletionForecast(
    {
      tasks: [
        { status: "todo", optimistic: 2, mostLikely: 2, pessimistic: 2 },
        { status: "todo", optimistic: 3, mostLikely: 3, pessimistic: 3 },
        { status: "completed", optimistic: 10, mostLikely: 10, pessimistic: 10 },
      ],
    },
    20
  );

  assertEqual(forecast.status, "available", "完了予測を算出できません。");
  assertEqual(forecast.samples.length, 20, "試行回数が正しくありません。");
  assertEqual(forecast.average, 5, "平均完了日数が正しくありません。");
  assertEqual(forecast.p50, 5, "50%完了予測が正しくありません。");
  assertEqual(forecast.p80, 5, "80%完了予測が正しくありません。");
  assertEqual(forecast.p90, 5, "90%完了予測が正しくありません。");
});

test("プロジェクト完了済みと見積未設定の状態を区別できる", () => {
  const completed = getProjectCompletionForecast(
    { tasks: [{ status: "completed", optimistic: 1, mostLikely: 1, pessimistic: 1 }] }
  );
  const missingEstimates = getProjectCompletionForecast(
    { tasks: [{ status: "todo", optimistic: null, mostLikely: null, pessimistic: null }] }
  );

  assertEqual(completed.status, "completed", "完了済みを判定できません。");
  assertEqual(
    missingEstimates.status,
    "missing-estimates",
    "見積未設定を判定できません。"
  );
});

test("締切内に完了できる確率を未完了タスクの合計日数から算出できる", () => {
  const originalRandom = Math.random;

  try {
    Math.random = () => 0.5;

    const forecast = getProjectDeadlineForecast(
      {
        deadline: "2026-08-06",
        tasks: [
          {
            status: "todo",
            optimistic: 2,
            mostLikely: 4,
            pessimistic: 8,
          },
          {
            status: "completed",
            optimistic: 10,
            mostLikely: 10,
            pessimistic: 10,
          },
        ],
      },
      new Date(2026, 6, 30),
      20
    );

    assertEqual(forecast.status, "available", "締切予測を算出できません。");
    assertEqual(forecast.daysRemaining, 8, "締切までの日数が正しくありません。");
    assertEqual(forecast.probability, 100, "期限達成率が正しくありません。");
  } finally {
    Math.random = originalRandom;
  }
});

test("見積未設定・期限切れの締切予測を区別できる", () => {
  const missingEstimates = getProjectDeadlineForecast(
    {
      deadline: "2026-08-06",
      tasks: [{ status: "todo", optimistic: null, mostLikely: null, pessimistic: null }],
    },
    new Date(2026, 6, 30)
  );
  const overdue = getProjectDeadlineForecast(
    {
      deadline: "2026-07-29",
      tasks: [{ status: "todo", optimistic: 1, mostLikely: 2, pessimistic: 3 }],
    },
    new Date(2026, 6, 30)
  );

  assertEqual(
    missingEstimates.status,
    "missing-estimates",
    "見積未設定を判定できません。"
  );
  assertEqual(overdue.status, "overdue", "期限切れを判定できません。");
  assertEqual(overdue.probability, 0, "期限切れの達成率が正しくありません。");
});

export function runSimulationTests() {
  return suite.run();
}
