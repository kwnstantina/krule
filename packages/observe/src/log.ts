/**
 * A process-mining style event log: one row per event, grouped into cases.
 *
 * Deliberately generic: nothing here knows about claims. A log needs a case
 * column, an activity column and a timestamp column; every other column becomes
 * an attribute of the event. Columns holding `key=value;key=value` pairs are
 * expanded into separate attributes, since that is how many exports flatten
 * per-event detail.
 */

export interface LogEvent {
  /** 0-based position in the file, after sorting by time. */
  index: number;
  caseId: string;
  activity: string;
  /** Milliseconds since epoch, read as UTC. */
  time: number;
  attrs: Record<string, string>;
}

export interface LogCase {
  id: string;
  /** In time order. */
  events: LogEvent[];
  /**
   * Case-level attributes: those of the case's first event. In most exports the
   * opening event ("claim received", "order created") carries the case's data.
   */
  attrs: Record<string, string>;
}

export interface EventLog {
  columns: string[];
  events: LogEvent[];
  cases: LogCase[];
  activities: string[];
}

export interface LogOptions {
  caseColumn?: string;
  activityColumn?: string;
  timestampColumn?: string;
  /** Columns to expand from `k=v;k=v` form. Default: any column named `attrs`. */
  keyValueColumns?: string[];
}

export function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      out.push(field);
      field = "";
    } else field += ch;
  }
  out.push(field);
  return out;
}

/** Timestamps without a zone are read as UTC, so results never depend on the machine. */
export function parseTimestamp(value: string): number {
  const iso = /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : value + "Z";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) throw new Error("unparseable timestamp: " + value);
  return ms;
}

export function parseEventLog(csv: string, options: LogOptions = {}): EventLog {
  const lines = csv.replace(/\r\n/g, "\n").trimEnd().split("\n");
  const columns = splitCsvLine(lines[0] ?? "");
  const col = (name: string) => {
    const at = columns.indexOf(name);
    if (at < 0) throw new Error(`event log has no "${name}" column (has: ${columns.join(", ")})`);
    return at;
  };
  const caseAt = col(options.caseColumn ?? "case_id");
  const activityAt = col(options.activityColumn ?? "activity");
  const timeAt = col(options.timestampColumn ?? "timestamp");
  const kvColumns = new Set(options.keyValueColumns ?? columns.filter((c) => c === "attrs"));

  const events: LogEvent[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cells = splitCsvLine(lines[i]!);
    const attrs: Record<string, string> = {};
    columns.forEach((name, at) => {
      if (at === caseAt || at === activityAt || at === timeAt) return;
      const value = cells[at] ?? "";
      if (kvColumns.has(name)) {
        for (const pair of value.split(";")) {
          const eq = pair.indexOf("=");
          if (eq > 0) attrs[pair.slice(0, eq)] = pair.slice(eq + 1);
        }
      } else if (value !== "") {
        attrs[name] = value;
      }
    });
    events.push({
      index: 0,
      caseId: cells[caseAt] ?? "",
      activity: cells[activityAt] ?? "",
      time: parseTimestamp(cells[timeAt] ?? ""),
      attrs,
    });
  }

  // Stable sort: rows with equal timestamps keep file order.
  events.sort((a, b) => a.time - b.time);
  events.forEach((e, i) => (e.index = i));

  const byCase = new Map<string, LogEvent[]>();
  for (const e of events) {
    const list = byCase.get(e.caseId) ?? [];
    list.push(e);
    byCase.set(e.caseId, list);
  }
  const cases = [...byCase.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([id, list]) => ({ id, events: list, attrs: { ...list[0]!.attrs } }));

  return {
    columns,
    events,
    cases,
    activities: [...new Set(events.map((e) => e.activity))].sort(),
  };
}

const DAY = 86_400_000;

function isWeekend(dayStart: number): boolean {
  const d = new Date(dayStart).getUTCDay();
  return d === 0 || d === 6;
}

/** Working days (Mon–Fri) from `from`'s date to `to`'s date; 0 on the same day, negative if `to` is earlier. */
export function workingDaysBetween(from: number, to: number): number {
  const a = Math.floor(from / DAY) * DAY;
  const b = Math.floor(to / DAY) * DAY;
  if (b < a) return -workingDaysBetween(to, from);
  let count = 0;
  for (let t = a + DAY; t <= b; t += DAY) if (!isWeekend(t)) count += 1;
  return count;
}
