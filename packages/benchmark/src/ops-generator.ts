/**
 * Generates the event log for the `legacy-claims-ops` fixture: what *actually*
 * happened to two years of claims, as a process-mining style CSV (one row per
 * event, `case_id` = claim reference).
 *
 * The log behaves the way the `legacy-claims` code would make it behave, plus the
 * things people do around the code — overrides, manual controls, unwritten
 * habits. Each of those is planted on purpose and listed in the fixture's
 * PLANTED.md; `ops-fixture.test.ts` recomputes every figure from the CSV so the
 * answer sheet cannot drift from the data.
 *
 * Deterministic: a seeded PRNG and no wall-clock reads, so regenerating produces
 * a byte-identical file.
 */

export const OPS_SEED = 20240101;
export const OPS_CLAIM_COUNT = 400;

/** Claims picked by index to be force-authorised by the overnight batch user. */
export const OVERRIDE_TARGET = 9;
/** Claims over £50,000 that skip the Claims Manager's second signature. */
export const SECOND_SIGNATURE_MISSES = 3;

const WATCHLIST_IN_CODE = ["BR0042", "BR0117", "BR0301"];

interface Handler {
  id: number;
  seniority: number;
  market: "UK" | "CA";
}

// Same people as fixtures/legacy-claims/db/seed.sql.
const HANDLERS: Handler[] = [
  { id: 1, seniority: 5, market: "UK" },
  { id: 2, seniority: 4, market: "UK" },
  { id: 3, seniority: 2, market: "UK" },
  { id: 4, seniority: 3, market: "CA" },
  { id: 5, seniority: 1, market: "CA" },
];

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY = 86_400_000;
const pad = (n: number) => String(n).padStart(2, "0");

