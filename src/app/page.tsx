"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Day, Entry } from "@/lib/types";
import { CalendarSheet } from "@/components/CalendarSheet";
import { EntrySheet } from "@/components/EntrySheet";
import { ChevronLeft, ChevronRight, Gear, Plus } from "@/components/Icons";
import { Ring } from "@/components/Ring";
import { Splash, Wordmark } from "@/components/Splash";

export default function LogPage() {
  const [date, setDate] = useState<string | null>(null); // null = server's "today"
  const [day, setDay] = useState<Day | null>(null);
  const [editing, setEditing] = useState<Entry | "new" | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const load = useCallback(() => {
    api<Day>(`/api/day${date ? `?date=${date}` : ""}`).then(setDay, () => {});
  }, [date]);

  useEffect(load, [load]);

  const closeEntry = useCallback(() => setEditing(null), []);
  const closeCalendar = useCallback(() => setCalendarOpen(false), []);

  if (!day) return <Splash />;

  return (
    <main className="screen">
      <header className="topbar">
        <Wordmark />
        <Link href="/settings" className="icon-btn" aria-label="Settings">
          <Gear />
        </Link>
      </header>

      <nav className="datenav">
        <button className="icon-btn" onClick={() => setDate(day.prev)} aria-label="Previous day">
          <ChevronLeft />
        </button>
        <button className="datenav-label" onClick={() => setCalendarOpen(true)} aria-label="Pick a date">
          <strong>{day.label}</strong>
          <small>{day.sublabel}</small>
        </button>
        <button className="icon-btn" onClick={() => day.next && setDate(day.next)} disabled={!day.next} aria-label="Next day">
          <ChevronRight />
        </button>
      </nav>

      <section className="rings">
        {day.meters.map((m) => (
          <Ring key={m.key} meter={m} />
        ))}
      </section>

      <h2 className="section-label">Log</h2>
      {day.entries.length ? (
        <div className="list">
          {day.entries.map((e) => (
            <button key={e.id} className="row" onClick={() => setEditing(e)}>
              <div style={{ minWidth: 0 }}>
                <div className="row-name">{e.name}</div>
                <div className="row-sub">{e.protein}g protein</div>
              </div>
              <div className="row-cal">
                {e.calories}
                <small>kcal</small>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty">
          <strong>Nothing logged</strong>
          Tap Add to log your first bite.
        </div>
      )}

      <button className="fab" onClick={() => setEditing("new")}>
        <Plus /> Add
      </button>

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
