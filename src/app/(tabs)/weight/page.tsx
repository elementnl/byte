"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { WEIGHT_RANGES, type WeightRange } from "@/constants";
import type { WeightView } from "@/lib/types";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { GlassSegmented } from "@/components/Glass";
import { NavBar } from "@/components/NavBar";
import { WeightChart } from "@/components/WeightChart";

const LABELS: Record<WeightRange, string> = { "7": "7D", "30": "30D", "90": "90D", all: "All" };

export default function WeightPage() {
  const [range, setRange] = useState<WeightRange>("30");
  const [view, setView] = useState<WeightView | null>(null);

  const load = useCallback(() => {
    api<WeightView>(`/api/weight?range=${range}`).then(setView, () => {});
  }, [range]);

  useEffect(load, [load]);

  return (
    <main className="screen">
      <NavBar title="Weight" />

      <div style={{ margin: "12px 0 20px" }}>
        <GlassSegmented options={WEIGHT_RANGES} labels={LABELS} value={range} onChange={setRange} />
      </div>

      {!view ? null : view.chart && view.headline ? (
        <div key={view.range} className="enter">
          <div className="headline">
            <strong>{view.headline.weight}</strong>
            <div>
              {view.headline.direction === "up" && <CaretUp size={14} weight="fill" aria-label="up" />}
              {view.headline.direction === "down" && <CaretDown size={14} weight="fill" aria-label="down" />}
              <b>{view.headline.change}</b> {view.headline.period}
            </div>
          </div>
          <div className="card">
            <WeightChart chart={view.chart} />
            <div className="legend">
              <span className="legend-dot" /> Weigh-in <span className="legend-line" /> 7-day avg
            </div>
          </div>
        </div>
      ) : (
        <div className="empty">
          <strong>No weigh-ins yet</strong>
          Log your weight to see your trend.
        </div>
      )}

    </main>
  );
}
