// 1タスクの3点見積もりから、完了日数の確率分布を作る。
import { randomTriangular } from "./triangular.js";

function percentile(sorted, p) {
  const index = Math.floor((sorted.length - 1) * p);
  return sorted[index];
}

export function runTaskSimulation(task, iterations = 10000) {
  const samples = [];

  for (let i = 0; i < iterations; i++) {
    // 三角分布から1回分の完了日数を抽出する。
    samples.push(
      randomTriangular(
        task.optimistic,
        task.mostLikely,
        task.pessimistic
      )
    );
  }

  const sorted = [...samples].sort((a, b) => a - b);

  const average =
    samples.reduce((sum, value) => sum + value, 0) /
    samples.length;

  return {
    samples,
    average,
    p50: percentile(sorted, 0.5),
    p80: percentile(sorted, 0.8),
    p90: percentile(sorted, 0.9),
  };
}
