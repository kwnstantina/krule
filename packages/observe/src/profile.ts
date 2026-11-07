import { workingDaysBetween, type EventLog } from "./log";

/**
 * A deterministic, aggregate-only description of an event log: what the model
 * reads instead of the raw rows.
 *
 * Two reasons not to send the rows. Size: real logs run to millions of events.
 * Confidentiality: the profile carries counts, ranges and category labels, never
 * a full case, so customer records never leave the machine. The model uses the
 * profile to decide which hypotheses are worth checking; the checking itself
 * happens locally against the full log.
 *
 * The associations and timing sections are the profile's real job. They point
 * at regularities nobody wrote down ("activity X happens in 100% of cases where
 * broker = Y, against 5% overall"), which is where shadow rules hide.
 */

const MAX_CATEGORIES = 12;
const MIN_SUPPORT = 10;

const isNum = (v: string) => v.trim() !== "" && Number.isFinite(Number(v));
const pct = (x: number) => `${(x * 100).toFixed(0)}%`;

function quantile(sorted: number[], q: number): number {
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] ?? 0;
}

function describeValues(values: string[]): string {
  if (values.length > 0 && values.every(isNum)) {
    const s = values.map(Number).sort((a, b) => a - b);
    return `numeric, min ${s[0]}, p25 ${quantile(s, 0.25)}, median ${quantile(s, 0.5)}, p75 ${quantile(s, 0.75)}, max ${s[s.length - 1]}`;
  }
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  const shown = top.slice(0, MAX_CATEGORIES).map(([v, n]) => `${v} (${n})`).join(", ");
  return `${counts.size} distinct: ${shown}${top.length > MAX_CATEGORIES ? ", …" : ""}`;
}

