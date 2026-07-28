import { randomTriangular } from "./triangular.js";

function percentile(sorted, p) {
  const index = Math.floor((sorted.length - 1) * p);
  return sorted[index];
}

export function runSimulation(project, iterations = 10000) {
  const samples = [];

  for (let i = 0; i < iterations; i++) {
    let total = 0;

    for (const task of project.tasks) {
      total += randomTriangular(
        task.optimistic,
        task.mostLikely,
        task.pessimistic
      );
    }

    samples.push(total);
  }

  const sorted = [...samples].sort((a, b) => a - b);

  const average =
    samples.reduce((sum, value) => sum + value, 0) / samples.length;

  const p50 = percentile(sorted, 0.5);
  const p80 = percentile(sorted, 0.8);
  const p90 = percentile(sorted, 0.9);

  return {
    samples,
    average,
    p50,
    p80,
    p90,
  };
}