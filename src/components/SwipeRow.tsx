"use client";

import { useRef, useState } from "react";
import { Trash } from "@phosphor-icons/react";

const OPEN = 72; // px revealed when snapped open
const SLOP = 8; // px of movement before we decide it's a swipe

type Props = {
  open: boolean;
  onOpen: (open: boolean) => void;
  onTap: () => void;
  onDelete: () => Promise<unknown>; // the API call
  onDeleted: () => void; // refresh, called once the row has animated away
  style?: React.CSSProperties;
  children: React.ReactNode;
};

// Swipe left to reveal a Delete button (iOS style); tap it to delete. A plain tap still calls onTap.
export function SwipeRow({ open, onOpen, onTap, onDelete, onDeleted, style, children }: Props) {
  const [drag, setDrag] = useState<number | null>(null); // live offset while dragging / sliding out
  const [removing, setRemoving] = useState(false);
  const gesture = useRef<{ x: number; y: number; base: number; swiping: boolean } | null>(null);
  const swiped = useRef(false); // swallow the click that follows a swipe

  const x = drag ?? (open ? -OPEN : 0); // negative = slid left

  async function remove(width: number) {
    setDrag(-width);
    setRemoving(true);
    try {
      await Promise.all([onDelete(), new Promise((r) => setTimeout(r, 450))]); // let the collapse finish
      onDeleted();
    } catch {
      setRemoving(false); // put it back if the delete failed
      setDrag(null);
      onOpen(false);
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    gesture.current = { x: e.clientX, y: e.clientY, base: open ? -OPEN : 0, swiping: false };
  }

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.swiping) {
      if (Math.abs(dy) > SLOP && Math.abs(dy) > Math.abs(dx)) gesture.current = null; // vertical scroll wins
      if (Math.abs(dx) <= SLOP || Math.abs(dx) < Math.abs(dy)) return;
      g.swiping = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setDrag(Math.min(Math.max(g.base + dx, -OPEN), 0)); // stops at the button; no swipe-to-delete
  }

  function onPointerUp() {
    const g = gesture.current;
    gesture.current = null;
    if (!g?.swiping || drag === null) return;
    swiped.current = true;
    onOpen(-drag > OPEN / 2);
    setDrag(null);
  }

  return (
    <div className={`swipe${removing ? " removing" : ""}`} style={style}>
      <button
        className="swipe-delete"
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
        aria-label="Delete"
        onClick={(e) => remove(e.currentTarget.parentElement!.offsetWidth)}
      >
        <Trash size={22} />
      </button>
      <button
        className="row"
        data-dragging={drag !== null && !removing ? "" : undefined}
        style={{ transform: `translateX(${x}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => {
          if (swiped.current) return void (swiped.current = false);
          if (open) onOpen(false);
          else onTap();
        }}
      >
        {children}
      </button>
    </div>
  );
}
