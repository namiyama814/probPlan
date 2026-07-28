export function randomTriangular(min, mode, max) {
  const u = Math.random();
  const c = (mode - min) / (max - min);

  if (u < c) {
    return min + Math.sqrt(
      u * (max - min) * (mode - min)
    );
  }

  return max - Math.sqrt(
    (1 - u) * (max - min) * (max - mode)
  );
}