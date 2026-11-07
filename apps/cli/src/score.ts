import {
  createCachedJudge,
  createClaudeJudge,
  deterministicJudge,
  verdictsPath,
  type Judge,
} from "@repo/benchmark";
import { createProvider, DEFAULT_JUDGE_MODEL } from "@repo/llm";

type JudgeKind = "claude" | "deterministic" | "auto";

function parseJudgeKind(value: string | undefined): JudgeKind {
  if (value === undefined || value === "") return "auto";
  if (value === "claude" || value === "deterministic" || value === "auto") {
    return value;
  }
  throw new Error(
    "KRULE_JUDGE must be claude, deterministic or auto, got " + value,
  );
}

/**
 * Picks the judge for `krule score`.
 *
 * The Claude judge's verdicts go to the benchmark's checked-in cache, so a rerun
 * replays them for free and a reviewer can audit each one. The deterministic
 * placeholder is free and repeatable on its own, so it is not cached — its
 * verdicts would only add noise to a file people review.
 */
export function createJudge(module: string): Judge {
  const kind = parseJudgeKind(process.env.KRULE_JUDGE);
  const hasKey = (process.env.ANTHROPIC_API_KEY ?? "") !== "";

  if (kind === "deterministic" || (kind === "auto" && !hasKey)) {
    return deterministicJudge;
  }
  return createCachedJudge(
    createClaudeJudge(
      createProvider({
        kind: "anthropic",
        model: process.env.KRULE_JUDGE_MODEL ?? DEFAULT_JUDGE_MODEL,
      }),
    ),
    verdictsPath(module),
  );
}
