import type { ZodType } from "zod";

/**
 * Reasoning depth. Maps to the Claude API's `output_config.effort`.
 *
 * Extraction is intelligence-sensitive, so `high` is the default here rather
 * than a cheaper level.
 */
export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

/**
 * A request for structured output.
 *
 * `schema` is a Zod schema and the provider is required to return data that
 * satisfies it. The Anthropic provider enforces this at the API layer via
 * structured outputs, so a malformed response is retried by the model rather
 * than surfacing here.
 *
 * `corpus` is separated from `task` deliberately: it is the large, stable part
 * of the prompt and gets a cache breakpoint, so re-running extraction over the
 * same module with a different task only pays for the task.
 */
export interface CompletionRequest<T> {
  /** Instructions that do not vary per module. Cached. */
  system: string;
  /** The material being reasoned about — file contents. Large and cached. */
  corpus: string;
  /** What to do with the corpus. Small and uncached. */
  task: string;
  /**
   * JSON Schema sent to the provider to constrain generation. Kept separate
   * from `schema` on purpose: this is the wire format every provider
   * understands, whereas Zod is our own validation layer. The SDK's
   * `zodOutputFormat` helper would couple us to Zod v4 (it imports `zod/v4`)
   * while this workspace is pinned to Zod 3.24 for `@repo/core`.
   */
  jsonSchema: Record<string, unknown>;
  /**
   * Validates what came back. Structured outputs already guarantee the shape,
   * so this catches the constraints JSON Schema cannot express — `R-<digits>`
   * ids, minimum statement length, confidence in [0,1].
   */
  schema: ZodType<T>;
  /** Distinguishes cache entries; bump it when `jsonSchema` changes shape. */
  schemaName: string;
  effort?: Effort;
  maxTokens?: number;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
}

export interface CompletionResult<T> {
  data: T;
  usage: TokenUsage;
  /** The model that actually produced the result. */
  model: string;
  /** Which provider served it — `anthropic`, `recorded`, … */
  provider: string;
}

/**
 * The seam the brief requires: extraction must run on-prem against Bedrock,
 * Vertex or a customer's own key. Everything downstream depends on this
 * interface, never on the Anthropic SDK directly.
 */
export interface LlmProvider {
  readonly name: string;
  complete<T>(request: CompletionRequest<T>): Promise<CompletionResult<T>>;
}

export const EMPTY_USAGE: TokenUsage = {
  inputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  cacheCreationTokens: 0,
};
