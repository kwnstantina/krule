import { describe, expect, it } from "vitest";
import { EMPTY_USAGE, type CompletionRequest, type CompletionResult, type LlmProvider } from "@repo/llm";
import {
  compare,
  evaluateHypothesis,
  HYPOTHESES_JSON_SCHEMA,
  HypothesisSetSchema,
  observeLog,
  parseEventLog,
  profileLog,
  renderObservations,
  workingDaysBetween,
  type Hypothesis,
} from "./index";

const CSV = [
  "case_id,activity,timestamp,amount,attrs",
  "C1,received,2024-01-05T09:00:00,500,broker=A",
  "C1,approved,2024-01-08T10:00:00,,",
  "C2,received,2024-01-05T09:00:00,20000,broker=B",
  "C2,sign_off,2024-01-05T11:00:00,,",
  "C2,approved,2024-01-05T12:00:00,,",
  "C3,received,2024-01-06T09:00:00,15000,broker=A",
  "C3,approved,2024-01-10T09:00:00,,",
].join("\n");

const base: Omit<Hypothesis, "population" | "expectation"> = {
  statement: "Claims above 10,000 are signed off before approval.",
  source: "policy",
  policyRef: "P §1",
  unit: "case",
  eventActivity: null,
  sumField: "amount",
};

describe("event log", () => {
  it("groups events into cases and expands key=value columns", () => {
    const log = parseEventLog(CSV);
    expect(log.cases.map((c) => c.id)).toEqual(["C1", "C2", "C3"]);
    expect(log.cases[0]!.attrs).toEqual({ amount: "500", broker: "A" });
    expect(log.activities).toEqual(["approved", "received", "sign_off"]);
  });

  it("names the missing column", () => {
    expect(() => parseEventLog("id,activity,timestamp\n")).toThrow(/case_id/);
  });

  it("counts working days", () => {
    expect(workingDaysBetween(Date.UTC(2024, 0, 5), Date.UTC(2024, 0, 8))).toBe(1);
  });
});

describe("compare", () => {
  it("compares numerically when both sides are numbers, else as strings", () => {
    expect(compare("9", "lt", "10")).toBe(true);
    expect(compare("12:30", "gte", "12:00")).toBe(true);
    expect(compare("B", "in", "A, B")).toBe(true);
  });

  it("treats a missing value as matching nothing but neq", () => {
    expect(compare(undefined, "gt", "0")).toBe(false);
    expect(compare(undefined, "neq", "DAS")).toBe(true);
  });
});

describe("evaluateHypothesis", () => {
  const log = parseEventLog(CSV);

  it("measures a breached policy with its money at stake", () => {
    const o = evaluateHypothesis(log, {
      ...base,
      population: [{ field: "amount", op: "gt", value: "10000" }],
      expectation: [{ field: "count:sign_off", op: "gt", value: "0" }],
    });
    expect(o.status).toBe("breached");
    expect([o.population, o.violating, o.violatingSum, o.samples]).toEqual([2, 1, 15000, ["C3"]]);
  });

  it("flags fields the log does not have instead of guessing", () => {
    const o = evaluateHypothesis(log, {
      ...base,
      population: [{ field: "region", op: "eq", value: "EU" }],
      expectation: [{ field: "count:sign_off", op: "gt", value: "0" }],
    });
    expect(o.status).toBe("invalid");
    expect(o.problems).toEqual(['unknown case attribute "region"']);
  });

  it("reports a policy about an unrecorded activity as no-evidence", () => {
    const o = evaluateHypothesis(log, {
      ...base,
      population: [{ field: "count:complaint", op: "gt", value: "0" }],
      expectation: [{ field: "wdays:complaint..reply", op: "lte", value: "5" }],
    });
    expect(o.status).toBe("no-evidence");
  });

  it("supports event units, timestamp fields and @field references", () => {
    const o = evaluateHypothesis(log, {
      ...base,
      source: "pattern",
      policyRef: null,
      unit: "event",
      eventActivity: "approved",
      population: [{ field: "$weekday", op: "lte", value: "5" }],
      expectation: [{ field: "$date", op: "neq", value: "@case.month:received" }],
      sumField: null,
    });
    expect(o.population).toBe(3);
  });
});

describe("observeLog", () => {
  it("lets the model choose what to measure, never the figure", async () => {
    let seen: CompletionRequest<unknown> | null = null;
    const provider: LlmProvider = {
      name: "stub",
      async complete<T>(request: CompletionRequest<T>): Promise<CompletionResult<T>> {
        seen = request as CompletionRequest<unknown>;
        return {
          data: request.schema.parse({
            hypotheses: [
              {
                ...base,
                population: [{ field: "amount", op: "gt", value: "10000" }],
                expectation: [{ field: "count:sign_off", op: "gt", value: "0" }],
              },
            ],
          }),
          usage: EMPTY_USAGE,
          model: "stub",
          provider: "stub",
        };
      },
    };
    const result = await observeLog({
      log: parseEventLog(CSV),
      policies: [{ name: "policy.md", text: "§1 Claims above 10,000 need sign-off." }],
      provider,
    });
    expect(result.observations[0]!.violating).toBe(1);
    expect(seen!.corpus).toContain("policy.md");
    expect(seen!.corpus).not.toContain("C3");
    expect(renderObservations(result.observations)).toContain("Policy breached in practice");
  });

  it("keeps the JSON schema and the Zod schema in step", () => {
    const items = (HYPOTHESES_JSON_SCHEMA.properties as { hypotheses: { items: { required: string[] } } }).hypotheses.items;
    const zodKeys = Object.keys(HypothesisSetSchema.shape.hypotheses.element.shape).sort();
    expect([...items.required].sort()).toEqual(zodKeys);
  });

  it("profiles with aggregates only", () => {
    const profile = profileLog(parseEventLog(CSV));
    expect(profile).toContain("3 cases, 7 events");
    expect(profile).not.toContain("C2");
  });
});
