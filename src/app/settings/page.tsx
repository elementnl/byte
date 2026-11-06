"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Theme } from "@/constants";
import type { Settings } from "@/lib/types";
import { ChevronLeft } from "@/components/Icons";
import { Splash } from "@/components/Splash";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    api<Settings>("/api/settings").then((s) => {
      setSettings(s);
      setCalories(s.calorieGoal?.toString() ?? "");
      setProtein(s.proteinGoal?.toString() ?? "");
    }, () => {});
  }, []);

  async function saveGoals(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saving…");
    try {
      setSettings(await api<Settings>("/api/settings", "PUT", { calorieGoal: calories, proteinGoal: protein }));
      setStatus("Saved");
    } catch (err) {
      setStatus((err as Error).message);
    }
  }

  async function setTheme(theme: Theme) {
    document.documentElement.setAttribute("data-theme", theme);
    setSettings((s) => s && { ...s, theme });
    await api("/api/settings", "PUT", { theme }).catch(() => {});
  }

  async function signOut() {
    await api("/api/auth/logout", "POST").catch(() => {});
    window.location.replace("/login");
  }

  if (!settings) return <Splash />;

  return (
    <main className="screen">
      <header className="topbar">
        <Link href="/" className="icon-btn" aria-label="Back">
          <ChevronLeft />
        </Link>
      </header>
      <h1 className="title" style={{ margin: "8px 0 20px" }}>Settings</h1>

      <form className="card" onSubmit={saveGoals}>
        <h3>Daily goals</h3>
        <p>Leave blank to hide a goal.</p>
        <div className="form">
          <div className="split">
            <label className="field">
              <span>Calories</span>
              <input className="input" inputMode="numeric" placeholder="2000" value={calories} onChange={(e) => setCalories(e.target.value)} />
            </label>
            <label className="field">
              <span>Protein (g)</span>
              <input className="input" inputMode="numeric" placeholder="150" value={protein} onChange={(e) => setProtein(e.target.value)} />
            </label>
          </div>
          <button className="btn">Save goals</button>
          {status && <p className="saved" role="status">{status}</p>}
        </div>
      </form>

      <section className="card">
        <h3>Appearance</h3>
        <p>Saved to your account.</p>
        <div className="segmented">
          {(["light", "dark"] as const).map((t) => (
            <button key={t} aria-pressed={settings.theme === t} onClick={() => setTheme(t)}>
              {t === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </section>

      <button className="btn btn-ghost" style={{ width: "100%" }} onClick={signOut}>
        Sign out
      </button>
    </main>
  );
}
