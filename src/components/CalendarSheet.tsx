"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Calendar } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "./Icons";
import { Sheet } from "./Sheet";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

type Props = { selected: string; onPick: (date: string) => void; onClose: () => void };

export function CalendarSheet({ selected, onPick, onClose }: Props) {
  const [month, setMonth] = useState(selected.slice(0, 7));
  const [cal, setCal] = useState<Calendar | null>(null);

  useEffect(() => {
    api<Calendar>(`/api/calendar?month=${month}`).then(setCal, () => {});
  }, [month]);

  return (
    <Sheet title="Jump to date" onClose={onClose}>
      <div className="cal-head">
        <button className="icon-btn" onClick={() => cal && setMonth(cal.prev)} aria-label="Previous month">
          <ChevronLeft />
        </button>
        <strong>{cal?.label ?? " "}</strong>
        <button className="icon-btn" onClick={() => cal?.next && setMonth(cal.next)} disabled={!cal?.next} aria-label="Next month">
          <ChevronRight />
        </button>
      </div>
      <div className="cal-grid">
        {DOW.map((d, i) => (
          <div key={i} className="cal-dow">{d}</div>
        ))}
        {cal?.weeks.flat().map((c, i) =>
          c ? (
            <button
              key={c.date}
              className={["cal-day", c.logged && "logged", c.today && "today", c.date === selected && "selected"].filter(Boolean).join(" ")}
              disabled={c.disabled}
              onClick={() => onPick(c.date)}
              aria-label={`${c.date}${c.logged ? ", has entries" : ""}`}
            >
              {c.day}
            </button>
          ) : (
            <div key={i} />
          ),
        )}
      </div>
    </Sheet>
  );
}
