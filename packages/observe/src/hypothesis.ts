import { z } from "zod";

/**
 * A hypothesis is a claim about the log that a query can check: "every case in
 * <population> also satisfies <expectation>". The model writes these; it never
 * computes a figure itself. `evaluate.ts` runs them deterministically.
 *
 * The query language is deliberately flat: a predicate is `{field, op, value}`,
 * and lists are ANDed. A recursive language would be more expressive and much
 * easier for a model to get subtly wrong. A flat one is easy to validate,
 * render and audit.
 *
 * Fields, case unit:
 *   <attr>                 case attribute (from the case's first event)
 *   count:<activity>       how many events of that activity the case has
 *   month:<activity>       month (1–12) of the first such event
 *   wdays:<from>..<to>     working days from the first <from> to the first <to>
 *
 * Fields, event unit (population = events of `eventActivity`):
 *   <attr>                 the event's own attribute
 *   case.<attr>            an attribute of the event's case
 *   $date $month $weekday $time   from the event timestamp (weekday 1=Mon..7=Sun, time "HH:MM")
 *
 * A value starting with `@` names another field instead of a literal, e.g.
 * `{field: "value_date", op: "neq", value: "@$date"}`.
 */

export const OPS = ["eq", "neq", "gt", "gte", "lt", "lte", "in", "not_in"] as const;
export type Op = (typeof OPS)[number];

export const PredicateSchema = z.object({
  field: z.string().min(1),
  op: z.enum(OPS),
  value: z.string(),
});
export type Predicate = z.infer<typeof PredicateSchema>;

export const HypothesisSchema = z.object({
  statement: z.string().min(10),
  source: z.enum(["policy", "pattern"]),
  policyRef: z.string().nullable(),
  unit: z.enum(["case", "event"]),
  eventActivity: z.string().nullable(),
  population: z.array(PredicateSchema),
  expectation: z.array(PredicateSchema).min(1),
  sumField: z.string().nullable(),
});
export type Hypothesis = z.infer<typeof HypothesisSchema>;

export const HypothesisSetSchema = z.object({
  hypotheses: z.array(HypothesisSchema),
});
export type HypothesisSet = z.infer<typeof HypothesisSetSchema>;

const PREDICATE_JSON = {
  type: "object",
  properties: {
    field: { type: "string", description: "A field name in the syntax the system prompt defines." },
    op: { type: "string", enum: [...OPS] },
    value: {
      type: "string",
      description: "Literal value (numbers as plain digits), comma-separated list for in/not_in, or @<field> to compare against another field.",
    },
  },
  required: ["field", "op", "value"],
  additionalProperties: false,
};

const nullableString = (description: string) => ({
  anyOf: [{ type: "string" }, { type: "null" }],
  description,
});

/** Hand-written to match `HypothesisSetSchema`; `hypothesis.test.ts` pins them together. */
export const HYPOTHESES_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    hypotheses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          statement: {
            type: "string",
            description: "The rule in one plain sentence, as a business owner would state it.",
          },
          source: {
            type: "string",
            enum: ["policy", "pattern"],
            description: "policy = checks a clause of a supplied policy document; pattern = a regularity you suspect from the log profile.",
          },
          policyRef: nullableString("Document and clause, e.g. 'CAP-003 §3.2'. Null for patterns."),
          unit: { type: "string", enum: ["case", "event"] },
          eventActivity: nullableString("For unit=event: the activity whose events form the population. Null for unit=case."),
          population: { type: "array", items: PREDICATE_JSON, description: "Which cases/events the rule applies to (ANDed). Empty = all." },
          expectation: { type: "array", items: PREDICATE_JSON, description: "What the rule says must hold for each of them (ANDed)." },
          sumField: nullableString("Numeric field to total over violations, e.g. 'amount'. Null if none."),
        },
        required: ["statement", "source", "policyRef", "unit", "eventActivity", "population", "expectation", "sumField"],
        additionalProperties: false,
      },
    },
  },
  required: ["hypotheses"],
  additionalProperties: false,
};

/** One-line, human-readable rendering of the query — what an auditor re-runs. */
export function renderQuery(h: Hypothesis): string {
  const list = (ps: Predicate[]) =>
    ps.length === 0 ? "true" : ps.map((p) => `${p.field} ${p.op} ${JSON.stringify(p.value)}`).join(" AND ");
  const from = h.unit === "case" ? "cases" : `events[${h.eventActivity ?? "?"}]`;
  return `FROM ${from} WHERE ${list(h.population)} EXPECT ${list(h.expectation)}`;
}
