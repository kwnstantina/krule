import { EMPTY_USAGE, type LlmProvider, type TokenUsage } from "@repo/llm";
import { evaluateHypothesis, type Observation } from "./evaluate";
import { HYPOTHESES_JSON_SCHEMA, HypothesisSetSchema, type Hypothesis } from "./hypothesis";
import type { EventLog } from "./log";
import { profileLog } from "./profile";
import { buildObserveTask, OBSERVE_SYSTEM_PROMPT } from "./prompts";

export interface PolicyDocument {
  /** Path or name, shown to the model so it can cite clauses. */
  name: string;
  text: string;
}

export interface ObserveOptions {
  log: EventLog;
  policies?: PolicyDocument[];
  /** Asks the model for hypotheses. Omit when `hypotheses` is given. */
  provider?: LlmProvider;
  /** Hand-written or previously saved hypotheses; skips the model entirely. */
  hypotheses?: Hypothesis[];
}

export interface ObserveResult {
  profile: string;
  hypotheses: Hypothesis[];
  observations: Observation[];
  usage: TokenUsage;
}

export function renderObserveCorpus(profile: string, policies: PolicyDocument[]): string {
  const docs = policies.map((p) => `<policy name="${p.name}">\n${p.text}\n</policy>`).join("\n\n");
  return `<log_profile>\n${profile}</log_profile>${docs === "" ? "" : "\n\n" + docs}`;
}

/**
 * The actual-layer pipeline: profile → the model proposes hypotheses → each runs
 * as a deterministic query over the full log.
 *
 * Every number in the result comes from `evaluateHypothesis`. The model only
 * chooses what to measure.
 */
export async function observeLog(options: ObserveOptions): Promise<ObserveResult> {
  const policies = options.policies ?? [];
  const profile = profileLog(options.log);
  let hypotheses = options.hypotheses;
  let usage = EMPTY_USAGE;

  if (hypotheses === undefined) {
    if (options.provider === undefined) {
      throw new Error("observeLog needs either a provider or hypotheses");
    }
    const result = await options.provider.complete({
      system: OBSERVE_SYSTEM_PROMPT,
      corpus: renderObserveCorpus(profile, policies),
      task: buildObserveTask(policies.length > 0),
      jsonSchema: HYPOTHESES_JSON_SCHEMA,
      schema: HypothesisSetSchema,
      schemaName: "observe-hypotheses-v1",
      maxTokens: 32_000,
    });
    hypotheses = result.data.hypotheses;
    usage = result.usage;
  }

  return {
    profile,
    hypotheses,
    observations: hypotheses.map((h) => evaluateHypothesis(options.log, h)),
    usage,
  };
}
