// 外部テストライブラリを使わず、ブラウザだけで結果を収集する最小テスト基盤。
export function createTestSuite() {
  const tests = [];

  return {
    test(name, callback) {
      tests.push({ name, callback });
    },

    async run() {
      // 各テストを独立して実行し、後続テストも続けられるよう結果を記録する。
      const results = [];

      for (const { name, callback } of tests) {
        try {
          await callback();
          results.push({ name, passed: true });
        } catch (error) {
          results.push({
            name,
            passed: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return results;
    },
  };
}

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertEqual(actual, expected, message) {
  assert(
    actual === expected,
    `${message}\n期待値: ${expected}\n実際: ${actual}`
  );
}
