import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { discoverModule } from "@repo/discover";
import { readKontractFile, serializeKontract } from "@repo/kontract";
import type { CompletionRequest, CompletionResult, LlmProvider } from "@repo/llm";
import { EMPTY_USAGE } from "@repo/llm";
import { renderReport } from "@repo/report";
import { toStatusMap, verifyDocument } from "@repo/verify";
import { parsePlanted, scoreAgainstPlanted, similarity } from "./score";

const FIXTURE = join(__dirname, "..", "..", "..", "fixtures", "legacy-claims");

/**
 * A provider that returns a fixed, hand-written result.
 *
 * This is how the pipeline is tested without a network call or an API key. It is
 * deliberately *not* committed as a recorded cache entry — a cache file would be
 * replayed by `krule discover` and presented as extraction output, and these
 * three rules are authored by hand, not extracted by a model.
 */
class StubProvider implements LlmProvider {
  readonly name = "stub";
  lastRequest: CompletionRequest<unknown> | null = null;

  constructor(private readonly rules: unknown[]) {}

  async complete<T>(
    request: CompletionRequest<T>,
  ): Promise<CompletionResult<T>> {
    this.lastRequest = request as CompletionRequest<unknown>;
    return {
      data: request.schema.parse({ rules: this.rules }),
      usage: EMPTY_USAGE,
      model: "stub",
      provider: this.name,
    };
  }
}

const STUB_RULES = [
  {
    // Matches the fixture's planted docs-vs-code lapse-window disagreement.
    statement:
      "A claim is rejected if the policy lapsed more than 45 days before the incident date.",
    provenance: [
      { file: "src/authorise-claim.ts", line: 62 },
      { file: "docs/underwriting-wiki.md", line: 14 },
    ],
    confidence: 0.95,
    origins: ["code", "docs"],
    notes: "The wiki states 30 days; the code applies 45.",
  },
  {
    // Code-only: should land in Dark Logic.
    statement:
      "Counsel fees are capped at 3500 per disbursement and the handler is not told.",
    provenance: [{ file: "src/disbursements.ts", line: 46 }],
    confidence: 0.8,
    origins: ["code"],
  },
  {
    // Docs-only: should land in Dead Rules.
    statement:
      "Provisional cover may be granted for 14 days pending confirmation of cover.",
    provenance: [{ file: "docs/underwriting-wiki.md", line: 49 }],
    confidence: 0.6,
    origins: ["docs"],
  },
];

describe("discover", () => {
  it("ingests every origin from the fixture and numbers the corpus lines", async () => {
    const provider = new StubProvider(STUB_RULES);
    const result = await discoverModule({
      modulePath: FIXTURE,
      provider,
      commit: "testcommit",
    });

    const origins = new Set(result.corpus.files.map((file) => file.origin));
    expect(origins).toEqual(new Set(["code", "schema", "data", "docs"]));

    // The answer key must never reach the model.
    expect(
      result.corpus.files.some((file) => file.path.includes("PLANTED")),
    ).toBe(false);
    expect(provider.lastRequest?.corpus).not.toContain("PLANTED");

    // Line numbers are what make provenance citable.
    expect(provider.lastRequest?.corpus).toContain("  62 |");
  });

  it("assigns R-<digits> ids in confidence order and stamps the commit", async () => {
    const result = await discoverModule({
      modulePath: FIXTURE,
      provider: new StubProvider(STUB_RULES),
      commit: "testcommit",
    });

    expect(result.document.rules.map((rule) => rule.id)).toEqual([
      "R-001",
      "R-002",
      "R-003",
    ]);
    expect(result.document.rules[0]?.confidence).toBe(0.95);
    expect(result.document.rules[0]?.provenance[0]?.commit).toBe("testcommit");
    // Nothing is trusted until Verify says so.
    expect(
      result.document.rules.every((rule) => rule.status === "unverified"),
    ).toBe(true);
  });

  it("drops a rule that cites a line beyond the end of the file", async () => {
    const result = await discoverModule({
      modulePath: FIXTURE,
      provider: new StubProvider([
        {
          statement: "A hallucinated rule citing a line that does not exist.",
          provenance: [{ file: "src/authorise-claim.ts", line: 99999 }],
          confidence: 0.9,
          origins: ["code"],
        },
      ]),
      commit: "testcommit",
    });

    expect(result.document.rules).toHaveLength(0);
    expect(result.droppedRules[0]?.reason).toContain("only");
  });
});

