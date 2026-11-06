// Run: npm run check
import assert from "node:assert/strict";
import { addDays, isDate } from "./dates";
import { calendar, dayMeta, meter } from "./log";
import { parseEntry, parseGoal } from "./validate";

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

console.log("ok");
