import { describe, expect, it } from "vitest";
import type { KontractDocument, KontractRule } from "@repo/kontract";
import { renderReport } from "./render";
import { buildSections, isDarkLogic, isDeadRule } from "./sections";

function rule(overrides: Partial<KontractRule> = {}): KontractRule {
  return {
    id: "R-001",
    statement: "A claim above 10000 requires senior handler sign-off.",
    provenance: [{ file: "src/a.ts", line: 93, commit: "abc123" }],
    confidence: 0.9,
    origins: ["code"],
    status: "unverified",
    ...overrides,
  };
}

function doc(rules: KontractRule[]): KontractDocument {
  return {
    kontractVersion: 1,
    module: "legacy-claims",
    generatedAt: "2026-08-25T09:00:00.000Z",
    commit: "abcdef1234567890",
    rules,
  };
}

describe("isDarkLogic", () => {
  it("is true for an implemented rule the docs never mention", () => {
    expect(isDarkLogic(rule({ origins: ["code"] }))).toBe(true);
    expect(isDarkLogic(rule({ origins: ["schema"] }))).toBe(true);
    expect(isDarkLogic(rule({ origins: ["code", "data"] }))).toBe(true);
  });

  it("is false as soon as the documentation mentions it", () => {
    expect(isDarkLogic(rule({ origins: ["code", "docs"] }))).toBe(false);
  });

  it("is false for a documentation-only rule", () => {
    expect(isDarkLogic(rule({ origins: ["docs"] }))).toBe(false);
  });
});

describe("isDeadRule", () => {
  it("is true only when documentation is the sole origin", () => {
    expect(isDeadRule(rule({ origins: ["docs"] }))).toBe(true);
    expect(isDeadRule(rule({ origins: ["docs", "code"] }))).toBe(false);
    expect(isDeadRule(rule({ origins: ["code"] }))).toBe(false);
  });
});

describe("buildSections", () => {
  it("prefers this run's verdict over the status stored on disk", () => {
    // A report rendered straight after verify must show what verify concluded,
    // even when the kontract on disk has not been rewritten yet.
    const sections = buildSections(
      doc([rule({ status: "unverified" })]),
      [{ id: "R-001", status: "contradicted", reason: "docs say 30" }],
    );
    expect(sections.counts.contradicted).toBe(1);
    expect(sections.counts.unverified).toBe(0);
    expect(sections.contradictions).toHaveLength(1);
  });

  it("falls back to the stored status when there are no verdicts", () => {
    const sections = buildSections(doc([rule({ status: "verified" })]));
    expect(sections.counts.verified).toBe(1);
    expect(sections.contradictions).toHaveLength(0);
  });
});

describe("renderReport", () => {
  it("emits a self-contained document with no external requests", () => {
    const html = renderReport({ document: doc([rule()]) });
    expect(html).toMatch(/^<!doctype html>/);
    expect(html).not.toMatch(/https?:\/\//);
    expect(html).not.toContain("<script");
    expect(html).not.toContain("@import");
  });

  it("renders all four sections even when they are empty", () => {
    const html = renderReport({ document: doc([]) });
    expect(html).toContain("Rule inventory");
    expect(html).toContain("Contradiction report");
    expect(html).toContain("Dark logic");
    expect(html).toContain("Dead rules");
    expect(html).toContain("No contradictions found");
  });

  it("supports both colour schemes so it is readable either way", () => {
    const html = renderReport({ document: doc([rule()]) });
    expect(html).toContain("prefers-color-scheme: dark");
    expect(html).toContain('[data-theme="dark"]');
  });

  it("includes print styles, because auditors print reports", () => {
    const html = renderReport({ document: doc([rule()]) });
    expect(html).toContain("@media print");
    expect(html).toContain("break-inside: avoid");
  });

  it("escapes statements rather than trusting them as markup", () => {
    const html = renderReport({
      document: doc([
        rule({ statement: 'A rule with <b>tags</b> & "quotes" in it.' }),
      ]),
    });
    expect(html).toContain("&lt;b&gt;");
    expect(html).toContain("&amp;");
    expect(html).not.toContain("<b>tags</b>");
  });

  it("shows the citation so a reader can check the claim", () => {
    const html = renderReport({ document: doc([rule()]) });
    expect(html).toContain("src/a.ts:93");
  });

  it("renders a range citation with both ends", () => {
    const html = renderReport({
      document: doc([
        rule({
          provenance: [
            { file: "src/a.ts", line: 10, endLine: 14, commit: "abc123" },
          ],
        }),
      ]),
    });
    expect(html).toContain("src/a.ts:10-14");
  });

  it("states plainly what a verified verdict does and does not prove", () => {
    // The report is the artifact someone acts on, so the limits of the check
    // belong on the page rather than only in the code.
    const html = renderReport({ document: doc([rule()]) });
    expect(html).toContain("not proof the code path executes");
  });
});
