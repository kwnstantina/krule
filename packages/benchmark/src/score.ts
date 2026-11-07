import type { KontractDocument, KontractRule } from "@repo/kontract";
import type { Judge } from "./judge";
import { candidatePairs, LINE_TOLERANCE } from "./pairing";
import {
  CLASS_TAG_PREFIX,
  CLASSIFICATIONS,
  DIFFICULTY_TAG_PREFIX,
  tagValue,
  type Classification,
} from "./planted";

/** The brief's acceptance bar: extraction must recover 80% of the key. */
export const PASS_THRESHOLD = 0.8;

export interface Match {
  discoveredId: string;
  keyId: string;
  distance: number;
  reason: string;
}

/**
 * A discovered rule that cited the right place but was judged to describe a
 * different rule there.
 */
export interface Misdescription {
  discoveredId: string;
  keyIds: string[];
  reasons: string[];
}

export interface ClassBreakdown {
  total: number;
  found: number;
  recall: number;
}

export interface ScoreResult {
  judge: string;
  keyCount: number;
  discoveredCount: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1: number;
  meetsThreshold: boolean;
  /**
   * Recall per planted classification. This matters more than the headline:
   * 85% overall while missing every dark-logic rule would mean the tool fails at
   * the thing it is sold for.
   */
  byClass: Record<Classification, ClassBreakdown>;
  matches: Match[];
  /** Key rules nothing matched — the actionable list for prompt work. */
  missed: KontractRule[];
  /** Discovered rules with no match at all. */
  unmatched: KontractRule[];
  misdescribed: Misdescription[];
}

function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Scores a discovered kontract against an answer key.
 *
 * Provenance proposes, the judge disposes: candidate pairs within
 * `LINE_TOLERANCE` are tried tightest-first, and a pair only counts once the
 * judge agrees the two statements are the same rule. Each rule on either side is
 * consumed at most once.
 *
 * A discovered rule that cited the right location but was rejected for every key
 * rule there counts as **both** a false positive and (through the key rule left
 * unmatched) a false negative. That is deliberate: finding the right line and
 * then describing the wrong rule is worse than silence in an audit artifact,
 * because a reader will trust it.
 *
 * Precision is reported with a caveat the report states: an unmatched discovered
 * rule may be a real rule the fixture author did not plant, which only a human
 * reading the miss list can tell.
 */
export async function scoreKontract(
  discovered: KontractDocument,
  key: KontractDocument,
  judge: Judge,
  tolerance: number = LINE_TOLERANCE,
): Promise<ScoreResult> {
  const discoveredById = new Map(discovered.rules.map((rule) => [rule.id, rule]));
  const keyById = new Map(key.rules.map((rule) => [rule.id, rule]));

  const usedDiscovered = new Set<string>();
  const usedKey = new Set<string>();
  const matches: Match[] = [];
  const rejections = new Map<string, Misdescription>();

  for (const candidate of candidatePairs(discovered.rules, key.rules, tolerance)) {
    if (usedDiscovered.has(candidate.discoveredId)) continue;
    if (usedKey.has(candidate.keyId)) continue;

    const found = discoveredById.get(candidate.discoveredId) as KontractRule;
    const expected = keyById.get(candidate.keyId) as KontractRule;
    const verdict = await judge.equivalent(found.statement, expected.statement);

    if (verdict.equivalent) {
      usedDiscovered.add(candidate.discoveredId);
      usedKey.add(candidate.keyId);
      matches.push({ ...candidate, reason: verdict.reason });
      rejections.delete(candidate.discoveredId);
    } else {
      const entry = rejections.get(candidate.discoveredId) ?? {
        discoveredId: candidate.discoveredId,
        keyIds: [],
        reasons: [],
      };
      entry.keyIds.push(candidate.keyId);
      entry.reasons.push(verdict.reason);
      rejections.set(candidate.discoveredId, entry);
    }
  }

  const misdescribed = [...rejections.values()].filter(
    (entry) => !usedDiscovered.has(entry.discoveredId),
  );
  const misdescribedIds = new Set(misdescribed.map((entry) => entry.discoveredId));
  const missed = key.rules.filter((rule) => !usedKey.has(rule.id));
  const unmatched = discovered.rules.filter(
    (rule) => !usedDiscovered.has(rule.id) && !misdescribedIds.has(rule.id),
  );

  const truePositives = matches.length;
  const falsePositives = discovered.rules.length - truePositives;
  const falseNegatives = missed.length;
  const precision = ratio(truePositives, discovered.rules.length);
  const recall = ratio(truePositives, key.rules.length);
  const f1 = ratio(2 * precision * recall, precision + recall);

  const byClass = Object.fromEntries(
    CLASSIFICATIONS.map((classification) => {
      const inClass = key.rules.filter(
        (rule) => tagValue(rule, CLASS_TAG_PREFIX) === classification,
      );
      const found = inClass.filter((rule) => usedKey.has(rule.id)).length;
      return [
        classification,
        { total: inClass.length, found, recall: ratio(found, inClass.length) },
      ];
    }),
  ) as Record<Classification, ClassBreakdown>;

  return {
    judge: judge.name,
    keyCount: key.rules.length,
    discoveredCount: discovered.rules.length,
    truePositives,
    falsePositives,
    falseNegatives,
    precision,
    recall,
    f1,
    meetsThreshold: recall >= PASS_THRESHOLD,
    byClass,
    matches,
    missed,
    unmatched,
    misdescribed,
  };
}

/** Difficulty tag of a key rule, for the miss list. */
export function difficultyOf(rule: KontractRule): string {
  return tagValue(rule, DIFFICULTY_TAG_PREFIX) ?? "?";
}
