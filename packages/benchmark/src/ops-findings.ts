import { OPS_COLUMNS, workingDaysBetween } from "./ops-generator";

/**
 * Recomputes every data-backed figure in fixtures/legacy-claims-ops/PLANTED.md
 * straight from the event log. These are the numbers a correct three-layer
 * extractor should report; the test pins them so the answer sheet can't drift.
 *
 * Deliberately plain: group by case, then one small query per finding.
 */

export interface Row {
  event_id: number;
  case_id: string;
  activity: string;
  timestamp: string;
  actor: string;
  actor_seniority: string;
  market: string;
  brand: string;
  broker_code: string;
  amount: number | null;
  currency: string;
  attrs: Record<string, string>;
}

function splitCsvLine(line: string): string[] {
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

export function parseOpsEvents(csv: string): Row[] {
  const [header, ...lines] = csv.trimEnd().split("\n");
  if (header !== OPS_COLUMNS.join(",")) {
    throw new Error("unexpected event log header: " + header);
  }
  return lines.map((line) => {
    const f = splitCsvLine(line);
    const attrs: Record<string, string> = {};
    for (const pair of (f[11] ?? "").split(";")) {
      if (pair === "") continue;
      const eq = pair.indexOf("=");
      attrs[pair.slice(0, eq)] = pair.slice(eq + 1);
    }
    return {
      event_id: Number(f[0]),
      case_id: f[1]!,
      activity: f[2]!,
      timestamp: f[3]!,
      actor: f[4]!,
      actor_seniority: f[5]!,
      market: f[6]!,
      brand: f[7]!,
      broker_code: f[8]!,
      amount: f[9] === "" ? null : Number(f[9]),
      currency: f[10]!,
      attrs,
    };
  });
}

const ms = (timestamp: string) => Date.parse(timestamp + "Z");

export interface OpsFigures {
  claims: number;
  events: number;
  /** F-01: authorised UK claims whose policy lapsed 31–45 days before — allowed by code (45), forbidden by policy (30). */
  lapseWindowClaims: number;
  lapseWindowAmount: number;
  /** F-02: UK claims over £10,000 authorised with no senior sign-off. */
  overriddenOver10k: number;
  overriddenOver10kAmount: number;
  /** F-03: authorised claims over 50,000, and how many carry the manual second signature. */
  over50kAuthorised: number;
  over50kWithSecondSignature: number;
  /** Of the claims missing the second signature, those that went through `manual_override`. */
  over50kMissingViaOverride: number;
  /** F-04: UK disbursements £2,500–£5,000 paid on off-panel non-DAS claims. */
  offPanelMidDisbursements: number;
  offPanelMidAmount: number;
  /** F-05: contact attempts later than 2 working days after receipt. */
  contactBreaches: number;
  contactMedianWorkingDays: number;
  /** F-06: sub-limit claims authorised automatically vs sub-limit claims routed to a human without cause. */
  autoAuthorised: number;
  /** F-07: Friday BACS payments submitted 12:00–15:00 and value-dated the next working day. */
  fridayLatePayments: number;
  /** F-08: UK BR0042 claims reaching authorisation, and how many were first reassigned to H1. */
  br0042Authorised: number;
  br0042ReassignedToH1: number;
  /** F-09: claims received in December, and how many were authorised before January. */
  decemberAuthorised: number;
  decemberAuthorisedInDecember: number;
  /** F-11: BR0388 claims of 10,000 or less authorised without sign-off. */
  br0388WithoutSignOff: number;
  /** F-12: UK counsel disbursements requested £3,500–£4,000, capped to £3,500, and the shortfall. */
  counselCappedUnderPolicyCap: number;
  counselShortfall: number;
}

export function computeOpsFigures(rows: Row[]): OpsFigures {
  const byCase = new Map<string, Row[]>();
  for (const row of rows) {
    const list = byCase.get(row.case_id) ?? [];
    list.push(row);
    byCase.set(row.case_id, list);
  }

  const f: OpsFigures = {
    claims: byCase.size,
    events: rows.length,
    lapseWindowClaims: 0,
    lapseWindowAmount: 0,
    overriddenOver10k: 0,
    overriddenOver10kAmount: 0,
    over50kAuthorised: 0,
    over50kWithSecondSignature: 0,
    over50kMissingViaOverride: 0,
    offPanelMidDisbursements: 0,
    offPanelMidAmount: 0,
    contactBreaches: 0,
    contactMedianWorkingDays: 0,
    autoAuthorised: 0,
    fridayLatePayments: 0,
    br0042Authorised: 0,
    br0042ReassignedToH1: 0,
    decemberAuthorised: 0,
    decemberAuthorisedInDecember: 0,
    br0388WithoutSignOff: 0,
    counselCappedUnderPolicyCap: 0,
    counselShortfall: 0,
  };
  const delays: number[] = [];

  for (const events of byCase.values()) {
    const has = (activity: string) => events.some((e) => e.activity === activity);
    const received = events.find((e) => e.activity === "claim_received")!;
    const authorised = events.find((e) => e.activity === "claim_authorised");
    const amount = received.amount ?? 0;

    const contact = events.find((e) => e.activity === "contact_attempt_logged");
    if (contact !== undefined) {
      const delay = workingDaysBetween(ms(received.timestamp), ms(contact.timestamp));
      delays.push(delay);
      if (delay > 2) f.contactBreaches += 1;
    }

    if (authorised === undefined) continue;

    // Money findings are counted on UK (GBP) claims only, so totals never mix
    // currencies.
    const gbp = received.currency === "GBP";
    const gap = Number(received.attrs.lapse_gap_days ?? "0");
    if (gbp && gap > 30 && gap <= 45) {
      f.lapseWindowClaims += 1;
      f.lapseWindowAmount += amount;
    }
    if (gbp && amount > 10_000 && !has("senior_sign_off")) {
      f.overriddenOver10k += 1;
      f.overriddenOver10kAmount += amount;
    }
    if (amount > 50_000) {
      f.over50kAuthorised += 1;
      if (has("second_signature")) f.over50kWithSecondSignature += 1;
      else if (has("manual_override")) f.over50kMissingViaOverride += 1;
    }
    if (authorised.attrs.route === "auto") f.autoAuthorised += 1;
    if (received.broker_code === "BR0042" && received.market === "UK") {
      f.br0042Authorised += 1;
      if (events.some((e) => e.activity === "reassigned" && e.attrs.to === "H1")) {
        f.br0042ReassignedToH1 += 1;
      }
    }
    if (received.timestamp.slice(5, 7) === "12") {
      f.decemberAuthorised += 1;
      if (authorised.timestamp.slice(5, 7) === "12") f.decemberAuthorisedInDecember += 1;
    }
    if (received.broker_code === "BR0388" && amount <= 10_000 && !has("senior_sign_off")) {
      f.br0388WithoutSignOff += 1;
    }

    const offPanelNonDas = received.brand !== "DAS" && received.attrs.panel === "false";
    const requests = new Map(
      events
        .filter((e) => e.activity === "disbursement_requested")
        .map((e) => [e.attrs.disbursement_id!, e]),
    );
    for (const paid of events.filter((e) => e.activity === "disbursement_paid")) {
      const request = requests.get(paid.attrs.disbursement_id!)!;
      const requested = request.amount ?? 0;
      if (gbp && offPanelNonDas && requested > 2_500 && requested <= 5_000) {
        f.offPanelMidDisbursements += 1;
        f.offPanelMidAmount += paid.amount ?? 0;
      }
      if (gbp && request.attrs.category === "COUNSEL" && requested > 3_500 && requested <= 4_000) {
        f.counselCappedUnderPolicyCap += 1;
        f.counselShortfall += requested - (paid.amount ?? 0);
      }
      const at = new Date(ms(request.timestamp));
      const minutes = at.getUTCHours() * 60 + at.getUTCMinutes();
      if (
        paid.attrs.method === "BACS" &&
        at.getUTCDay() === 5 &&
        minutes >= 12 * 60 &&
        minutes < 15 * 60 &&
        paid.attrs.value_date !== request.timestamp.slice(0, 10)
      ) {
        f.fridayLatePayments += 1;
      }
    }
  }

  delays.sort((a, b) => a - b);
  f.contactMedianWorkingDays = delays[Math.floor(delays.length / 2)] ?? 0;
  return f;
}
