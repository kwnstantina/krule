import { describe, expect, it } from "vitest";
import type { KontractDocument, KontractRule } from "@repo/kontract";
import type { Judge } from "./judge";
import { candidatePairs, citationDistance, LINE_TOLERANCE } from "./pairing";
import { renderScoreReport } from "./report";
import { scoreKontract } from "./score";

function rule(
  id: string,
  statement: string,
  file: string,
  line: number,
  classification?: string,
): KontractRule {
  return {
    id,
    statement,
    provenance: [{ file, line, commit: "c" }],
    confidence: 1,
    origins: ["code"],
    status: "unverified",
    tags: classification ? [`class:${classification}`, "difficulty:easy"] : [],
  };
}

function doc(rules: KontractRule[]): KontractDocument {
  return {
    kontractVersion: 1,
    module: "m",
    generatedAt: "2026-01-01T00:00:00.000Z",
    commit: "c",
    rules,
  };
}

/** Equivalent iff the statements are identical — isolates scoring from judging. */
const exactJudge: Judge = {
  name: "exact",
  async equivalent(a, b) {
    return { equivalent: a === b, reason: a === b ? "same" : "different" };
  },
};

const KEY = doc([
  rule("R-001", "Claims above 10000 need senior sign-off.", "a.ts", 10, "normal"),
  rule("R-002", "Counsel fees are capped at 3500.", "b.ts", 20, "dark-logic"),
  rule("R-003", "Provisional cover lasts 14 days.", "wiki.md", 5, "dead-rule"),
  rule("R-004", "Lapse window is 45 days.", "a.ts", 40, "contradiction"),
]);

describe("pairing", () => {
  it("treats overlapping ranges as distance 0 and ignores other files", () => {
    expect(
      citationDistance(
        { file: "a.ts", line: 10, endLine: 15, commit: "c" },
        { file: "a.ts", line: 12, commit: "c" },
      ),
    ).toBe(0);
    expect(
      citationDistance(
        { file: "a.ts", line: 10, commit: "c" },
        { file: "b.ts", line: 10, commit: "c" },
      ),
    ).toBeNull();
  });

  it("pairs inside the tolerance and not outside it", () => {
    const key = [rule("R-001", "x".repeat(10), "a.ts", 10)];
    const offByTwo = [rule("R-100", "y".repeat(10), "a.ts", 12)];
    const offByTen = [rule("R-100", "y".repeat(10), "a.ts", 20)];
    expect(candidatePairs(offByTwo, key)).toHaveLength(1);
    expect(LINE_TOLERANCE).toBeLessThan(10);
    expect(candidatePairs(offByTen, key)).toHaveLength(0);
  });

  it("orders contested candidates tightest first", () => {
    const key = [
      rule("R-001", "x".repeat(10), "a.ts", 117),
      rule("R-002", "x".repeat(10), "a.ts", 118),
    ];
    const found = [rule("R-100", "y".repeat(10), "a.ts", 118)];
    const candidates = candidatePairs(found, key);
    expect(candidates.map((c) => c.keyId)).toEqual(["R-002", "R-001"]);
  });
});

describe("scoring", () => {
  it("scores a perfect extraction as 1/1 and passing", async () => {
    const found = doc(
      KEY.rules.map((r, i) => ({ ...r, id: `R-${100 + i}`, tags: [] })),
    );
    const result = await scoreKontract(found, KEY, exactJudge);
    expect(result.precision).toBe(1);
    expect(result.recall).toBe(1);
    expect(result.meetsThreshold).toBe(true);
    expect(result.byClass["dark-logic"]).toEqual({ total: 1, found: 1, recall: 1 });
  });

  it("scores an empty extraction as recall 0", async () => {
    const result = await scoreKontract(doc([]), KEY, exactJudge);
    expect(result.recall).toBe(0);
    expect(result.precision).toBe(0);
    expect(result.missed).toHaveLength(4);
    expect(result.meetsThreshold).toBe(false);
  });

  it("gives partial credit and reports recall per classification", async () => {
    const found = doc([
      rule("R-100", "Claims above 10000 need senior sign-off.", "a.ts", 11),
      rule("R-101", "Something the key does not contain.", "z.ts", 1),
    ]);
    const result = await scoreKontract(found, KEY, exactJudge);
    expect(result.truePositives).toBe(1);
    expect(result.recall).toBe(0.25);
    expect(result.precision).toBe(0.5);
    expect(result.byClass.normal.recall).toBe(1);
    expect(result.byClass["dark-logic"].recall).toBe(0);
    expect(result.unmatched.map((r) => r.id)).toEqual(["R-101"]);
  });

  it("counts right-place-wrong-rule as both a false positive and a false negative", async () => {
    const found = doc([
      rule("R-100", "Claims above 99999 need senior sign-off.", "a.ts", 10),
    ]);
    const result = await scoreKontract(found, KEY, exactJudge);
    expect(result.truePositives).toBe(0);
    expect(result.falsePositives).toBe(1);
    expect(result.missed.map((r) => r.id)).toContain("R-001");
    expect(result.misdescribed).toEqual([
      { discoveredId: "R-100", keyIds: ["R-001"], reasons: ["different"] },
    ]);
    expect(result.unmatched).toHaveLength(0);
  });

  it("lets the judge settle a contested location instead of the nearest line", async () => {
    const key = doc([
      rule("R-010", "DAS claims are exempt from the panel requirement.", "a.ts", 117),
      rule("R-011", "Non-DAS claims above 2500 need a panel solicitor.", "a.ts", 118),
    ]);
    // Cited on R-011's line, but it describes R-010.
    const found = doc([
      rule("R-100", "DAS claims are exempt from the panel requirement.", "a.ts", 118),
    ]);
    const result = await scoreKontract(found, key, exactJudge);
    expect(result.matches.map((m) => m.keyId)).toEqual(["R-010"]);
    expect(result.misdescribed).toHaveLength(0);
  });

  it("consumes each rule at most once", async () => {
    const duplicate = "Claims above 10000 need senior sign-off.";
    const found = doc([
      rule("R-100", duplicate, "a.ts", 10),
      rule("R-101", duplicate, "a.ts", 10),
    ]);
    const result = await scoreKontract(found, KEY, exactJudge);
    expect(result.truePositives).toBe(1);
    expect(result.falsePositives).toBe(1);
  });

  it("renders a report that lists every miss by id", async () => {
    const result = await scoreKontract(doc([]), KEY, exactJudge);
    const text = renderScoreReport(result);
    expect(text).toContain("BELOW TARGET");
    for (const id of ["R-001", "R-002", "R-003", "R-004"]) {
      expect(text).toContain(id);
    }
  });
});