export function profileLog(log: EventLog): string {
  const out: string[] = [];
  const nCases = log.cases.length;
  const times = log.events.map((e) => e.time);
  const day = (ms: number) => new Date(ms).toISOString().slice(0, 10);

  out.push("# Event log profile", "");
  out.push(`${nCases} cases, ${log.events.length} events, ${day(Math.min(...times))} to ${day(Math.max(...times))}.`);
  out.push(`Columns: ${log.columns.join(", ")}. Timestamps are UTC.`, "");

  // Activities.
  const casesWith = new Map<string, Set<string>>();
  for (const e of log.events) {
    const s = casesWith.get(e.activity) ?? new Set<string>();
    s.add(e.caseId);
    casesWith.set(e.activity, s);
  }
  out.push("## Activities", "", "| activity | events | cases containing it |", "|---|---|---|");
  for (const a of log.activities) {
    const events = log.events.filter((e) => e.activity === a).length;
    const cases = casesWith.get(a)!.size;
    out.push(`| ${a} | ${events} | ${cases} (${pct(cases / nCases)}) |`);
  }

  // Case attributes.
  const caseKeys = [...new Set(log.cases.flatMap((c) => Object.keys(c.attrs)))].sort();
  out.push("", "## Case attributes (from each case's first event)", "");
  for (const k of caseKeys) {
    const values = log.cases.map((c) => c.attrs[k]).filter((v): v is string => v !== undefined);
    out.push(`- \`${k}\` — present in ${values.length}/${nCases}; ${describeValues(values)}`);
  }

  // Event attributes per activity.
  out.push("", "## Event attributes by activity", "");
  for (const a of log.activities) {
    const events = log.events.filter((e) => e.activity === a);
    const keys = [...new Set(events.flatMap((e) => Object.keys(e.attrs)))].sort();
    out.push(`### ${a}`);
    for (const k of keys) {
      const values = events.map((e) => e.attrs[k]).filter((v): v is string => v !== undefined);
      out.push(`- \`${k}\` — ${describeValues(values)}`);
    }
    out.push("");
  }

  // Variants: order of first occurrence of each activity.
  const variants = new Map<string, number>();
  for (const c of log.cases) {
    const seq = [...new Set(c.events.map((e) => e.activity))].join(" → ");
    variants.set(seq, (variants.get(seq) ?? 0) + 1);
  }
  out.push("## Most common variants (first occurrence of each activity)", "");
  for (const [seq, n] of [...variants.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    out.push(`- ${n} cases: ${seq}`);
  }

  // Associations between case attributes and activities.
  out.push("", "## Strong associations (activity rate within a slice vs overall)", "");
  const lines: Array<[number, string]> = [];
  for (const a of log.activities) {
    const overall = casesWith.get(a)!.size / nCases;
    if (overall === 0 || overall === 1) continue;
    for (const k of caseKeys) {
      const values = log.cases.map((c) => c.attrs[k]);
      const defined = values.filter((v): v is string => v !== undefined);
      if (defined.length === 0) continue;
      if (defined.every(isNum)) {
        // Quintile bands of a numeric attribute.
        const sorted = defined.map(Number).sort((x, y) => x - y);
        const edges = [0.2, 0.4, 0.6, 0.8].map((q) => quantile(sorted, q));
        const bands = [-Infinity, ...edges, Infinity];
        const rates: string[] = [];
        let lo = 1;
        let hi = 0;
        for (let b = 0; b < 5; b += 1) {
          const inBand = log.cases.filter((c) => {
            const v = Number(c.attrs[k]);
            return c.attrs[k] !== undefined && v > bands[b]! && v <= bands[b + 1]!;
          });
          if (inBand.length < MIN_SUPPORT) continue;
          const r = inBand.filter((c) => casesWith.get(a)!.has(c.id)).length / inBand.length;
          lo = Math.min(lo, r);
          hi = Math.max(hi, r);
          const label = b === 4 ? `>${bands[b]}` : `≤${bands[b + 1]}`;
          rates.push(`${label}: ${pct(r)}`);
        }
        if (hi - lo >= 0.5) lines.push([hi - lo, `- \`${a}\` by \`${k}\` band — ${rates.join(", ")} (overall ${pct(overall)})`]);
        continue;
      }
      const distinct = [...new Set(defined)];
      if (distinct.length > 40) continue;
      for (const v of distinct) {
        const slice = log.cases.filter((c) => c.attrs[k] === v);
        if (slice.length < MIN_SUPPORT) continue;
        const r = slice.filter((c) => casesWith.get(a)!.has(c.id)).length / slice.length;
        const lift = Math.abs(r - overall);
        if (lift >= 0.3 || ((r === 0 || r === 1) && lift >= 0.15)) {
          lines.push([lift, `- \`${a}\` where \`${k}\` = ${v}: ${pct(r)} of ${slice.length} cases (overall ${pct(overall)})`]);
        }
      }
    }
  }
  lines.sort((x, y) => y[0] - x[0] || (x[1] < y[1] ? -1 : 1));
  out.push(...(lines.length === 0 ? ["- none above threshold"] : lines.slice(0, 25).map(([, l]) => l)));

  // Timing: working days from case start to each activity, by start month.
  out.push("", "## Timing anomalies (median working days from case start, by start month)", "");
  const timing: string[] = [];
  for (const a of log.activities) {
    const byMonth = new Map<number, number[]>();
    const all: number[] = [];
    for (const c of log.cases) {
      const e = c.events.find((x) => x.activity === a);
      if (e === undefined || e === c.events[0]) continue;
      const d = workingDaysBetween(c.events[0]!.time, e.time);
      const m = new Date(c.events[0]!.time).getUTCMonth() + 1;
      all.push(d);
      byMonth.set(m, [...(byMonth.get(m) ?? []), d]);
    }
    if (all.length < MIN_SUPPORT) continue;
    const med = quantile([...all].sort((x, y) => x - y), 0.5);
    for (const [m, ds] of [...byMonth.entries()].sort((x, y) => x[0] - y[0])) {
      if (ds.length < MIN_SUPPORT) continue;
      const mm = quantile([...ds].sort((x, y) => x - y), 0.5);
      if (mm >= 2 * med + 3) timing.push(`- \`${a}\`: cases starting in month ${m} take a median ${mm} working days (overall median ${med}, n=${ds.length})`);
    }
  }
  out.push(...(timing.length === 0 ? ["- none"] : timing));

  return out.join("\n") + "\n";
}
