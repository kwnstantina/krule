import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import { KontractDocumentSchema, KontractRuleSchema } from "./index";

const validRule = {
  id: "R-114",
  statement: "A claim over £10,000 requires senior handler authorisation.",
  provenance: [{ file: "src/claims/authorise.ts", line: 42, commit: "abc1234" }],
  confidence: 0.92,
  origins: ["code"],
  status: "verified",
};

const validDocument = {
  kontractVersion: 1,
  module: "claims/authorisation",
  generatedAt: "2026-07-26T09:15:00.000Z",
  commit: "deadbee",
  rules: [validRule],
};

describe("KontractRuleSchema", () => {
  it("accepts a well-formed rule", () => {
    expect(() => KontractRuleSchema.parse(validRule)).not.toThrow();
  });

  it("defaults status to unverified when omitted", () => {
    const { status, ...withoutStatus } = validRule;
    void status;

    expect(KontractRuleSchema.parse(withoutStatus).status).toBe("unverified");
  });

  it.each([
    ["RULE-1", "wrong prefix"],
    ["R-abc", "non-numeric suffix"],
    ["R-", "missing number"],
    ["114", "no prefix"],
  ])("rejects the id %s (%s)", (id) => {
    expect(() => KontractRuleSchema.parse({ ...validRule, id })).toThrow(ZodError);
  });

  it.each([1.5, -0.1, 2])("rejects a confidence of %s", (confidence) => {
    expect(() => KontractRuleSchema.parse({ ...validRule, confidence })).toThrow(
      ZodError
    );
  });

  it("accepts confidence at both bounds", () => {
    expect(KontractRuleSchema.parse({ ...validRule, confidence: 0 }).confidence).toBe(0);
    expect(KontractRuleSchema.parse({ ...validRule, confidence: 1 }).confidence).toBe(1);
  });

  it("rejects an empty provenance array", () => {
    expect(() => KontractRuleSchema.parse({ ...validRule, provenance: [] })).toThrow(
      ZodError
    );
  });

  it("rejects provenance missing the commit", () => {
    expect(() =>
      KontractRuleSchema.parse({
        ...validRule,
        provenance: [{ file: "src/a.ts", line: 1 }],
      })
    ).toThrow(ZodError);
  });

  it("rejects a non-positive provenance line", () => {
    expect(() =>
      KontractRuleSchema.parse({
        ...validRule,
        provenance: [{ file: "src/a.ts", line: 0, commit: "abc" }],
      })
    ).toThrow(ZodError);
  });

  it("rejects an empty origins array", () => {
    expect(() => KontractRuleSchema.parse({ ...validRule, origins: [] })).toThrow(
      ZodError
    );
  });

  it("rejects an unknown origin", () => {
    expect(() =>
      KontractRuleSchema.parse({ ...validRule, origins: ["wiki"] })
    ).toThrow(ZodError);
  });

  it("rejects an unknown status", () => {
    expect(() =>
      KontractRuleSchema.parse({ ...validRule, status: "probably-fine" })
    ).toThrow(ZodError);
  });

  it("accepts all four statuses", () => {
    for (const status of ["verified", "unverified", "contradicted", "drifted"]) {
      expect(KontractRuleSchema.parse({ ...validRule, status }).status).toBe(status);
    }
  });
});

describe("KontractDocumentSchema", () => {
  it("accepts a well-formed document", () => {
    expect(() => KontractDocumentSchema.parse(validDocument)).not.toThrow();
  });

  it("rejects duplicate rule ids", () => {
    expect(() =>
      KontractDocumentSchema.parse({
        ...validDocument,
        rules: [validRule, { ...validRule, statement: "A different sentence entirely." }],
      })
    ).toThrow(/Duplicate rule id: R-114/);
  });

  it("points the duplicate-id error at the offending rule", () => {
    try {
      KontractDocumentSchema.parse({
        ...validDocument,
        rules: [validRule, { ...validRule, id: "R-200" }, { ...validRule }],
      });
      throw new Error("expected a ZodError");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect((error as ZodError).issues[0]?.path).toEqual(["rules", 2, "id"]);
    }
  });

  it("rejects an unknown kontractVersion", () => {
    expect(() =>
      KontractDocumentSchema.parse({ ...validDocument, kontractVersion: 2 })
    ).toThrow(ZodError);
  });

  it("rejects a non-ISO generatedAt", () => {
    expect(() =>
      KontractDocumentSchema.parse({ ...validDocument, generatedAt: "26 July 2026" })
    ).toThrow(ZodError);
  });

  it("accepts a document with no rules yet", () => {
    expect(KontractDocumentSchema.parse({ ...validDocument, rules: [] }).rules).toEqual(
      []
    );
  });
});