describe("verify against the real fixture", () => {
  it("finds the planted contradiction and confirms the code-only cap", async () => {
    const { document } = await discoverModule({
      modulePath: FIXTURE,
      provider: new StubProvider(STUB_RULES),
      commit: "testcommit",
    });

    const result = await verifyDocument(document, FIXTURE);
    const byId = new Map(result.verdicts.map((v) => [v.id, v]));

    // R-001: code says 45, the wiki says 30 — a real contradiction, read off
    // the actual committed fixture rather than a mock.
    expect(byId.get("R-001")?.status).toBe("contradicted");
    expect(byId.get("R-001")?.reason).toContain("30");

    // R-002: 3500 really is at disbursements.ts:46.
    expect(byId.get("R-002")?.status).toBe("verified");

    expect(toStatusMap(result)["R-001"]).toBe("contradicted");
  });
});

describe("report", () => {
  it("routes rules into the brief's four sections", async () => {
    const { document } = await discoverModule({
      modulePath: FIXTURE,
      provider: new StubProvider(STUB_RULES),
      commit: "testcommit",
    });
    const verification = await verifyDocument(document, FIXTURE);
    const html = renderReport({
      document,
      verdicts: verification.verdicts,
    });

    for (const heading of [
      "Rule inventory",
      "Contradiction report",
      "Dark logic",
      "Dead rules",
    ]) {
      expect(html).toContain(heading);
    }

    // Self-contained: no external requests of any kind.
    expect(html).not.toMatch(/https?:\/\//);
    expect(html).not.toContain("<script");

    // The counsel-fee cap is code-only, so it belongs to Dark Logic; the
    // provisional-cover rule is docs-only, so it belongs to Dead Rules.
    const darkIndex = html.indexOf("Dark logic");
    const deadIndex = html.indexOf("Dead rules");
    expect(html.indexOf("Counsel fees", darkIndex)).toBeLessThan(deadIndex);
    expect(html.indexOf("Provisional cover", deadIndex)).toBeGreaterThan(-1);
  });

  it("escapes rule text rather than interpolating it into markup", async () => {
    const { document } = await discoverModule({
      modulePath: FIXTURE,
      provider: new StubProvider([
        {
          statement: "A rule mentioning <script>alert(1)</script> and quotes.",
          provenance: [{ file: "src/authorise-claim.ts", line: 10 }],
          confidence: 0.5,
          origins: ["code"],
        },
      ]),
      commit: "testcommit",
    });

    const html = renderReport({ document });
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>alert");
  });
});

describe("kontract round trip through the CLI's artifacts", () => {
  it("writes a kontract that reads back identically", async () => {
    const { document } = await discoverModule({
      modulePath: FIXTURE,
      provider: new StubProvider(STUB_RULES),
      commit: "testcommit",
    });

    const dir = await mkdtemp(join(tmpdir(), "krule-test-"));
    const path = join(dir, "rules.kontract.yaml");
    await writeFile(path, serializeKontract(document), "utf8");

    const reloaded = await readKontractFile(path);
    expect(reloaded.rules).toEqual(document.rules);
    expect(reloaded.commit).toBe("testcommit");
  });
});

describe("scoring against PLANTED.md", () => {
  it("parses all 30 planted rules out of the committed answer key", async () => {
    const markdown = await readFile(join(FIXTURE, "PLANTED.md"), "utf8");
    const planted = parsePlanted(markdown);
    expect(planted).toHaveLength(30);
    expect(planted[0]?.id).toBe("R-001");
    expect(planted.some((rule) => rule.classification === "dark-logic")).toBe(
      true,
    );
  });

  it("weights shared numbers above shared words when matching statements", () => {
    const planted = "A claim above 10000 requires senior handler sign-off.";
    const sameThreshold = "Claims over 10000 need sign-off from a senior handler.";
    const differentThreshold =
      "Claims over 99999 need sign-off from a senior handler.";
    expect(similarity(planted, sameThreshold)).toBeGreaterThan(
      similarity(planted, differentThreshold),
    );
  });

  it("counts a planted rule as found only when something matches it", async () => {
    const markdown = await readFile(join(FIXTURE, "PLANTED.md"), "utf8");
    const planted = parsePlanted(markdown);
    const { document } = await discoverModule({
      modulePath: FIXTURE,
      provider: new StubProvider(STUB_RULES),
      commit: "testcommit",
    });

    const score = scoreAgainstPlanted(document, planted);
    expect(score.planted).toBe(30);
    // Three hand-written rules cannot cover thirty planted ones; the point is
    // that the scorer reports honestly rather than flattering the extractor.
    expect(score.matched).toBeGreaterThan(0);
    expect(score.matched).toBeLessThan(10);
    expect(score.recall).toBeLessThan(0.8);
    expect(score.missed.length).toBe(30 - score.matched);
  });
});
