import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_EFFORT, DEFAULT_MODEL } from "./constants";
import type {
  CompletionRequest,
  CompletionResult,
  Effort,
  LlmProvider,
} from "./types";

/**
 * Thinking is on by default on this model and `max_tokens` caps thinking plus
 * response text together, so this is deliberately well above the size of the
 * JSON we expect back. Streaming is used because it is above ~16K.
 */
const DEFAULT_MAX_TOKENS = 32000;

export interface AnthropicProviderOptions {
  apiKey?: string;
  model?: string;
  defaultEffort?: Effort;
  maxTokens?: number;
}

export class AnthropicProvider implements LlmProvider {
  readonly name = "anthropic";
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly defaultEffort: Effort;
  private readonly maxTokens: number;

  constructor(options: AnthropicProviderOptions = {}) {
    // A bare constructor also picks up an `ant auth login` profile, so an unset
    // ANTHROPIC_API_KEY is not necessarily an error.
    this.client = new Anthropic(
      options.apiKey ? { apiKey: options.apiKey } : {},
    );
    this.model = options.model ?? DEFAULT_MODEL;
    this.defaultEffort = options.defaultEffort ?? DEFAULT_EFFORT;
    this.maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
  }

  async complete<T>(
    request: CompletionRequest<T>,
  ): Promise<CompletionResult<T>> {
    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: request.maxTokens ?? this.maxTokens,
      // Cached: instructions do not vary between modules.
      system: [
        {
          type: "text",
          text: request.system,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: [
            // The corpus is the large, stable prefix — cache it so a second
            // pass over the same module only pays for the task.
            {
              type: "text",
              text: request.corpus,
              cache_control: { type: "ephemeral" },
            },
            { type: "text", text: request.task },
          ],
        },
      ],
      output_config: {
        effort: request.effort ?? this.defaultEffort,
        format: { type: "json_schema", schema: request.jsonSchema },
      },
    });

    const message = await stream.finalMessage();

    // Check stop_reason before touching content: on a refusal `content` is
    // empty or partial, and indexing into it would throw something unhelpful.
    if (message.stop_reason === "refusal") {
      const category = message.stop_details?.category ?? "unknown";
      throw new Error(
        "Claude declined this extraction request (category: " +
          category +
          "). Extraction over security-adjacent code can trip the safety " +
          "classifiers. Re-run with KRULE_LLM=recorded to replay a cached " +
          "result, or narrow the module being scanned.",
      );
    }
    if (message.stop_reason === "max_tokens") {
      throw new Error(
        "Extraction hit the max_tokens ceiling (" +
          String(request.maxTokens ?? this.maxTokens) +
          ") before finishing. Raise maxTokens or split the module.",
      );
    }

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    if (text.trim() === "") {
      throw new Error(
        "Claude returned no text content (stop_reason: " +
          String(message.stop_reason) +
          ").",
      );
    }

    // Structured outputs guarantee this parses and matches `jsonSchema`; the
    // Zod pass adds the constraints JSON Schema cannot express. A ZodError is
    // deliberately left to propagate, matching @repo/kontract's contract.
    const data = request.schema.parse(JSON.parse(text));

    return {
      data,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
        cacheReadTokens: message.usage.cache_read_input_tokens ?? 0,
        cacheCreationTokens: message.usage.cache_creation_input_tokens ?? 0,
      },
      model: message.model,
      provider: this.name,
    };
  }
}
