import { AnthropicProvider } from "./anthropic";
import { DEFAULT_CACHE_DIR, DEFAULT_MODEL } from "./constants";
import { CachingProvider, RecordedProvider } from "./recorded";
import type { Effort, LlmProvider } from "./types";

export type ProviderKind = "anthropic" | "recorded" | "auto";

export interface FactoryOptions {
  kind?: ProviderKind;
  apiKey?: string;
  model?: string;
  effort?: Effort;
  cacheDir?: string;
}

const EFFORTS: readonly Effort[] = ["low", "medium", "high", "xhigh", "max"];

function parseEffort(value: string | undefined): Effort | undefined {
  if (value === undefined) return undefined;
  const found = EFFORTS.find((candidate) => candidate === value);
  if (found === undefined) {
    throw new Error(
      "KRULE_EFFORT must be one of " + EFFORTS.join(", ") + ", got " + value,
    );
  }
  return found;
}

function parseKind(value: string | undefined): ProviderKind | undefined {
  if (value === undefined) return undefined;
  if (value === "anthropic" || value === "recorded" || value === "auto") {
    return value;
  }
  throw new Error(
    "KRULE_LLM must be anthropic, recorded or auto, got " + value,
  );
}

/**
 * Builds the provider from explicit options, then the environment, then a
 * default that cannot fail closed.
 *
 * `auto` (the default) uses Claude when a credential is present and replays a
 * recorded response otherwise. That is what keeps a demo working on a machine
 * with no key and no network, without anyone having to remember a flag.
 */
export function createProvider(options: FactoryOptions = {}): LlmProvider {
  const env = process.env;
  const cacheDir = options.cacheDir ?? env.KRULE_CACHE_DIR ?? DEFAULT_CACHE_DIR;
  const model = options.model ?? env.KRULE_MODEL ?? DEFAULT_MODEL;
  const effort = options.effort ?? parseEffort(env.KRULE_EFFORT);
  const apiKey = options.apiKey ?? env.ANTHROPIC_API_KEY;
  const requested = options.kind ?? parseKind(env.KRULE_LLM) ?? "auto";

  if (requested === "recorded") {
    return new RecordedProvider(cacheDir, model);
  }

  // An unset ANTHROPIC_API_KEY does not prove there are no credentials — the
  // SDK also reads ANTHROPIC_AUTH_TOKEN and `ant auth login` profiles. Only
  // `auto` falls back on a missing key; an explicit `anthropic` is honoured so
  // those other credential sources still work.
  if (requested === "auto" && (apiKey === undefined || apiKey === "")) {
    return new RecordedProvider(cacheDir, model);
  }

  const live = new AnthropicProvider({
    apiKey,
    model,
    defaultEffort: effort,
  });
  return new CachingProvider(live, cacheDir, model);
}

/** Human-readable description of what a `createProvider()` call resolved to. */
export function describeProvider(provider: LlmProvider): string {
  if (provider.name === "recorded") {
    return "recorded (offline replay — no API calls)";
  }
  return provider.name + " (" + DEFAULT_MODEL + ", responses cached)";
}
