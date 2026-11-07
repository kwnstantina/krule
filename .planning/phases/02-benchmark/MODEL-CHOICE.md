# Model choice

Decided 2026-11-07. Revisit once the first real Discover score lands.

## Current defaults

| Role | Model | Price per MTok (in / out) | Set in |
|------|-------|---------------------------|--------|
| Extraction (Discover) | `claude-opus-5-5`, effort `high` | $4 / $20 | `packages/llm/src/constants.ts` → `DEFAULT_MODEL`, override with `KRULE_MODEL` |
| Benchmark judge | `claude-sonnet-5-5` | $2 / $10 | `DEFAULT_JUDGE_MODEL`, override with `KRULE_JUDGE_MODEL` |

A first full `krule audit` on `fixtures/legacy-claims` is estimated at about $1–2.
Reruns are close to free because of the response cache and the checked-in verdict cache.

**Why Opus 5.5.** It is newer than `claude-opus-5`, the previous default, and 20% cheaper.
Fable 5.1 ($10 / $50) costs 2.5× as much and isn't needed for one module.
Haiku 4.5 is too weak to find rules hidden in code.
Opus 5.5 is also served on Bedrock and Vertex in EU regions, which matters for insurance clients under GDPR.

## Alternative: GPT-6 Sol (OpenAI)

GPT-6 Sol is a serious alternative for extraction. It is OpenAI's cost-efficient high-end tier, launched on 2026-09-22 and placed below their flagship GPT-6 Astra. GPT-6.1 Sol is its successor.
It is in the same class as Opus 5.5, and nothing we have measured says which one gets higher recall on this task.

Price is not the deciding factor: a fixture run costs about $1 on either model.
Decide on **recall against the answer key** (pass mark 80%) and on **data residency** (where client source code is processed).

**To evaluate it:**

1. Add an OpenAI-compatible `LlmProvider` in `packages/llm`, behind the existing provider interface. It needs structured JSON output that the existing Zod schemas can check.
2. Run `krule audit` on `fixtures/legacy-claims` once with each extraction model. Keep the judge fixed (`claude-sonnet-5-5`) so only one thing changes between runs.
3. Compare overall recall, recall per classification (dark-logic, dead-rule, contradiction, normal), precision and token cost.
4. Pick the default from the numbers, and keep both providers so clients can choose.

The comparison table doubles as sales material: "we benchmarked the models; here are the numbers."

## Considered and rejected

- **Qwen 3.8 Omni Flash** ($0.15 / $0.47). Very cheap, but it is a fast multimodal model (audio, video, images), not one built for deep reasoning over code. It is also an Alibaba-hosted API, so client source code would go to a China-based provider, which an EU insurer is unlikely to accept. If it is ever added via OpenRouter, the benchmark is enough to settle the quality question.
