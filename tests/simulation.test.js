import { runTaskSimulation } from "../js/simulation/taskSimulation.js";
import { randomTriangular } from "../js/simulation/triangular.js";
import { assert, assertEqual, createTestSuite } from "./testUtils.js";

const suite = createTestSuite();
const { test } = suite;

test("三角分布の乱数は最小値から最大値の範囲に収まる", () => {
  const originalRandom = Math.random;

  try {
    Math.random = () => 0;
    assertEqual(randomTriangular(2, 4, 8), 2, "最小値を返せません。");

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

export function runSimulationTests() {
  return suite.run();
}
