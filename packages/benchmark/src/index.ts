import { join } from "node:path";
import { readKontractFile } from "@repo/kontract";
import type { Judge } from "./judge";
import { scoreKontract, type ScoreResult } from "./score";

export {
  answerKeyFromPlanted,
  tagValue,
  CLASSIFICATIONS,
  CLASS_TAG_PREFIX,
  DIFFICULTY_TAG_PREFIX,
} from "./planted";
export type { Classification, AnswerKeyOptions } from "./planted";

export { candidatePairs, citationDistance, ruleDistance, LINE_TOLERANCE } from "./pairing";
export type { Candidate } from "./pairing";

export {
  createCachedJudge,
  createClaudeJudge,
  deterministicJudge,
  termOverlap,
  verdictKey,
  DETERMINISTIC_THRESHOLD,
} from "./judge";
export type { Judge, Verdict } from "./judge";

export { scoreKontract, difficultyOf, PASS_THRESHOLD } from "./score";
export type { ScoreResult, Match, Misdescription, ClassBreakdown } from "./score";

export { renderScoreReport } from "./report";

export {
  generateOpsEvents,
  workingDaysBetween,
  OPS_CLAIM_COUNT,
  OPS_SEED,
} from "./ops-generator";
export { computeOpsFigures, parseOpsEvents } from "./ops-findings";
export { OPS_REFERENCE_HYPOTHESES } from "./ops-reference";
export type { OpsFigures, Row as OpsRow } from "./ops-findings";

const PACKAGE_ROOT = join(__dirname, "..");

/** Committed answer key for a benchmark module, e.g. `legacy-claims`. */
export function answerKeyPath(module: string): string {
  return join(PACKAGE_ROOT, "answer-key", `${module}.kontract.yaml`);
}

/** Checked-in judge verdict cache for a benchmark module. */
export function verdictsPath(module: string): string {
  return join(PACKAGE_ROOT, "verdicts", `${module}.verdicts.json`);
}

/** Event log ("actual" layer) of the `legacy-claims-ops` fixture. */
export function opsEventsPath(): string {
  return join(
    PACKAGE_ROOT,
    "..",
    "..",
    "fixtures",
    "legacy-claims-ops",
    "events",
    "claim-events.csv",
  );
}

/** The whole scoring path in one call, for the CLI and for Phase 3. */
export async function scoreKontractAgainstKey(
  discoveredPath: string,
  keyPath: string,
  judge: Judge,
): Promise<ScoreResult> {
  const [discovered, key] = await Promise.all([
    readKontractFile(discoveredPath),
    readKontractFile(keyPath),
  ]);
  return scoreKontract(discovered, key, judge);
}
