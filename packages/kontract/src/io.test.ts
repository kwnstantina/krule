import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import {
  parseKontract,
  serializeKontract,
  updateRuleStatuses,
  type KontractDocument,
} from "./index";

/**
 * Fixture lives inline rather than as a .yaml asset: Phase 2 builds the real
 * fixture corpus and a stray sample here would compete with it for authority.
 *
 * Exercises multiple provenance entries, mixed origins, and all four statuses.
 */
const document: KontractDocument = {
  kontractVersion: 1,
  module: "claims/authorisation",
  generatedAt: "2026-07-26T09:15:00.000Z",
  commit: "deadbee",
  rules: [
    {
      id: "R-001",
      statement: "A claim over £10,000 requires senior handler authorisation.",
      provenance: [
        { file: "src/claims/authorise.ts", line: 42, commit: "abc1234" },
        { file: "src/claims/limits.ts", line: 7, endLine: 19, commit: "abc1234" },
      ],
      confidence: 0.92,
      origins: ["code", "schema"],
      status: "verified",
      tags: ["authorisation", "threshold"],
    },
    {
      id: "R-002",
      statement: "Policies lapse 30 days after a missed premium payment.",
      provenance: [{ file: "docs/underwriting.md", line: 88, commit: "abc1234" }],
      confidence: 0.4,
      origins: ["docs"],
      status: "contradicted",
      notes: "The code applies 45 days, not 30.",
    },
    {
      id: "R-003",
      statement: "Disbursements to non-panel solicitors are blocked entirely.",
      provenance: [{ file: "src/payments/panel.ts", line: 15, commit: "abc1234" }],
      confidence: 0.71,
      origins: ["code"],
      status: "drifted",
    },
    {
      id: "R-004",
      statement: "Mediation is offered before litigation on all BTE claims.",
      provenance: [{ file: "src/claims/mediation.ts", line: 3, commit: "abc1234" }],
      confidence: 0.55,
      origins: ["code", "data"],
      status: "unverified",
    },
  ],
};

describe("round trip", () => {
  it("survives serialize -> parse unchanged", () => {
    expect(parseKontract(serializeKontract(document))).toEqual(document);
  });

  it("produces stable output across two serialize passes", () => {
    const once = serializeKontract(document);

    expect(serializeKontract(parseKontract(once))).toBe(once);
  });

  it("defaults a status-less rule to unverified on parse", () => {
    const yamlText = serializeKontract(document).replace(
      "    status: unverified\n",
      ""
    );

    const parsed = parseKontract(yamlText);

    expect(parsed.rules.find((rule) => rule.id === "R-004")?.status).toBe(
      "unverified"
    );
  });
});

describe("parseKontract", () => {
  it("throws a ZodError for a structurally invalid document", () => {
    expect(() => parseKontract("kontractVersion: 1\nmodule: x\n")).toThrow(ZodError);
  });

  it("throws a ZodError naming the offending path", () => {
    const yamlText = serializeKontract(document).replace("R-002", "RULE-002");

    try {
      parseKontract(yamlText);
      throw new Error("expected a ZodError");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect((error as ZodError).issues[0]?.path).toEqual(["rules", 1, "id"]);
    }
  });

  it("throws on YAML that is not a mapping", () => {
    expect(() => parseKontract("- just\n- a\n- list\n")).toThrow(ZodError);
  });
});

describe("serializeKontract", () => {
  it("refuses to serialize an invalid document", () => {
    const invalid = {
      ...document,
      rules: [{ ...document.rules[0]!, confidence: 5 }],
    } as KontractDocument;

    expect(() => serializeKontract(invalid)).toThrow(ZodError);
  });
});

describe("updateRuleStatuses", () => {
  it("stamps new statuses onto the named rules only", () => {
    const updated = updateRuleStatuses(serializeKontract(document), {
      "R-003": "verified",
      "R-004": "contradicted",
    });

    const parsed = parseKontract(updated);
    const byId = new Map(parsed.rules.map((rule) => [rule.id, rule.status]));

    expect(byId.get("R-003")).toBe("verified");
    expect(byId.get("R-004")).toBe("contradicted");
    // untouched
    expect(byId.get("R-001")).toBe("verified");
    expect(byId.get("R-002")).toBe("contradicted");
  });

  it("preserves human comments across a rewrite", () => {
    const annotated = serializeKontract(document).replace(
      "rules:",
      "# Reviewed by the compliance team 2026-07-20\nrules:"
    );

    const updated = updateRuleStatuses(annotated, { "R-003": "verified" });

    expect(updated).toContain("# Reviewed by the compliance team 2026-07-20");
    expect(parseKontract(updated).rules.find((r) => r.id === "R-003")?.status).toBe(
      "verified"
    );
  });

  it("ignores ids that are not in the document", () => {
    const yamlText = serializeKontract(document);

    expect(parseKontract(updateRuleStatuses(yamlText, { "R-999": "verified" }))).toEqual(
      parseKontract(yamlText)
    );
  });

  it("throws when the document has no rules sequence", () => {
    expect(() => updateRuleStatuses("kontractVersion: 1\n", {})).toThrow(
      /no `rules` sequence/
    );
  });
});