export function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00`;
}

export function formatDate(ms: number): string {
  return formatTimestamp(ms).slice(0, 10);
}

function isWeekend(ms: number): boolean {
  const day = new Date(ms).getUTCDay();
  return day === 0 || day === 6;
}

/** Midnight of the `n`th working day after `ms`'s date. */
export function addWorkingDays(ms: number, n: number): number {
  let t = Math.floor(ms / DAY) * DAY;
  let left = n;
  while (left > 0) {
    t += DAY;
    if (!isWeekend(t)) left -= 1;
  }
  return t;
}

/** Working days from `from`'s date to `to`'s date (0 when the same day). */
export function workingDaysBetween(from: number, to: number): number {
  let t = Math.floor(from / DAY) * DAY;
  const end = Math.floor(to / DAY) * DAY;
  let count = 0;
  while (t < end) {
    t += DAY;
    if (!isWeekend(t)) count += 1;
  }
  return count;
}

export interface OpsEvent {
  case_id: string;
  activity: string;
  timestamp: string;
  actor: string;
  actor_seniority: string;
  market: string;
  brand: string;
  broker_code: string;
  amount: string;
  currency: string;
  attrs: string;
}

export const OPS_COLUMNS = [
  "event_id",
  "case_id",
  "activity",
  "timestamp",
  "actor",
  "actor_seniority",
  "market",
  "brand",
  "broker_code",
  "amount",
  "currency",
  "attrs",
] as const;

export function generateOpsEvents(): string {
  const rand = mulberry32(OPS_SEED);
  const pick = <T>(items: readonly T[]): T =>
    items[Math.floor(rand() * items.length)]!;
  const between = (lo: number, hi: number) => lo + rand() * (hi - lo);

  const start = Date.UTC(2024, 0, 2);
  const span = Date.UTC(2025, 11, 31) - start;

  const events: Array<OpsEvent & { ms: number; seq: number }> = [];
  let seq = 0;
  let disbursementId = 5000;
  let overridesLeft = OVERRIDE_TARGET;
  let secondSignatureMissesLeft = SECOND_SIGNATURE_MISSES;

  for (let i = 0; i < OPS_CLAIM_COUNT; i += 1) {
    const market: "UK" | "CA" = rand() < 0.8 ? "UK" : "CA";
    const brand =
      rand() < 0.5 ? "DAS" : market === "UK" ? "BROKERPLUS" : "MAPLELEGAL";
    const broker = pick([
      "BR0500", "BR0500", "BR0611", "BR0611", "BR0710", "BR0800", "BR0801",
      "BR0042", "BR0117", "BR0301", "BR0388",
    ]);
    const currency = market === "UK" ? "GBP" : "CAD";
    // Log-uniform £300 – £150,000 so every threshold has cases either side.
    const amount = Math.round(Math.exp(between(Math.log(300), Math.log(150_000))));
    const panel = brand === "DAS" || rand() < 0.85;
    const product = amount > 20_000 && rand() < 0.6 ? "ATE" : "BTE";
    const marketHandlers = HANDLERS.filter((h) => h.market === market);
    const holder = pick(marketHandlers);
    const caseId = `LEI-${market}-${String(300_000 + i).padStart(6, "0")}`;
    const lapseGap = rand() < 0.14 ? 1 + Math.floor(rand() * 80) : null;

    let t = start + Math.floor(rand() * (span / DAY)) * DAY;
    while (isWeekend(t)) t += DAY;
    t += Math.floor(between(8, 17)) * 3_600_000 + Math.floor(rand() * 60) * 60_000;
    const received = t;

    const base = { market, brand, broker_code: broker, currency };
    const push = (
      ms: number,
      activity: string,
      actor: string,
      seniority: number | null,
      amt: number | null,
      attrs: Record<string, string | number | boolean>,
    ) => {
      events.push({
        ...base,
        case_id: caseId,
        activity,
        timestamp: formatTimestamp(ms),
        actor,
        actor_seniority: seniority === null ? "" : String(seniority),
        amount: amt === null ? "" : amt.toFixed(2),
        attrs: Object.entries(attrs)
          .map(([k, v]) => `${k}=${String(v)}`)
          .join(";"),
        ms,
        seq: seq++,
      });
    };
    const handlerActor = (h: Handler) => `H${h.id}`;

    push(received, "claim_received", "intake", null, amount, {
      product,
      panel,
      handler: handlerActor(holder),
      ...(lapseGap === null ? {} : { lapse_gap_days: lapseGap }),
    });

    // Policy 5.1 says 2 working days. Reality: a long tail.
    const contactDelay =
      rand() < 0.57 ? Math.floor(rand() * 3) : 3 + Math.floor(rand() * 6);
    // Never before the claim arrived: a same-day contact comes at least 30 minutes after.
    push(
      Math.max(
        received + 30 * 60_000,
        addWorkingDays(received, contactDelay) + Math.floor(between(9, 17)) * 3_600_000,
      ),
      "contact_attempt_logged",
      handlerActor(holder),
      holder.seniority,
      null,
      {},
    );

    // Code rule R-004: lapse window is 45 days (policy says 30).
    if (lapseGap !== null && lapseGap > 45) {
      push(addWorkingDays(received, 1) + 10 * 3_600_000, "claim_rejected", "system", null, amount, {
        reason: "policy_lapsed",
      });
      continue;
    }
    // Code rule R-011: non-DAS over £2,500 off panel is rejected.
    if (brand !== "DAS" && amount > 2_500 && !panel) {
      push(addWorkingDays(received, 1) + 10 * 3_600_000, "claim_rejected", "system", null, amount, {
        reason: "panel_solicitor_required",
      });
      continue;
    }

    let cursor = addWorkingDays(received, 1) + 9 * 3_600_000;

    // Unwritten: everything from BR0042 is quietly moved to the most senior handler.
    let current = holder;
    if (broker === "BR0042" && market === "UK") {
      current = HANDLERS[0]!;
      push(cursor, "reassigned", "H1", 5, null, { from: handlerActor(holder), to: "H1" });
      cursor += 2 * 3_600_000;
    }

    const autoLimit = market === "UK" ? 1_000 : 750;
    const needsSignOff =
      amount > 10_000 ||
      WATCHLIST_IN_CODE.includes(broker) ||
      (market === "CA" && current.seniority < 3);

    // Unwritten: December claims wait for the new year (budget freeze).
    const receivedMonth = new Date(received).getUTCMonth();
    let authoriseAt =
      addWorkingDays(cursor, 1 + Math.floor(rand() * 6)) + Math.floor(between(9, 17)) * 3_600_000;
    if (receivedMonth === 11) {
      const jan = Date.UTC(new Date(received).getUTCFullYear() + 1, 0, 2);
      authoriseAt = addWorkingDays(jan - DAY, 1 + Math.floor(rand() * 4)) + 11 * 3_600_000;
    }

    if (amount < autoLimit && !needsSignOff) {
      push(authoriseAt, "claim_authorised", "system", null, amount, { route: "auto" });
    } else if (amount > 10_000 && overridesLeft > 0 && rand() < 0.12) {
      // The overnight batch user force-authorises, skipping sign-off entirely.
      overridesLeft -= 1;
      push(authoriseAt - 3_600_000, "manual_override", "ops-batch", null, amount, {
        ticket: `OPS-${7000 + i}`,
      });
      push(authoriseAt, "claim_authorised", "ops-batch", null, amount, { route: "override" });
    } else {
      if (needsSignOff) {
        const senior = market === "UK" ? HANDLERS[rand() < 0.5 ? 0 : 1]! : HANDLERS[3]!;
        push(authoriseAt - 2 * 3_600_000, "sign_off_requested", handlerActor(current), current.seniority, amount, {});
        push(authoriseAt - 3_600_000, "senior_sign_off", handlerActor(senior), senior.seniority, amount, {});
      }
      if (amount > 50_000) {
        // Not in code (R-027) — but the Claims Manager does it by hand, mostly.
        if (secondSignatureMissesLeft > 0 && rand() < 0.2) {
          secondSignatureMissesLeft -= 1;
        } else {
          push(authoriseAt - 30 * 60_000, "second_signature", "H1", 5, amount, {});
        }
      }
      push(authoriseAt, "claim_authorised", handlerActor(current), current.seniority, amount, {
        route: "handler",
      });
    }

    // Disbursements on authorised claims.
    const count = Math.floor(rand() * 4);
    let dCursor = authoriseAt;
    for (let d = 0; d < count; d += 1) {
      const category = pick(["COUNSEL", "COUNSEL", "MEDICAL", "COURT", "EXPERT"]);
      const ceiling = category === "COUNSEL" ? 6_500 : category === "EXPERT" ? 4_800 : 1_500;
      const requested = Math.round(between(150, ceiling));
      dCursor = addWorkingDays(dCursor, 2 + Math.floor(rand() * 10));
      while (isWeekend(dCursor)) dCursor += DAY;
      dCursor += Math.floor(between(9, 17)) * 3_600_000 + Math.floor(rand() * 4) * 15 * 60_000;
      const id = disbursementId++;
      const method = brand !== "DAS" && rand() < 0.15 ? "CHEQUE" : "BACS";
      push(dCursor, "disbursement_requested", handlerActor(current), current.seniority, requested, {
        disbursement_id: id,
        category,
        method,
      });

      // Code rule R-017: off-panel non-DAS blocked only above £5,000.
      if (brand !== "DAS" && !panel && requested > 5_000) {
        push(dCursor + 60_000, "disbursement_rejected", "system", null, requested, {
          disbursement_id: id,
          reason: "panel_solicitor_required",
        });
        continue;
      }

      // Code rule R-015: counsel capped at £3,500, silently.
      let paid = requested;
      if (category === "COUNSEL" && requested > 3_500) {
        paid = 3_500;
        push(dCursor + 60_000, "disbursement_capped", "system", null, paid, {
          disbursement_id: id,
          requested,
        });
      }

      // Code rules R-018/R-019: 15:00 cutoff, 12:00 on Fridays.
      const submitted = new Date(dCursor);
      const minutes = submitted.getUTCHours() * 60 + submitted.getUTCMinutes();
      const cutoff = submitted.getUTCDay() === 5 ? 12 * 60 : 15 * 60;
      const valueDate =
        method === "BACS" && minutes >= cutoff ? addWorkingDays(dCursor, 1) : Math.floor(dCursor / DAY) * DAY;
      push(dCursor + 2 * 60_000, "disbursement_paid", "system", null, paid, {
        disbursement_id: id,
        method,
        value_date: formatDate(valueDate),
      });
    }
  }

  events.sort((a, b) => a.ms - b.ms || a.seq - b.seq);
  const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [OPS_COLUMNS.join(",")];
  events.forEach((e, index) => {
    const row: Record<(typeof OPS_COLUMNS)[number], string> = {
      ...e,
      event_id: String(index + 1),
    };
    lines.push(OPS_COLUMNS.map((c) => escape(row[c])).join(","));
  });
  return lines.join("\n") + "\n";
}
