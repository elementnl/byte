"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Day, Entry } from "@/lib/types";
import { CalendarSheet } from "@/components/CalendarSheet";
import { EntrySheet } from "@/components/EntrySheet";
import { CaretDown, CaretLeft, CaretRight, CaretUp, Gauge, Plus } from "@phosphor-icons/react";
import { Ring } from "@/components/Ring";
import { NavBar } from "@/components/NavBar";
import { Splash } from "@/components/Splash";
import { SwipeRow } from "@/components/SwipeRow";
import { WeightSheet } from "@/components/WeightSheet";
import { WEIGHT_UNIT } from "@/constants";

let booted = false; // splash only on the first load, not on every tab switch

export default function LogPage() {
  const [date, setDate] = useState<string | null>(null); // null = server's "today"
  const [day, setDay] = useState<Day | null>(null);
  const [editing, setEditing] = useState<Entry | "new" | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [weightOpen, setWeightOpen] = useState(false);
  const [openRow, setOpenRow] = useState<string | null>(null); // entry swiped open to show Delete

  const load = useCallback(() => {
    api<Day>(`/api/day${date ? `?date=${date}` : ""}`).then(setDay, () => {});
  }, [date]);

  useEffect(load, [load]);

  const closeEntry = useCallback(() => setEditing(null), []);
  const closeCalendar = useCallback(() => setCalendarOpen(false), []);
  const closeWeight = useCallback(() => setWeightOpen(false), []);

  useEffect(() => {
    if (day) booted = true;
  }, [day]);

  if (!day) return booted ? null : <Splash />;

  return (
    <main className="screen">
      <NavBar
        title={day.label}
        subtitle={day.sublabel}
        onTitle={() => setCalendarOpen(true)}
        left={
          <button className="icon-btn" onClick={() => setDate(day.prev)} aria-label="Previous day">
            <CaretLeft size={22} />
          </button>
        }
        right={
          <button className="icon-btn" onClick={() => day.next && setDate(day.next)} disabled={!day.next} aria-label="Next day">
            <CaretRight size={22} />
          </button>
        }
      />

      <div key={day.date} className="enter">
        {day.weight.display ? (
          <button className="weigh" onClick={() => setWeightOpen(true)}>
            <Gauge size={22} />
            <strong>
              {day.weight.display}
              <span> {WEIGHT_UNIT}</span>
            </strong>
            {day.weight.avg && (
              <small className="weigh-trend">
                7-Day Avg: <b>{day.weight.avg}</b> {WEIGHT_UNIT}
                {day.weight.direction === "up" && <CaretUp size={12} weight="fill" aria-label="up from last week" />}
                {day.weight.direction === "down" && <CaretDown size={12} weight="fill" aria-label="down from last week" />}
              </small>
            )}
          </button>
        ) : (
          <button className="weigh" onClick={() => setWeightOpen(true)}>
            <Gauge size={22} />
            <strong className="weigh-empty">Log weight</strong>
          </button>
        )}

        <section className="rings">
          {day.meters.map((m) => (
            <Ring key={m.key} meter={m} />
          ))}
        </section>

        <div className="section-head">
          <h2 className="section-label">Log</h2>
          <button className="add-btn" onClick={() => setEditing("new")}>
            <Plus size={16} weight="bold" /> Add
          </button>
        </div>
        {day.entries.length ? (
          <div className="list">
            {day.entries.map((e, i) => (
              <SwipeRow
                key={e.id}
                style={{ "--i": i } as React.CSSProperties}
                open={openRow === e.id}
                onOpen={(o) => setOpenRow(o ? e.id : null)}
                onTap={() => setEditing(e)}
                onDelete={() => api(`/api/entries/${e.id}`, "DELETE")}
                onDeleted={load}
              >
                <div className="row-name">{e.name}</div>
                <div className="row-val">
                  <span>
                    <b>{e.calories}</b> kcal
                  </span>
                  <span className="row-dot" aria-hidden />
                  <span aria-label={`${e.protein} grams protein`}>
                    <b>{e.protein}</b>g
                  </span>
                </div>
              </SwipeRow>
            ))}
          </div>
        ) : (
          <div className="empty">
            <strong>Nothing logged</strong>
            Tap Add to log your first bite.
          </div>
        )}
      </div>

      {editing && (
        <EntrySheet
          date={day.date}
          entry={editing === "new" ? null : editing}
          onClose={closeEntry}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
      {weightOpen && (
        <WeightSheet
          date={day.date}
          value={day.weight.value}
          onClose={closeWeight}
          onSaved={() => {
            setWeightOpen(false);
            load();
          }}
        />
      )}
      {calendarOpen && (
        <CalendarSheet
          selected={day.date}
          onClose={closeCalendar}
          onPick={(d) => {
            setCalendarOpen(false);
            setDate(d);
          }}
        />
      )}
    </main>
  );
}
