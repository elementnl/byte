"use client";

import { useLayoutEffect, useRef } from "react";

// Slides a glass pill onto the row's [aria-current="page"] item whenever `active` changes.
export function useGlassPill(active: unknown) {
  const row = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const place = () => {
      const target = row.current?.querySelector<HTMLElement>('[aria-current="page"]');
      const el = pill.current;
      if (!target || !el) return;
      Object.assign(el.style, {
        left: `${target.offsetLeft}px`,
        top: `${target.offsetTop}px`,
        width: `${target.offsetWidth}px`,
        height: `${target.offsetHeight}px`,
        opacity: "1",
      });
      requestAnimationFrame(() => (el.dataset.ready = "")); // no slide on first paint
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  return { row, pill };
}

type Props<T extends string> = { options: readonly T[]; labels: Record<T, string>; value: T; onChange: (v: T) => void };

// Text-only segmented control in the same liquid glass as the tab bar.
export function GlassSegmented<T extends string>({ options, labels, value, onChange }: Props<T>) {
  const { row, pill } = useGlassPill(value);
  return (
    <div className="glass-seg glass">
      <div ref={row} className="glass-tabbar-row">
        <span ref={pill} className="glass-tabbar-pill" aria-hidden />
        {options.map((o) => (
          <button key={o} className="glass-seg-item" aria-current={o === value ? "page" : undefined} onClick={() => onChange(o)}>
            {labels[o]}
          </button>
        ))}
      </div>
    </div>
  );
}
