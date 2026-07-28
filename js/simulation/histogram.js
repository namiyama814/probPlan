export function drawHistogram(canvas, samples) {
  const ctx = canvas.getContext("2d");

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  ctx.clearRect(0, 0, width, height);

  const bins = window.innerWidth < 640 ? 12 : 20;

  const min = Math.min(...samples);
  const max = Math.max(...samples);

  const binWidth = (max - min) / bins;
  const counts = new Array(bins).fill(0);

  for (const value of samples) {
    let index = Math.floor((value - min) / binWidth);
    if (index >= bins) { index = bins - 1; };

    counts[index]++;
  }

  const margin = 40;
  const graphWidth = width - margin * 2;
  const graphHeight = height - margin * 2;

  ctx.beginPath();
  ctx.moveTo(margin, margin);

  ctx.lineTo(margin, height - margin);
  ctx.lineTo(width - margin, height - margin);
  ctx.stroke();

  const maxCount = Math.max(...counts);
  const barWidth = graphWidth / bins;

  counts.forEach((count, index) => {
    const barHeight =
      (count / maxCount) * graphHeight;
  
    ctx.fillRect(
      margin + index * barWidth,
      height - margin - barHeight,
      barWidth - 2,
      barHeight
    );
  });

  ctx.textAlign = "center";
  
  ctx.font = "12px sans-serif";
  
  for (let i = 0; i <= 4; i++) {
    const value =
      min + (max - min) * i / 4;

    const x =
      margin + graphWidth * i / 4;

    ctx.fillText(
      value.toFixed(1),
      x,
      height - 15
    );
  }
}