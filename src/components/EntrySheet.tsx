"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { LIMITS } from "@/constants";
import type { Entry } from "@/lib/types";
import { Sheet } from "./Sheet";

type Props = { date: string; entry: Entry | null; onClose: () => void; onSaved: () => void };

export function EntrySheet({ date, entry, onClose, onSaved }: Props) {
  const [name, setName] = useState(entry?.name ?? "");
  const [protein, setProtein] = useState(entry ? String(entry.protein) : "");
  const [calories, setCalories] = useState(entry ? String(entry.calories) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await action();
      onSaved();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, protein, calories };
    run(() => (entry ? api(`/api/entries/${entry.id}`, "PATCH", data) : api("/api/entries", "POST", { ...data, date })));
  };

  return (
    <Sheet title={entry ? "Edit entry" : "Add entry"} onClose={onClose}>
      <form className="form" onSubmit={save}>
        <label className="field">
          <span>What did you eat?</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={LIMITS.name} placeholder="Greek yogurt" autoFocus={!entry} required />
        </label>
        <div className="split">
          <label className="field">
            <span>Calories</span>
            <input className="input" value={calories} onChange={(e) => setCalories(e.target.value)} inputMode="numeric" placeholder="0" required />
          </label>
          <label className="field">
            <span>Protein (g)</span>
            <input className="input" value={protein} onChange={(e) => setProtein(e.target.value)} inputMode="decimal" placeholder="0" required />
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>
          {entry ? "Save changes" : "Add to log"}
        </button>
        {entry && (
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => run(() => api(`/api/entries/${entry.id}`, "DELETE"))}>
            Delete entry
          </button>
        )}
      </form>
    </Sheet>
  );
}
