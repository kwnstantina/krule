import { describe, it, expect } from "vitest";
import {
  RuleSchema,
  evaluateCondition,
  executeRules,
  registerOperator,
} from "./evaluators";

/**
 * Context used by the leaf-condition helpers below.
 * `temp` is 30, so `tempIsHot` holds and `tempIsCold` does not.
 */
const context = { temp: 30, city: "Bristol" };

const tempIsHot = { field: "temp", operator: "==", value: 30 } as const;
const tempIsCold = { field: "temp", operator: "==", value: -5 } as const;

const alwaysTrue = { operator: "AND", conditions: [] };

describe("executeRules", () => {
  it("returns an empty result map when given no rules", () => {
    const results = executeRules([], context);

    expect(results).toBeInstanceOf(Map);
    expect(results.size).toBe(0);
  });

  it("does not mutate the caller's rules array when sorting by priority", () => {
    const rules = [
      { priority: 1, condition: alwaysTrue, actions: [] },
      { priority: 5, condition: alwaysTrue, actions: [] },
    ];

    executeRules(rules, context);

    expect(rules.map((rule) => rule.priority)).toEqual([1, 5]);
  });

  /**
   * CHARACTERIZATION TEST — pins current behavior, which may be a bug.
   *
   * `executeRules` sorts descending by priority and then calls
   * `results.set(action.target, ...)` in that order. Because a later `set`
   * overwrites an earlier one, the LOWEST-priority matching rule wins the final
   * value for a shared target — the opposite of what "priority" usually means.
   *
   * Plan 01-02 deliberately does not change this. See 01-02-SUMMARY.md.
   */
  it("lets the lowest-priority matching rule win a shared action target", () => {
    const rules = [
      {
        priority: 10,
        condition: alwaysTrue,
        actions: [{ type: "set", target: "discount", payload: "from-high-priority" }],
      },
      {
        priority: 1,
        condition: alwaysTrue,
        actions: [{ type: "set", target: "discount", payload: "from-low-priority" }],
      },
    ];

    const results = executeRules(rules, context);

    expect(results.get("discount")).toEqual({
      type: "set",
      payload: "from-low-priority",
    });
  });
});

describe("evaluateCondition — leaf conditions", () => {
  it("evaluates each comparison operator against the context", () => {
    expect(evaluateCondition({ field: "temp", operator: "==", value: 30 }, context)).toBe(true);
    expect(evaluateCondition({ field: "temp", operator: "!=", value: 30 }, context)).toBe(false);
    expect(evaluateCondition({ field: "temp", operator: ">", value: 20 }, context)).toBe(true);
    expect(evaluateCondition({ field: "temp", operator: "<", value: 20 }, context)).toBe(false);
    expect(evaluateCondition({ field: "temp", operator: ">=", value: 30 }, context)).toBe(true);
    expect(evaluateCondition({ field: "temp", operator: "<=", value: 29 }, context)).toBe(false);
    expect(
      evaluateCondition({ field: "city", operator: "in", value: ["Bristol", "Bath"] }, context)
    ).toBe(true);
    expect(
      evaluateCondition({ field: "city", operator: "not", value: ["Bristol", "Bath"] }, context)
    ).toBe(false);
  });

  it("throws a descriptive error for an unsupported comparison operator", () => {
    expect(() =>
      evaluateCondition({ field: "temp", operator: "≈" as never, value: 30 }, context)
    ).toThrow(/Unknown condition operator: ≈/);
  });
});

describe("evaluateCondition — group operators", () => {
  it("AND is true only when every condition holds", () => {
    expect(evaluateCondition({ operator: "AND", conditions: [tempIsHot, tempIsHot] }, context)).toBe(true);
    expect(evaluateCondition({ operator: "AND", conditions: [tempIsHot, tempIsCold] }, context)).toBe(false);
    expect(evaluateCondition({ operator: "AND", conditions: [tempIsCold, tempIsCold] }, context)).toBe(false);
  });

  it("OR is true when at least one condition holds", () => {
    expect(evaluateCondition({ operator: "OR", conditions: [tempIsCold, tempIsHot] }, context)).toBe(true);
    expect(evaluateCondition({ operator: "OR", conditions: [tempIsCold, tempIsCold] }, context)).toBe(false);
  });

  it("XOR is true only when exactly one condition holds", () => {
    expect(evaluateCondition({ operator: "XOR", conditions: [tempIsHot, tempIsCold] }, context)).toBe(true);
    expect(evaluateCondition({ operator: "XOR", conditions: [tempIsHot, tempIsHot] }, context)).toBe(false);
    expect(evaluateCondition({ operator: "XOR", conditions: [tempIsCold, tempIsCold] }, context)).toBe(false);
  });

  it("NAND is the negation of AND", () => {
    expect(evaluateCondition({ operator: "NAND", conditions: [tempIsHot, tempIsHot] }, context)).toBe(false);
    expect(evaluateCondition({ operator: "NAND", conditions: [tempIsHot, tempIsCold] }, context)).toBe(true);
    expect(evaluateCondition({ operator: "NAND", conditions: [tempIsCold, tempIsCold] }, context)).toBe(true);
  });

  it("NOR is the negation of OR", () => {
    expect(evaluateCondition({ operator: "NOR", conditions: [tempIsCold, tempIsHot] }, context)).toBe(false);
    expect(evaluateCondition({ operator: "NOR", conditions: [tempIsCold, tempIsCold] }, context)).toBe(true);
  });

  /**
   * Empty-group results follow from JS `every`/`some` semantics. Pinned
   * deliberately so a future refactor cannot change them silently.
   */
  it("pins empty-group semantics for all five operators", () => {
    expect(evaluateCondition({ operator: "AND", conditions: [] }, context)).toBe(true);
    expect(evaluateCondition({ operator: "OR", conditions: [] }, context)).toBe(false);
    expect(evaluateCondition({ operator: "XOR", conditions: [] }, context)).toBe(false);
    expect(evaluateCondition({ operator: "NAND", conditions: [] }, context)).toBe(false);
    expect(evaluateCondition({ operator: "NOR", conditions: [] }, context)).toBe(true);
  });

  it("throws a descriptive error for an unregistered group operator", () => {
    expect(() =>
      evaluateCondition({ operator: "MAYBE", conditions: [tempIsHot] }, context)
    ).toThrow(/Unknown group operator: MAYBE/);
  });
});

