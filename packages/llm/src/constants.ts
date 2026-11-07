import type { Effort } from "./types";

/**
 * The brief specifies Claude with a 1M-token context. On `claude-opus-5-5` that
 * window is both the default and the maximum, so there is no beta header to set.
 * It succeeds `claude-opus-5` at a lower price ($4 / $20 per MTok).
 *
 * This lives here rather than in `anthropic.ts` so the recorded provider can
 * compute cache keys over the same model string without importing the SDK —
 * offline replay must not depend on the Anthropic client at all.
 */
export const DEFAULT_MODEL = "claude-opus-5-5";

/**
 * Extraction is intelligence-sensitive, so not a cheaper level. Always sent
 * explicitly: `claude-opus-5-5` defaults to `medium` when effort is omitted.
 */
export const DEFAULT_EFFORT: Effort = "high";

/**
 * The benchmark judge compares two short statements — a much easier task than
 * extraction, so it runs on the cheaper Sonnet ($2 / $10 per MTok).
 */
export const DEFAULT_JUDGE_MODEL = "claude-sonnet-5-5";

export const DEFAULT_CACHE_DIR = ".krule-cache";
