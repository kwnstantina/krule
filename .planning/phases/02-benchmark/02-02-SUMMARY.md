# Phase 2 Plan 2: Answer Key and Scoring Harness Summary

**`packages/benchmark` — the legacy-claims answer key in kontract form, provenance-proposed / judge-confirmed scoring with precision, recall and recall per classification, a cached Claude judge, and `krule score` wired to it**

## Accomplishments
- `answer-key/legacy-claims.kontract.yaml`: all 30 planted rules, generated from `PLANTED.md` by `pnpm generate-key` (not hand-copied). `class:` / `difficulty:` tags; the 4 contradictions stamped `contradicted` so the key doubles as Phase 4's expected-status truth. A test regenerates it and fails on any drift from `PLANTED.md`.
- Scoring (`score.ts`): candidate pairs within ±3 lines (`LINE_TOLERANCE`), tried tightest-first; a pair counts only when the judge agrees. Precision, recall, F1, `PASS_THRESHOLD = 0.8`, recall per classification, and explicit missed / misdescribed / not-in-key lists.
- Judges (`judge.ts`): `Judge` interface (with a `name` that is part of the cache key), `createCachedJudge` (sorted, checked-in JSON with both statements for audit), `deterministicJudge` placeholder, and `createClaudeJudge` through `@repo/llm`.
- `krule score` now uses the harness. `KRULE_JUDGE=claude|deterministic|auto` (auto = Claude when `ANTHROPIC_API_KEY` is set). Claude verdicts go to `packages/benchmark/verdicts/legacy-claims.verdicts.json`.

## Deviations from plan
- **Judge confirms during pairing, not after it.** The plan paired by location first, then judged. Fixture rules sit a line apart (R-010 on 117, R-011 on 118), so nearest-line pairing would mis-assign a correct extraction and count it as wrong. Location now proposes candidates in order; the judge decides which one it is.
- **The Claude judge landed here, not in 03-01.** `@repo/llm` already existed from the vertical slice, so the real judge costs one function.
- **Deterministic verdicts are not cached.** They are free and repeatable, and would only add noise to a file meant for human review.
- **Fixed in the inherited token matcher:** the length filter dropped two-digit numbers, so "45 days" vs "30 days" could not be told apart. Numbers now always count, and a value the key states but the extraction lacks rejects the match.

## Verification
- `@repo/benchmark`: 22 tests (key validity and sync with PLANTED.md, pairing tolerance and contention, perfect / empty / partial / misdescribed scoring, cache replay with zero inner calls, byte-identical output). `krule` pipeline test moved onto the harness.
- `turbo run test check-types` across benchmark, krule, discover, verify, kontract, llm: 13/13 tasks pass.
- `krule demo` end to end: score path prints 30/30 (circular by design in demo mode — labelled as such).

## Not done
- **No real Discover score yet.** No API key in this checkout. Next: `ANTHROPIC_API_KEY=... pnpm --filter krule start audit ../../fixtures/legacy-claims --out .krule-out`.
- New issues: ISS-008 (one-to-one vs merged contradictions), ISS-009 (Verify catches 1 of 4 contradictions).
- Model defaults and the GPT-6 Sol alternative: see `MODEL-CHOICE.md`.
