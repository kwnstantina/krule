import { workingDaysBetween, type EventLog, type LogCase, type LogEvent } from "./log";
import { renderQuery, type Hypothesis, type Predicate } from "./hypothesis";

export type ObservationStatus =
  /** policy rule, no violations */
  | "holds"
  /** policy rule, at least one violation */
  | "breached"
  /** pattern holds for ≥ PATTERN_THRESHOLD of a population of ≥ MIN_PATTERN_SUPPORT */
  | "confirmed"
  /** pattern below threshold */
  | "not-supported"
  /** nothing in the log matches the population, or a policy names an activity the log never records */
  | "no-evidence"
  /** the query names fields or activities the log does not have */
  | "invalid";

export const PATTERN_THRESHOLD = 0.95;
export const MIN_PATTERN_SUPPORT = 5;
const SAMPLE_SIZE = 5;

export interface Observation {
  hypothesis: Hypothesis;
  query: string;
  status: ObservationStatus;
  population: number;
  conforming: number;
  violating: number;
  /** conforming / population; 0 when the population is empty. */
  conformance: number;
  /** Total of `sumField` over violations, or null when no sumField was given. */
  violatingSum: number | null;
  /** Case ids (unit=case) or `case#eventIndex` (unit=event) of the first violations. */
  samples: string[];
  problems: string[];
}

type Value = string | undefined;

const pad = (n: number) => String(n).padStart(2, "0");
const date = (ms: number) => new Date(ms).toISOString().slice(0, 10);

function first(c: LogCase, activity: string): LogEvent | undefined {
  return c.events.find((e) => e.activity === activity);
}

function caseField(c: LogCase, field: string): Value {
  const [kind, arg] = splitKind(field);
  switch (kind) {
    case "count":
      return String(c.events.filter((e) => e.activity === arg).length);
    case "month": {
      const e = first(c, arg);
      return e === undefined ? undefined : String(new Date(e.time).getUTCMonth() + 1);
    }
    case "wdays": {
      const [from, to] = arg.split("..");
      const a = first(c, from ?? "");
      const b = first(c, to ?? "");
      return a === undefined || b === undefined ? undefined : String(workingDaysBetween(a.time, b.time));
    }
    default:
      return c.attrs[field];
  }
}

function eventField(c: LogCase, e: LogEvent, field: string): Value {
  if (field.startsWith("case.")) return caseField(c, field.slice(5));
  const d = new Date(e.time);
  switch (field) {
    case "$date":
      return date(e.time);
    case "$month":
      return String(d.getUTCMonth() + 1);
    case "$weekday":
      return String(((d.getUTCDay() + 6) % 7) + 1);
    case "$time":
      return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
    default:
      return e.attrs[field];
  }
}

function splitKind(field: string): [string, string] {
  const at = field.indexOf(":");
  return at < 0 ? ["", field] : [field.slice(0, at), field.slice(at + 1)];
}

const isNumber = (v: string) => v.trim() !== "" && Number.isFinite(Number(v));

export function compare(actual: Value, op: Predicate["op"], expected: string): boolean {
  if (op === "in" || op === "not_in") {
    const hit = actual !== undefined && expected.split(",").map((s) => s.trim()).includes(actual);
    return op === "in" ? hit : !hit;
  }
  if (actual === undefined || actual === "") return op === "neq" && expected !== "";
  const numeric = isNumber(actual) && isNumber(expected);
  const a = numeric ? Number(actual) : actual;
  const b = numeric ? Number(expected) : expected;
  switch (op) {
    case "eq":
      return a === b;
    case "neq":
      return a !== b;
    case "gt":
      return a > b;
    case "gte":
      return a >= b;
    case "lt":
      return a < b;
    case "lte":
      return a <= b;
  }
}

