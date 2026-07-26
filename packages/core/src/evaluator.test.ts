import { describe, it, expect } from "vitest";
import { executeRules } from "./evaluators";

describe("executeRules", () => {
  it("returns an empty result map when given no rules", () => {
    const results = executeRules([], { anything: true });

    expect(results).toBeInstanceOf(Map);
    expect(results.size).toBe(0);
  });

  it("does not mutate the caller's rules array when sorting by priority", () => {
    const rules = [
      { priority: 1, condition: { operator: "AND", conditions: [] }, actions: [] },
      { priority: 5, condition: { operator: "AND", conditions: [] }, actions: [] },
    ];

    executeRules(rules, {});

    expect(rules.map((rule) => rule.priority)).toEqual([1, 5]);
  });
});
