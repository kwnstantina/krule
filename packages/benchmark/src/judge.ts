import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { z } from "zod";
import type { LlmProvider } from "@repo/llm";

export interface Verdict {
  equivalent: boolean;
  reason: string;
}

/**
 * Decides whether a discovered statement describes the same business rule as an
 * answer-key statement.
 *
 * `name` goes into the cache key, so a placeholder judge's verdicts can never be
 * replayed as if a real one had made them.
 */
export interface Judge {
  readonly name: string;
  equivalent(discoveredStatement: string, keyStatement: string): Promise<Verdict>;
}

interface CachedVerdict extends Verdict {
  judge: string;
  discovered: string;
  key: string;
}

/** Stable, order-fixed key over the judge and the two statements. */
export function verdictKey(
  judgeName: string,
  discoveredStatement: string,
  keyStatement: string,
): string {
  return createHash("sha256")
    .update(JSON.stringify([judgeName, discoveredStatement, keyStatement]))
    .digest("hex");
}

/**
 * Wraps a judge so every verdict is recorded to a checked-in JSON file and
 * replayed on later runs.
 *
 * This is what makes the benchmark reproducible: a rerun over the same
 * extraction makes zero judge calls and produces the same score, and a human can
 * open the file and audit every judgement it rests on. Entries carry both
 * statements for that reason, and are sorted by key on write so diffs stay
 * reviewable.
 */
export function createCachedJudge(inner: Judge, cachePath: string): Judge {
  let cache: Record<string, CachedVerdict> | null = null;

  async function load(): Promise<Record<string, CachedVerdict>> {
    if (cache !== null) return cache;
    try {
      cache = JSON.parse(await readFile(cachePath, "utf8")) as Record<
        string,
        CachedVerdict
      >;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      cache = {};
    }
    return cache;
  }

  async function persist(entries: Record<string, CachedVerdict>): Promise<void> {
    const sorted = Object.fromEntries(
      Object.keys(entries)
        .sort()
        .map((key) => [key, entries[key]]),
    );
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(cachePath, JSON.stringify(sorted, null, 2) + "\n", "utf8");
  }

  return {
    name: inner.name,
    async equivalent(discoveredStatement, keyStatement) {
      const entries = await load();
      const key = verdictKey(inner.name, discoveredStatement, keyStatement);
      const hit = entries[key];
      if (hit !== undefined) {
        return { equivalent: hit.equivalent, reason: hit.reason };
      }

      const verdict = await inner.equivalent(discoveredStatement, keyStatement);
      entries[key] = {
        judge: inner.name,
        discovered: discoveredStatement,
        key: keyStatement,
        equivalent: verdict.equivalent,
        reason: verdict.reason,
      };
      await persist(entries);
      return verdict;
    },
  };
}

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being", "and",
  "or", "of", "to", "in", "on", "at", "for", "with", "by", "from", "that",
  "this", "it", "its", "as", "not", "no", "any", "all", "every", "must",
  "may", "can", "has", "have", "had", "does", "do", "than", "then", "when",
  "where", "which", "who", "whose", "what", "if", "so", "but", "also",
]);

function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    // Drop thousands separators so "10,000" and "10000" are the same token.
    .replace(/(\d),(\d)/g, "$1$2")
    .replace(/[^a-z0-9\s.]/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/\.$/, ""))
    // Short numbers ("45 days", "12:00") are the most important tokens, so the
    // length floor applies to words only.
    .filter(
      (word) => /\d/.test(word) || (word.length > 2 && !STOPWORDS.has(word)),
    );
  return new Set(words);
}

/**
 * Overlap of `key`'s significant terms found in `discovered`, with numbers
 * weighted double — "45 days" versus "30 days" is the whole finding in most of
 * these rules, so a shared threshold is stronger evidence than a shared noun.
 */
export function termOverlap(discovered: string, key: string): number {
  const found = tokenize(discovered);
  const expected = tokenize(key);
  if (found.size === 0 || expected.size === 0) return 0;

  let score = 0;
  let weight = 0;
  for (const token of expected) {
    const w = /\d/.test(token) ? 2 : 1;
    weight += w;
    if (found.has(token)) score += w;
  }
  return score / weight;
}

export const DETERMINISTIC_THRESHOLD = 0.34;

/**
 * Offline placeholder judge: significant-term overlap above a threshold.
 *
 * It is a placeholder, not a measurement. It under-credits paraphrase ("needs a
 * senior's approval" versus "requires senior handler sign-off") and can be
 * fooled by keyword stuffing, so a score produced with it is a smoke test. Use
 * the Claude judge for any figure you intend to quote.
 */
export const deterministicJudge: Judge = {
  name: "deterministic-v1",
  async equivalent(discoveredStatement, keyStatement) {
    // A value the key states but the extraction lacks makes it a different
    // rule however many words they share.
    const found = tokenize(discoveredStatement);
    const missingNumber = [...tokenize(keyStatement)].find(
      (token) => /\d/.test(token) && !found.has(token),
    );
    if (missingNumber !== undefined) {
      return { equivalent: false, reason: `missing value ${missingNumber}` };
    }

    const overlap = termOverlap(discoveredStatement, keyStatement);
    const equivalent = overlap >= DETERMINISTIC_THRESHOLD;
    return {
      equivalent,
      reason: `term overlap ${overlap.toFixed(2)} ${equivalent ? ">=" : "<"} ${DETERMINISTIC_THRESHOLD}`,
    };
  },
};

const VerdictSchema = z.object({
  equivalent: z.boolean(),
  reason: z.string(),
});

const VERDICT_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    equivalent: { type: "boolean" },
    reason: { type: "string" },
  },
  required: ["equivalent", "reason"],
  additionalProperties: false,
};

const JUDGE_SYSTEM_PROMPT = `You grade a business-rule extraction tool against a hand-written answer key for a legacy insurance claims system.

You will see one rule the tool extracted and one rule from the answer key. Decide whether they describe the same business rule: the same condition leading to the same outcome, with the same values.

Wording does not matter. "Requires senior handler sign-off" and "needs approval from a senior handler" are the same. Extra detail in the extracted rule is fine, including notes about which source disagrees with which, as long as the core rule matches.

Values do matter. A different threshold, currency, time window, status code, market or exemption makes it a different rule, even when the subject is the same. If the extracted rule covers the answer-key rule only partially, or describes a neighbouring rule on the same topic, it is not equivalent.

Give a one-sentence reason.`;

/**
 * Stands in for the large cached corpus slot every request has. It must be
 * non-empty, and keeping the rubric here rather than per call means repeated
 * judgements pay only for the two statements.
 */
const JUDGE_RUBRIC = `Grading scale: equivalent = true only when an auditor would accept the extracted rule as a correct description of the answer-key rule.`;

/**
 * The real judge: Claude, through the same provider seam extraction uses, so it
 * runs wherever extraction runs (Anthropic, Bedrock, Vertex) and its responses
 * are replayable offline by the recorded provider.
 */
export function createClaudeJudge(provider: LlmProvider): Judge {
  return {
    name: "claude-v1",
    async equivalent(discoveredStatement, keyStatement) {
      const result = await provider.complete({
        system: JUDGE_SYSTEM_PROMPT,
        corpus: JUDGE_RUBRIC,
        task: `Extracted rule:\n${discoveredStatement}\n\nAnswer-key rule:\n${keyStatement}`,
        jsonSchema: VERDICT_JSON_SCHEMA,
        schema: VerdictSchema,
        schemaName: "judge-verdict-v1",
        effort: "medium",
        maxTokens: 8000,
      });
      return result.data;
    },
  };
}
