// Run: npm run check
import assert from "node:assert/strict";
import { addDays, isDate } from "./dates";
import { calendar, dayMeta, meter } from "./log";
import { parseEntry, parseGoal, parseWeight } from "./validate";
import { dayWeight, movingAvg, weightView } from "./weight";

assert.equal(addDays("2026-03-01", -1), "2026-02-28");
assert.equal(addDays("2024-12-31", 1), "2025-01-01");
assert.ok(isDate("2024-02-29") && !isDate("2026-02-30") && !isDate("nope"));

const today = "2026-11-06";
assert.equal(dayMeta(today, today).label, "Today");
assert.equal(dayMeta(today, today).next, null);
assert.equal(dayMeta("2026-11-05", today).label, "Yesterday");
assert.equal(dayMeta("2026-11-05", today).next, today);

const cal = calendar("2026-11", today, new Set(["2026-11-02"]));
assert.equal(cal.next, null);
assert.equal(cal.weeks[0][0]?.date, "2026-11-01"); // Nov 1 2026 is a Sunday
const cells = cal.weeks.flat();
assert.ok(cells.find((c) => c?.date === "2026-11-02")?.logged);
assert.ok(cells.find((c) => c?.date === "2026-11-07")?.disabled);
assert.equal(calendar("2026-10", today, new Set()).next, "2026-11");

assert.deepEqual([meter("protein", 160, 150).caption, meter("protein", 160, 150).pct], ["10g over", 1]);
assert.equal(meter("calories", 500, null).caption, "No goal set");

assert.deepEqual(parseEntry({ name: " Eggs ", protein: "12.34", calories: "140" }), { name: "Eggs", protein: 12.3, calories: 140 });
assert.equal(typeof parseEntry({ name: "", protein: 1, calories: 1 }), "string");
assert.equal(typeof parseEntry({ name: "x", protein: "", calories: 1 }), "string");
assert.equal(parseGoal("", 100), null);
assert.equal(parseGoal("-5", 100), undefined);

const w = [
  { date: "2026-10-30", weight: 190 }, // outside the 7-day window for 11-06
  { date: "2026-11-01", weight: 186 },
  { date: "2026-11-04", weight: 184 },
  { date: "2026-11-06", weight: 182 },
];
assert.equal(movingAvg(w, "2026-11-06"), 184);
const dw = dayWeight(w, "2026-11-06");
assert.deepEqual([dw.value, dw.display, dw.avg], [182, "182.0", "184.0"]);
assert.equal(dw.direction, "down"); // avg 184 now vs 190 a week ago
assert.equal(dayWeight([w[3]], "2026-11-06").direction, null);
assert.equal(dayWeight(w, "2026-11-05").value, null);
const wv = weightView(w, "7", today);
assert.equal(wv.chart?.dots.length, 3); // 10-31..11-06
assert.equal(wv.todayWeight, 182);
assert.deepEqual(wv.headline, { weight: "182.0 lbs", change: "4.0 lbs", direction: "down", period: "Past week" }); // avg 188 → 184
assert.equal(wv.chart?.avg.at(-1)?.x, 1);
assert.equal(weightView([], "30", today).chart, null);
assert.equal(parseWeight("182.46"), 182.5);
assert.equal(parseWeight(true), null);

console.log("ok");
