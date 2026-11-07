import type { Meter } from "@/lib/types";

const R = 56;
const C = 2 * Math.PI * R;

export function Ring({ meter }: { meter: Meter }) {
  const color = meter.key === "calories" ? "var(--cal)" : "var(--pro)";
  return (
    <div className="ring-card">
      <div className="ring" role="img" aria-label={`${meter.label}: ${meter.value} ${meter.unit}, ${meter.caption}`}>
        <svg width="124" height="124" viewBox="0 0 124 124">
          <circle className="track" cx="62" cy="62" r={R} />
          <circle
            className="bar"
            cx="62"
            cy="62"
            r={R}
            stroke={color}
            strokeDasharray={C}
            strokeDashoffset={C * (1 - meter.pct)}
            style={{ "--c": C } as React.CSSProperties}
          />
        </svg>
        <div className="ring-value">
          <strong>{meter.value}</strong>
          <small>{meter.unit}</small>
        </div>
      </div>
      <div className="ring-label">{meter.label}</div>
      <div className={`ring-caption${meter.over ? " over" : ""}`}>{meter.caption}</div>
    </div>
  );
}
