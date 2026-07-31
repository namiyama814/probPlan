// 最短・最頻・最長の3点から、三角分布に従う乱数を生成する。
export function randomTriangular(min, mode, max) {
  if (min === max) return min;

  const u = Math.random();
  const c = (mode - min) / (max - min);

  // modeを境に、左側と右側の累積確率を逆変換する。
  if (u < c) {
    return min + Math.sqrt(
      u * (max - min) * (mode - min)
    );
  }

  return max - Math.sqrt(
    (1 - u) * (max - min) * (max - mode)
  );
}
