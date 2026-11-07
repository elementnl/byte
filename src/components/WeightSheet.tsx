"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { WEIGHT_UNIT } from "@/constants";
import { Sheet } from "./Sheet";

// date omitted = today (server decides).
type Props = {
  date?: string;
  value: number | null;
  onClose: () => void;
  onSaved: () => void;
};

export function WeightSheet({ date, value, onClose, onSaved }: Props) {
  const [weight, setWeight] = useState(value?.toString() ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // On success, slide the sheet away, then let the parent refresh.
  async function run(
    action: () => Promise<unknown>,
    close: (after?: () => void) => void,
  ) {
    setBusy(true);
    setError("");
    try {
      await action();
      close(onSaved);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Sheet
      title={value === null ? "Weigh in" : "Edit weigh-in"}
      onClose={onClose}
    >
      {(close) => (
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => api("/api/weight", "PUT", { date, weight }), close);
          }}
        >
          <label className="field">
            <span>Weight ({WEIGHT_UNIT})</span>
            <input
              className="input input-big"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              inputMode="decimal"
              placeholder="0.0"
              autoFocus
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn" disabled={busy}>
            Save
          </button>
          {value !== null && (
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy}
              onClick={() =>
                run(
                  () => api(`/api/weight?date=${date ?? ""}`, "DELETE"),
                  close,
                )
              }
            >
              Delete weigh-in
            </button>
          )}
        </form>
      )}
    </Sheet>
  );
}
