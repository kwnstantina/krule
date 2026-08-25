import { readFile } from "node:fs/promises";
import type { KontractDocument } from "@repo/kontract";

export interface PlantedRule {
  id: string;
  statement: string;
  classification: string;
}

export interface ScoreResult {
  planted: number;
  extracted: number;
  matched: number;
  /** Planted rules nothing in the kontract appears to cover. */
  missed: PlantedRule[];
  recall: number;
}

/**
 * Parses the fixture's answer key out of `PLANTED.md`.
 *
 * The fixture is a synthetic benchmark, not a held-out test set, so the key is
 * committed alongside it. Extraction never reads it — only this scorer does.
 */
export function parsePlanted(markdown: string): PlantedRule[] {
  const rules: PlantedRule[] = [];

  for (const line of markdown.split("\n")) {
    if (!line.startsWith("| R-")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    const [id, statement, , , classification] = cells;
    if (id === undefined || statement === undefined) continue;
    rules.push({
      id,
      statement,
      classification: classification ?? "unknown",
    });
  }

  return rules;
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
    // Keep digits attached so "10,000" and "45" survive as signal.
    .replace(/[^a-z0-9\s.]/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/\.$/, ""))
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
  return new Set(words);
}

/**
 * Overlap score between two statements, weighted so numbers count double.
 *
 * Numbers are the load-bearing part of most of these rules — "45 days" versus
 * "30 days" is the whole finding — so a shared threshold is stronger evidence of
 * a match than a shared noun.
 */
export function similarity(a: string, b: string): number {
  const left = tokenize(a);
  const right = tokenize(b);
  if (left.size === 0 || right.size === 0) return 0;

  let score = 0;
  let weight = 0;
  for (const token of left) {
    const isNumber = /\d/.test(token);
    const w = isNumber ? 2 : 1;
    weight += w;
    if (right.has(token)) score += w;
  }

  return weight === 0 ? 0 : score / weight;
}

/** A planted rule counts as found when some extracted rule clears this bar. */
export const MATCH_THRESHOLD = 0.34;

/**
 * Scores a kontract against the fixture's answer key.
 *
 * This measures **recall** — how much of the planted logic extraction actually
 * found. It deliberately does not compute precision: an extracted rule with no
 * planted counterpart may be a false positive, or a real rule the fixture author
 * missed, and a token-overlap matcher cannot tell those apart. Reporting a
 * precision figure it cannot justify would overstate what this proves.
 */
export function scoreAgainstPlanted(
  document: KontractDocument,
  planted: PlantedRule[],
): ScoreResult {
  const missed: PlantedRule[] = [];
  let matched = 0;

  for (const rule of planted) {
    const best = Math.max(
      0,
      ...document.rules.map((extracted) =>
        similarity(rule.statement, extracted.statement),
      ),
    );
    if (best >= MATCH_THRESHOLD) matched += 1;
    else missed.push(rule);
  }

  return {
    planted: planted.length,
    extracted: document.rules.length,
    matched,
    missed,
    recall: planted.length === 0 ? 0 : matched / planted.length,
  };
}

export async function loadPlanted(path: string): Promise<PlantedRule[]> {
  return parsePlanted(await readFile(path, "utf8"));
}