/** Every reference a hypothesis makes that the log cannot resolve. */
export function validate(log: EventLog, h: Hypothesis): string[] {
  const problems: string[] = [];
  const activities = new Set(log.activities);
  const eventAttrs = new Set(log.events.flatMap((e) => Object.keys(e.attrs)));
  const caseAttrs = new Set(log.cases.flatMap((c) => Object.keys(c.attrs)));
  const needActivity = (a: string) => {
    if (!activities.has(a)) problems.push(`unknown activity "${a}"`);
  };

  const checkCaseField = (field: string) => {
    const [kind, arg] = splitKind(field);
    if (kind === "count" || kind === "month") needActivity(arg);
    else if (kind === "wdays") {
      const parts = arg.split("..");
      if (parts.length !== 2) problems.push(`wdays needs <from>..<to>, got "${arg}"`);
      parts.forEach(needActivity);
    } else if (kind !== "") problems.push(`unknown field kind "${kind}:"`);
    else if (!caseAttrs.has(field)) problems.push(`unknown case attribute "${field}"`);
  };
  const checkField = (field: string) => {
    if (h.unit === "case") return checkCaseField(field);
    if (field.startsWith("case.")) return checkCaseField(field.slice(5));
    if (["$date", "$month", "$weekday", "$time"].includes(field)) return;
    if (!eventAttrs.has(field)) problems.push(`unknown event attribute "${field}"`);
  };

  if (h.unit === "event") {
    if (h.eventActivity === null) problems.push("unit=event needs eventActivity");
    else needActivity(h.eventActivity);
  }
  for (const p of [...h.population, ...h.expectation]) {
    checkField(p.field);
    if (p.value.startsWith("@")) checkField(p.value.slice(1));
  }
  if (h.sumField !== null) checkField(h.sumField);
  return [...new Set(problems)];
}

export function evaluateHypothesis(log: EventLog, h: Hypothesis): Observation {
  const base = {
    hypothesis: h,
    query: renderQuery(h),
    population: 0,
    conforming: 0,
    violating: 0,
    conformance: 0,
    violatingSum: null as number | null,
    samples: [] as string[],
  };
  const problems = validate(log, h);
  // A policy clause about an activity the log never records ("complaints") is
  // not a broken query; it is a rule this log cannot observe. Saying so is the
  // honest result. Unknown attributes, by contrast, are mistakes in the query.
  const onlyMissingActivities = problems.every((p) => p.startsWith("unknown activity"));
  if (problems.length > 0 && h.source === "policy" && onlyMissingActivities) {
    return { ...base, status: "no-evidence", problems };
  }
  if (problems.length > 0) return { ...base, status: "invalid", problems };

  type Unit = { id: string; get: (field: string) => Value };
  const units: Unit[] =
    h.unit === "case"
      ? log.cases.map((c) => ({ id: c.id, get: (f) => caseField(c, f) }))
      : log.cases.flatMap((c) =>
          c.events
            .filter((e) => e.activity === h.eventActivity)
            .map((e) => ({ id: `${c.id}#${e.index}`, get: (f: string) => eventField(c, e, f) })),
        );

  const holds = (u: Unit, p: Predicate) =>
    compare(u.get(p.field), p.op, p.value.startsWith("@") ? (u.get(p.value.slice(1)) ?? "") : p.value);

  const population = units.filter((u) => h.population.every((p) => holds(u, p)));
  const violations = population.filter((u) => !h.expectation.every((p) => holds(u, p)));

  let violatingSum: number | null = null;
  if (h.sumField !== null) {
    violatingSum = 0;
    for (const u of violations) {
      const v = Number(u.get(h.sumField));
      if (Number.isFinite(v)) violatingSum += v;
    }
    violatingSum = Math.round(violatingSum * 100) / 100;
  }

  const conforming = population.length - violations.length;
  const conformance = population.length === 0 ? 0 : conforming / population.length;
  let status: ObservationStatus;
  if (population.length === 0) status = "no-evidence";
  else if (h.source === "policy") status = violations.length === 0 ? "holds" : "breached";
  else
    status =
      population.length >= MIN_PATTERN_SUPPORT && conformance >= PATTERN_THRESHOLD
        ? "confirmed"
        : "not-supported";

  return {
    ...base,
    status,
    population: population.length,
    conforming,
    violating: violations.length,
    conformance,
    violatingSum,
    samples: violations.slice(0, SAMPLE_SIZE).map((u) => u.id),
    problems: [],
  };
}
