import type { Hypothesis, Predicate } from "@repo/observe";

/**
 * Hand-written hypotheses for the `legacy-claims-ops` findings: what a perfect
 * observe run would propose. Two jobs:
 *
 * - `ops-reference.test.ts` runs them through `@repo/observe` and checks every
 *   result against the independent figures in `ops-findings.ts`. That proves
 *   the query engine measures what the answer sheet says.
 * - `krule observe --reference` runs them with no API key, as the offline demo.
 *   Like `krule demo`, that is circular: it shows the engine, not the model.
 *
 * Some finding figures are GBP-only (see PLANTED.md), so those hypotheses carry a
 * `currency eq GBP` predicate that a model-written query would not need.
 */

const p = (field: string, op: Predicate["op"], value: string | number): Predicate => ({
  field,
  op,
  value: String(value),
});
const authorised = p("count:claim_authorised", "gt", 0);
const gbp = p("currency", "eq", "GBP");

export const OPS_REFERENCE_HYPOTHESES: Record<string, Hypothesis> = {
  "F-01": {
    statement: "A claim is declined where the policy lapsed more than 30 days before the incident.",
    source: "policy",
    policyRef: "CAP-003 §2.1",
    unit: "case",
    eventActivity: null,
    population: [gbp, p("lapse_gap_days", "gt", 30)],
    expectation: [p("count:claim_authorised", "eq", 0)],
    sumField: "amount",
  },
  "F-02": {
    statement: "Every claim above £10,000 is signed off by a senior handler before authorisation.",
    source: "policy",
    policyRef: "CAP-003 §3.2",
    unit: "case",
    eventActivity: null,
    population: [gbp, p("amount", "gt", 10_000), authorised],
    expectation: [p("count:senior_sign_off", "gt", 0)],
    sumField: "amount",
  },
  "F-03": {
    statement: "Every claim above £50,000 carries the Claims Manager's second signature.",
    source: "policy",
    policyRef: "CAP-003 §3.4",
    unit: "case",
    eventActivity: null,
    population: [p("amount", "gt", 50_000), authorised],
    expectation: [p("count:second_signature", "gt", 0)],
    sumField: "amount",
  },
  "F-04": {
    statement: "No disbursement above £2,500 is paid on an off-panel non-DAS file.",
    source: "policy",
    policyRef: "CAP-003 §4.1",
    unit: "event",
    eventActivity: "disbursement_paid",
    population: [p("case.brand", "neq", "DAS"), p("case.panel", "eq", "false"), p("case.currency", "eq", "GBP")],
    expectation: [p("amount", "lte", 2_500)],
    sumField: "amount",
  },
  "F-05": {
    statement: "A contact attempt is logged within 2 working days of a claim being received.",
    source: "policy",
    policyRef: "CAP-003 §5.1",
    unit: "case",
    eventActivity: null,
    population: [],
    expectation: [p("wdays:claim_received..contact_attempt_logged", "lte", 2)],
    sumField: null,
  },
  "F-06-UK": {
    statement: "Only UK claims below £1,000 are authorised automatically.",
    source: "policy",
    policyRef: "CAP-003 §3.1",
    unit: "event",
    eventActivity: "claim_authorised",
    population: [p("route", "eq", "auto"), p("market", "eq", "UK")],
    expectation: [p("case.amount", "lt", 1_000)],
    sumField: null,
  },
  "F-06-CA": {
    statement: "Only CA claims below CAD 750 are authorised automatically.",
    source: "policy",
    policyRef: "CAP-003 §3.1",
    unit: "event",
    eventActivity: "claim_authorised",
    population: [p("route", "eq", "auto"), p("market", "eq", "CA")],
    expectation: [p("case.amount", "lt", 750)],
    sumField: null,
  },
  "F-07": {
    statement: "On Fridays, BACS payments submitted from 12:00 take the next working day's value date.",
    source: "pattern",
    policyRef: null,
    unit: "event",
    eventActivity: "disbursement_paid",
    population: [p("method", "eq", "BACS"), p("$weekday", "eq", 5), p("$time", "gte", "12:00"), p("$time", "lt", "15:00")],
    expectation: [p("value_date", "neq", "@$date")],
    sumField: null,
  },
  "F-08": {
    statement: "UK claims introduced by broker BR0042 are reassigned to the most senior handler before authorisation.",
    source: "pattern",
    policyRef: null,
    unit: "case",
    eventActivity: null,
    population: [p("broker_code", "eq", "BR0042"), p("market", "eq", "UK"), authorised],
    expectation: [p("count:reassigned", "gt", 0)],
    sumField: null,
  },
  "F-09": {
    statement: "Claims received in December are not authorised until January.",
    source: "pattern",
    policyRef: null,
    unit: "case",
    eventActivity: null,
    population: [p("month:claim_received", "eq", 12), authorised],
    expectation: [p("month:claim_authorised", "eq", 1)],
    sumField: null,
  },
  "F-10": {
    statement: "Every complaint is acknowledged in writing within 5 working days.",
    source: "policy",
    policyRef: "CAP-003 §5.2",
    unit: "case",
    eventActivity: null,
    population: [p("count:complaint_received", "gt", 0)],
    expectation: [p("wdays:complaint_received..complaint_acknowledged", "lte", 5)],
    sumField: null,
  },
  "F-11": {
    statement: "Claims from watchlist broker BR0388 are signed off by a senior handler whatever their value.",
    source: "policy",
    policyRef: "CAP-003 §3.3",
    unit: "case",
    eventActivity: null,
    population: [p("broker_code", "eq", "BR0388"), p("amount", "lte", 10_000), authorised],
    expectation: [p("count:senior_sign_off", "gt", 0)],
    sumField: "amount",
  },
  "F-12": {
    statement: "Counsel fees are only reduced when they exceed the £4,000 cap.",
    source: "policy",
    policyRef: "CAP-003 §4.2",
    unit: "event",
    eventActivity: "disbursement_capped",
    population: [p("case.currency", "eq", "GBP")],
    expectation: [p("requested", "gt", 4_000)],
    sumField: "requested",
  },
};
