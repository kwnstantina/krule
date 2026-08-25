import { describe, expect, it } from "vitest";
import type { KontractRule } from "@repo/kontract";
import { extractNumbers, windowAround } from "./evidence";
import { verifyRule } from "./verify";

function rule(overrides: Partial<KontractRule> = {}): KontractRule {
  return {
    id: "R-001",
    statement: "A claim above 10000 requires senior handler sign-off.",
    provenance: [{ file: "src/a.ts", line: 3, commit: "abc123" }],
    confidence: 0.9,
    origins: ["code"],
    status: "unverified",
    ...overrides,
  };
}

function files(
  entries: Record<string, string>,
): Map<string, { lines: string[] }> {
  return new Map(
    Object.entries(entries).map(([path, contents]) => [
      path,
      { lines: contents.split("\n") },
    ]),
  );
}

describe("extractNumbers", () => {
  it("normalises thousands separators so documentation matches code", () => {
    expect(extractNumbers("over £10,000 per claim")).toContain(10000);
  });

  it("ignores currency symbols and keeps the magnitude", () => {
    expect(extractNumbers("$2,500 and 45 days")).toEqual([45, 2500]);
  });

  it("reads a time as its hour, since the code compares an hour", () => {
    // Splitting 15:00 into {15, 0} made the stray 0 look like an unsupported
    // claim and marked correct cutoff rules as drifted.
    expect(extractNumbers("cutoff is 15:00")).toEqual([15]);
  });

  it("ignores digits inside a regex character class", () => {
    // A CHECK constraint like LIKE 'LEI-__-[0-9][0-9]' is pattern syntax. Read
    // as values it contributed 0 and 9, which made rules citing it contradicted.
    expect(extractNumbers("claim_ref LIKE 'LEI-__-[0-9][0-9]'")).toEqual([]);
  });

  it("keeps a real threshold that sits next to a character class", () => {
    expect(extractNumbers("CHECK (amount <= 250000 AND ref LIKE '[0-9]')")).toEqual(
      [250000],
    );
  });

  it("returns nothing for a purely qualitative statement", () => {
    expect(extractNumbers("a panel solicitor must be instructed")).toEqual([]);
  });
});

describe("windowAround", () => {
  it("includes the lines either side, so a comment above a check is seen", () => {
    const lines = ["one", "two", "three", "four", "five", "six", "seven"];
    // Line 4 (1-indexed) with radius 2 covers lines 2..6.
    expect(windowAround(lines, 4)).toBe("two\nthree\nfour\nfive\nsix");
  });

  it("clamps at the start of the file", () => {
    expect(windowAround(["a", "b"], 1)).toBe("a\nb");
  });
});

describe("verifyRule", () => {
  it("verifies a rule whose asserted value is at the cited line", () => {
    const verdict = verifyRule(
      rule(),
      files({ "src/a.ts": "x\ny\nif (v > 10000) {\nz" }),
    );
    expect(verdict.status).toBe("verified");
    expect(verdict.supported).toEqual([10000]);
  });

  it("reports drifted when the value moved away from the cited line", () => {
    // 10000 is in the file but 20 lines from the citation, outside the window.
    const contents = ["a", "b", "c", "d", "e", "f", "g", "if (v > 10000) {"];
    const verdict = verifyRule(
      rule({
        provenance: [{ file: "src/a.ts", line: 1, commit: "abc123" }],
      }),
      files({ "src/a.ts": contents.join("\n") }),
    );
    expect(verdict.status).toBe("drifted");
    expect(verdict.unsupported).toEqual([10000]);
  });

  it("reports drifted when the cited file no longer exists", () => {
    const verdict = verifyRule(rule(), files({}));
    expect(verdict.status).toBe("drifted");
    expect(verdict.reason).toContain("no longer exists");
  });

  it("reports unverified when the value appears nowhere in the source", () => {
    const verdict = verifyRule(
      rule(),
      files({ "src/a.ts": "x\ny\nif (v > 999) {\nz" }),
    );
    expect(verdict.status).toBe("unverified");
    expect(verdict.reason).toContain("does not appear");
  });

  it("reports unverified for a qualitative rule with nothing numeric to check", () => {
    const verdict = verifyRule(
      rule({ statement: "A panel solicitor must be instructed." }),
      files({ "src/a.ts": "x\ny\nusesPanelSolicitor\nz" }),
    );
    expect(verdict.status).toBe("unverified");
    expect(verdict.reason).toContain("no numeric claim");
  });

  it("reports contradicted when another cited source states a different value", () => {
    // This is the fixture's planted docs-versus-code disagreement: the code
    // applies a 45-day window, the wiki confidently says 30.
    const verdict = verifyRule(
      rule({
        statement:
          "A claim is rejected if the policy lapsed more than 45 days before the incident.",
        origins: ["code", "docs"],
        provenance: [
          { file: "src/a.ts", line: 2, commit: "abc123" },
          { file: "docs/wiki.md", line: 2, commit: "abc123" },
        ],
      }),
      files({
        "src/a.ts": "a\nif (lapsed > 45) {\nb",
        "docs/wiki.md": "x\nwe allow a 30 day grace window\ny",
      }),
    );
    expect(verdict.status).toBe("contradicted");
    expect(verdict.supported).toEqual([45]);
    expect(verdict.conflicting.map((c) => c.value)).toContain(30);
    expect(verdict.reason).toContain("docs/wiki.md");
  });

  it("does not cry contradiction over unrelated numbers in the same file", () => {
    // Two citations into one file: neighbouring lines are full of incidental
    // numbers, and treating those as disagreement would make every rule a
    // contradiction. Only a *different* file counts.
    const verdict = verifyRule(
      rule({
        provenance: [
          { file: "src/a.ts", line: 2, commit: "abc123" },
          { file: "src/a.ts", line: 3, commit: "abc123" },
        ],
      }),
      files({ "src/a.ts": "a\nif (v > 10000) {\nconst t = 750;\nb" }),
    );
    expect(verdict.status).toBe("verified");
    expect(verdict.conflicting).toEqual([]);
  });
});
