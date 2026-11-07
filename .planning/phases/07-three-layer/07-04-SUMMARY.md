# 07-04 summary: event-log reader (`@repo/observe`)

## What was built
- **`packages/observe`** (new). It works on any industry's logs: you name the case, activity and timestamp columns, and every other column becomes an attribute. Columns written as `k=v;k=v` are split into separate attributes.
  - `log.ts`: parses the CSV, sorts events by time, groups them into cases, and counts working days between dates.
  - `hypothesis.ts`: the query language. Each condition is a flat `{field, op, value}`, and conditions are combined with AND. There are field types for case data and for event data: activity counts, month, working days between two activities, weekday/time, and `@field` references to compare one field with another. The Zod schema and the JSON schema are pinned together by a test.
  - `evaluate.ts`: runs each hypothesis deterministically. A hypothesis gets one of these statuses: `holds`, `breached`, `confirmed` (pattern, at least 95% of at least 5 cases), `not-supported`, `no-evidence`, or `invalid` (it names fields the log does not have). A policy about an activity the log never records comes out as `no-evidence`, not `breached`.
  - `profile.ts`: an aggregate-only summary of the log for the model (activities, attribute distributions, variants, strong associations, timing anomalies). It contains no case ids and no raw rows.
  - `observe.ts` and `prompts.ts`: send the profile plus any policies to the model, get hypotheses back, and evaluate them locally. **Models propose; queries measure.**
- **CLI:** `krule observe [log.csv] [--policy <file>]... [--reference]`. It writes `observations.json` and `log-profile.md`. With no log it uses the ops fixture. `--reference` is the offline demo; like `krule demo`, it only shows that the query engine works, because the hypotheses are hand-written.
- **`@repo/benchmark`:** `ops-reference.ts` holds the hand-written hypotheses for F-01 to F-12. `ops-reference.test.ts` checks the engine against the separately written `ops-findings.ts`, and all 12 findings agree.

## Fixed during this step
- **Generator bug:** a same-day contact could be timestamped before the claim was received, so a case's first event was not `claim_received`. The independent cross-check caught it. Contacts now come at least 30 minutes after receipt. Every pinned figure is unchanged.

## Verification
- `turbo run test check-types` for observe, benchmark, krule, llm and discover: 13/13.
- `krule observe --reference` reports 7 breached policies, 3 unwritten rules, 2 holding (the F-06 control) and 1 unobservable (F-10). Every figure matches PLANTED.md.
- The profile contains the signals a model needs: BR0042 → `reassigned` (67% against 5% overall), December authorisation taking a median of 15 working days against 5 overall, and the band where `lapse_gap_days` flips from 100% to 0% authorised.

## Not done
- **No live model run yet** (needs `ANTHROPIC_API_KEY`). This is the real test: does the model, given only the profile, propose hypotheses that recover the 12 findings? Scoring that automatically is 07-05.
- Friday cutoff (F-07) has no profile signal, because it is an event-level timing effect. The model can still find it by checking policy §4.3, which comes out breached on exactly those Friday payments.
- Results are not written into the kontract yet. That waits for 07-02 (v2 evidence, additive, as agreed with the apps/web session).
