import type { Effort } from "./types";

/**
 * The brief specifies Claude with a 1M-token context. On `claude-opus-5` that
 * window is both the default and the maximum, so there is no beta header to set.
 *
 * This lives here rather than in `anthropic.ts` so the recorded provider can
 * compute cache keys over the same model string without importing the SDK —
 * offline replay must not depend on the Anthropic client at all.
 */
export const DEFAULT_MODEL = "claude-opus-5";

/** Extraction is intelligence-sensitive, so not a cheaper level. */
export const DEFAULT_EFFORT: Effort = "high";

export const DEFAULT_CACHE_DIR = ".krule-cache";
