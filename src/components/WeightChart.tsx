import type { WeightView } from "@/lib/types";

const W = 320;
const H = 180;
const PAD = { l: 8, r: 36, t: 10, b: 24 };

// Catmull-Rom → cubic Bézier through every point, so the trend reads as a curve, not a zigzag.
function smooth(pts: number[][]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function WeightChart({ chart }: { chart: NonNullable<WeightView["chart"]> }) {
  const x = (v: number) => PAD.l + v * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + v * (H - PAD.t - PAD.b);

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Weight over time">
      {chart.yLabels.map((l) => (
        <g key={l.label}>
          <line className="chart-grid" x1={PAD.l} x2={W - PAD.r} y1={y(l.y)} y2={y(l.y)} />
          <text className="chart-text" x={W - PAD.r + 6} y={y(l.y) + 4}>
            {l.label}
          </text>
        </g>
      ))}
      {chart.dots.map((p, i) => (
        <circle key={i} className="chart-dot" cx={x(p.x)} cy={y(p.y)} r={3} style={{ "--x": p.x } as React.CSSProperties} />
      ))}
      <path className="chart-avg" pathLength={1} d={smooth(chart.avg.map((p) => [x(p.x), y(p.y)]))} />
      <text className="chart-text" x={PAD.l} y={H - 6}>
        {chart.xLabels[0]}
      </text>
      <text className="chart-text" x={W - PAD.r} y={H - 6} textAnchor="end">
        {chart.xLabels[1]}
      </text>
    </svg>
  );
}
