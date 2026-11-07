"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartLineUp, ForkKnife, GearSix } from "@phosphor-icons/react";
import { useGlassPill } from "./Glass";

const TABS = [
  { href: "/", label: "Log", Icon: ForkKnife },
  { href: "/weight", label: "Weight", Icon: ChartLineUp },
  { href: "/settings", label: "Settings", Icon: GearSix },
];

// Floating iOS 26 style tab bar with a sliding liquid-glass selection.
export function TabBar() {
  const path = usePathname();
  const { row, pill } = useGlassPill(path);

  return (
    <nav className="glass-tabbar glass">
      <div ref={row} className="glass-tabbar-row">
        <span ref={pill} className="glass-tabbar-pill" aria-hidden />
        {TABS.map(({ href, label, Icon }) => {
          const active = path === href;
          return (
            <Link key={href} href={href} className="glass-tab" aria-current={active ? "page" : undefined}>
              <Icon />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
