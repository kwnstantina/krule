import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { CompletionRequest, CompletionResult, LlmProvider } from "@repo/llm";
import { EMPTY_USAGE } from "@repo/llm";
import {
  createCachedJudge,
  createClaudeJudge,
  deterministicJudge,
  verdictKey,
  type Judge,
} from "./judge";

function countingJudge(): Judge & { calls: number } {
  const judge = {
    name: "counting",
    calls: 0,
    async equivalent(a: string, b: string) {
      judge.calls += 1;
      return { equivalent: a.length === b.length, reason: "length" };
    },
  };
  return judge;
}

async function tempCache(): Promise<string> {
  return join(await mkdtemp(join(tmpdir(), "krule-verdicts-")), "v.json");
}

describe("cached judge", () => {
  it("records a verdict on a miss and replays it without calling the inner judge", async () => {
    const path = await tempCache();
    const first = countingJudge();
    await createCachedJudge(first, path).equivalent("abc", "xyz");
    expect(first.calls).toBe(1);

    const second = countingJudge();
    const verdict = await createCachedJudge(second, path).equivalent("abc", "xyz");
    expect(second.calls).toBe(0);
    expect(verdict).toEqual({ equivalent: true, reason: "length" });
  });

  it("keys verdicts by judge name, so a placeholder never answers for a real judge", async () => {
    expect(verdictKey("a", "x", "y")).not.toBe(verdictKey("b", "x", "y"));
    expect(verdictKey("a", "x", "y")).not.toBe(verdictKey("a", "y", "x"));
  });

  it("writes byte-identical, key-sorted output regardless of call order", async () => {
    const pairs: Array<[string, string]> = [
      ["one", "two"],
      ["three", "four"],
      ["five", "six"],
    ];
    const forward = await tempCache();
    const backward = await tempCache();
    for (const [a, b] of pairs) {
      await createCachedJudge(countingJudge(), forward).equivalent(a, b);
    }
    const reversedJudge = createCachedJudge(countingJudge(), backward);
    for (const [a, b] of [...pairs].reverse()) {
      await reversedJudge.equivalent(a, b);
    }
    const text = await readFile(forward, "utf8");
    expect(text).toBe(await readFile(backward, "utf8"));
    const keys = Object.keys(JSON.parse(text) as object);
    expect(keys).toEqual([...keys].sort());
  });

  it("starts from a seeded empty cache file", async () => {
    const path = await tempCache();
    await writeFile(path, "{}\n", "utf8");
    const inner = countingJudge();
    await createCachedJudge(inner, path).equivalent("a", "b");
    expect(inner.calls).toBe(1);
  });
});

describe("deterministic judge", () => {
  it("accepts a reworded statement that keeps the threshold", async () => {
    const verdict = await deterministicJudge.equivalent(
      "Claims over £10,000 need sign-off from a senior handler.",
      "A claim with a settlement estimate above £10,000 requires senior handler sign-off.",
    );
    expect(verdict.equivalent).toBe(true);
  });

  it("rejects the same topic with a different threshold", async () => {
    const verdict = await deterministicJudge.equivalent(
      "Policies lapsed for more than 30 days block a claim.",
      "A claim is rejected if the policy lapsed more than 45 days before the incident date.",
    );
    expect(verdict.equivalent).toBe(false);
  });
});

describe("claude judge", () => {
  it("sends both statements through the provider seam and returns its verdict", async () => {
    let seen: CompletionRequest<unknown> | null = null;
    const provider: LlmProvider = {
      name: "stub",
      async complete<T>(request: CompletionRequest<T>): Promise<CompletionResult<T>> {
        seen = request as CompletionRequest<unknown>;
        return {
          data: request.schema.parse({ equivalent: false, reason: "45 vs 30" }),
          usage: EMPTY_USAGE,
          model: "stub",
          provider: "stub",
        };
      },
    };
    const verdict = await createClaudeJudge(provider).equivalent("left rule", "right rule");
    expect(verdict).toEqual({ equivalent: false, reason: "45 vs 30" });
    expect(seen!.task).toContain("left rule");
    expect(seen!.task).toContain("right rule");
    expect(seen!.corpus.length).toBeGreaterThan(0);
  });
});
