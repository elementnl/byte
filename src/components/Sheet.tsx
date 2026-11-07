"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";

const EXIT_MS = 220; // keep in sync with .sheet.leaving in globals.css

// `close(after)` plays the exit animation, then calls `after` (default: onClose).
type Close = (after?: () => void) => void;
type Props = { title: string; onClose: () => void; children: React.ReactNode | ((close: Close) => React.ReactNode) };

export function Sheet({ title, onClose, children }: Props) {
  const [leaving, setLeaving] = useState<null | (() => void)>(null); // callback to run once the exit finishes
  const close = useCallback<Close>((after = onClose) => setLeaving(() => after), [onClose]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(leaving, EXIT_MS);
    return () => clearTimeout(t);
  }, [leaving]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [close]);

  return (
    <>
      <div className={`backdrop${leaving ? " leaving" : ""}`} onClick={() => close()} />
      <div className={`sheet${leaving ? " leaving" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-grip" />
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={() => close()} aria-label="Close">
            <X size={22} />
          </button>
        </div>
        {typeof children === "function" ? children(close) : children}
      </div>
    </>
  );
}
