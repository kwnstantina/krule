import type { KontractRule, Provenance } from "@repo/kontract";

/**
 * How far apart two citations in the same file may be and still point at the
 * same rule. An extractor may anchor a rule to the `if`, the body, or the
 * constant it reads, so exact-line matching would score anchoring style rather
 * than understanding.
 */
export const LINE_TOLERANCE = 3;

/** A discovered rule and an answer-key rule whose citations overlap. */
export interface Candidate {
  discoveredId: string;
  keyId: string;
  /** Smallest line gap between any two of their citations; 0 means overlap. */
  distance: number;
}

function range(provenance: Provenance): [number, number] {
  return [provenance.line, provenance.endLine ?? provenance.line];
}

/** Line gap between two citations, or `null` if they are in different files. */
export function citationDistance(a: Provenance, b: Provenance): number | null {
  if (a.file !== b.file) return null;
  const [aStart, aEnd] = range(a);
  const [bStart, bEnd] = range(b);
  if (aEnd < bStart) return bStart - aEnd;
  if (bEnd < aStart) return aStart - bEnd;
  return 0;
}

/** Smallest distance between any citation of `a` and any of `b`, or `null`. */
export function ruleDistance(a: KontractRule, b: KontractRule): number | null {
  let best: number | null = null;
  for (const left of a.provenance) {
    for (const right of b.provenance) {
      const distance = citationDistance(left, right);
      if (distance !== null && (best === null || distance < best)) {
        best = distance;
      }
    }
  }
  return best;
}

/**
 * Every discovered/key pair whose citations land within `LINE_TOLERANCE`,
 * tightest first.
 *
 * This only *proposes* pairs. Several fixture rules sit a line apart (R-010 and
 * R-011 are on 117 and 118), so location alone cannot decide which rule an
 * extracted statement describes — the judge in `score.ts` disposes. Ties break
 * on ids so the order, and therefore the score, is deterministic.
 */
export function candidatePairs(
  discovered: readonly KontractRule[],
  key: readonly KontractRule[],
  tolerance: number = LINE_TOLERANCE,
): Candidate[] {
  const candidates: Candidate[] = [];
  for (const found of discovered) {
    for (const expected of key) {
      const distance = ruleDistance(found, expected);
      if (distance !== null && distance <= tolerance) {
        candidates.push({
          discoveredId: found.id,
          keyId: expected.id,
          distance,
        });
      }
    }
  }

  return candidates.sort(
    (a, b) =>
      a.distance - b.distance ||
      a.keyId.localeCompare(b.keyId) ||
      a.discoveredId.localeCompare(b.discoveredId),
  );
}