describe("evaluateCondition — nested groups", () => {
  it("recurses into nested groups and returns true when the nesting resolves true", () => {
    const condition = {
      operator: "AND",
      conditions: [
        tempIsHot,
        {
          operator: "OR",
          conditions: [
            tempIsCold,
            { operator: "AND", conditions: [tempIsHot, tempIsHot] },
          ],
        },
      ],
    };

    expect(evaluateCondition(condition, context)).toBe(true);
  });

  it("recurses into nested groups and returns false when the nesting resolves false", () => {
    const condition = {
      operator: "AND",
      conditions: [
        tempIsHot,
        {
          operator: "OR",
          conditions: [
            tempIsCold,
            { operator: "AND", conditions: [tempIsHot, tempIsCold] },
          ],
        },
      ],
    };

    expect(evaluateCondition(condition, context)).toBe(false);
  });

  it("evaluates four levels of nesting", () => {
    const condition = {
      operator: "AND",
      conditions: [
        {
          operator: "OR",
          conditions: [
            {
              operator: "NAND",
              conditions: [
                { operator: "AND", conditions: [tempIsHot, tempIsCold] },
                tempIsHot,
              ],
            },
          ],
        },
      ],
    };

    // innermost AND -> false; NAND[false, true] -> true; OR[true] -> true; AND[true] -> true
    expect(evaluateCondition(condition, context)).toBe(true);
  });
});

describe("registerOperator", () => {
  it("dispatches a registered custom group operator", () => {
    registerOperator({
      name: "MAJORITY",
      evaluate: (results: boolean[]) =>
        results.filter(Boolean).length * 2 > results.length,
    });

    expect(
      evaluateCondition(
        { operator: "MAJORITY", conditions: [tempIsHot, tempIsHot, tempIsCold] },
        context
      )
    ).toBe(true);

    expect(
      evaluateCondition(
        { operator: "MAJORITY", conditions: [tempIsHot, tempIsCold, tempIsCold] },
        context
      )
    ).toBe(false);
  });

  it("receives evaluated booleans, not raw condition objects", () => {
    const seen: unknown[] = [];

    registerOperator({
      name: "CAPTURE",
      evaluate: (results: boolean[]) => {
        seen.push(...results);
        return true;
      },
    });

    evaluateCondition(
      { operator: "CAPTURE", conditions: [tempIsHot, tempIsCold] },
      context
    );

    expect(seen).toEqual([true, false]);
  });

  it("refuses to override a built-in operator", () => {
    expect(() =>
      registerOperator({ name: "AND", evaluate: () => true })
    ).toThrow(/Cannot override built-in operator: AND/);
  });
});

describe("public entry point", () => {
  it("runs a schema-validated rule with a nested condition through executeRules", () => {
    const rule = RuleSchema.parse({
      id: "R-001",
      name: "hot-in-bristol",
      priority: 10,
      condition: {
        operator: "AND",
        conditions: [
          { field: "city", operator: "in", value: ["Bristol", "Bath"] },
          {
            operator: "OR",
            conditions: [
              { field: "temp", operator: ">", value: 25 },
              { field: "temp", operator: "<", value: 0 },
            ],
          },
        ],
      },
      actions: [{ type: "set", target: "alert", payload: { level: "heat" } }],
    });

    const results = executeRules([rule], context);

    expect(results.get("alert")).toEqual({
      type: "set",
      payload: { level: "heat" },
    });
  });

  it("does not fire a schema-validated rule whose nested condition fails", () => {
    const rule = RuleSchema.parse({
      priority: 0,
      condition: {
        operator: "AND",
        conditions: [
          { field: "city", operator: "in", value: ["Bristol"] },
          { field: "temp", operator: "<", value: 0 },
        ],
      },
      actions: [{ type: "set", target: "alert", payload: { level: "freeze" } }],
    });

    const results = executeRules([rule], context);

    expect(results.size).toBe(0);
  });
});
