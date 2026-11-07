# Phase 7: three-layer truth (overview)

**Goal:** `krule audit` reads policy documents and event logs alongside code. It reports each rule's intended, implemented and actual versions and the gaps between them, scored against `fixtures/legacy-claims-ops/PLANTED.md`.

**Depends on:** Phase 2 (harness pattern) and Phase 3 (Discover over code). It can start before Phases 4–6.

**Context:** `.planning/VISION.md`

## Done so far (07-01, 2026-11-07)

- `fixtures/legacy-claims-ops/` holds the policy document (CAP-003), a generated event log of 400 claims and 2,893 events, and an answer sheet of 12 findings across 8 gap types, including two control cases.
- `@repo/benchmark`: `ops-generator.ts` (seeded and byte-reproducible), `ops-findings.ts` (recomputes every figure in the answer sheet), and `ops-fixture.test.ts` (pins the file and the figures).
- `legacy-claims` is untouched. Its line pins and `apps/web` both depend on it.

## Plans

- [x] 07-01: The ops fixture: policy layer, event log, answer sheet with figures pinned by tests.
- [ ] 07-02: Kontract v2 evidence. Add a `layer` (intended / implemented / actual) to each piece of evidence, plus evidence kinds `clause` (document plus clause id) and `query` (a reproducible query over a data source plus its result). Add a `gap` field per rule. This needs a migration path from v1, which Discover, Verify, Report and apps/web all read, so coordinate before changing `@repo/kontract`. **Constraint (agreed with the apps/web session, 2026-11-07):** v2 must keep v1 files parseable, or `parseKontract` must upgrade v1 to v2 on read. `apps/web/app/lib/audits.ts` uses `parseKontract`, the `RuleOrigin`/`RuleStatus` types, and `rule.provenance`, `origins`, `status`, `confidence` and `notes`, plus `verifyDocument` and `isDarkLogic`/`isDeadRule`. Its snapshot is `apps/web/data/audits/legacy-claims.kontract.yaml` (v1). Keep these fields and signatures, and make the new fields additive.
- [ ] 07-03: Policy reader. Extract rules from documents with clause-level provenance, then link each one to the matching code rule. The LLM proposes the links and the evidence confirms them.
- [x] 07-04: Event-log reader (see `07-04-SUMMARY.md`). The LLM proposes a hypothesis ("claims > £10k always have senior_sign_off") and krule turns it into a deterministic query. The figure comes from the query, never from the model. This keeps numbers reproducible and impossible to hallucinate.
- [ ] 07-05: Gap scoring. Extend the harness to score gap type, evidence per layer and figure accuracy against `PLANTED.md`. Penalise flagged control cases (F-06) and invented breaches (F-10).
- [ ] 07-06: Report. Show a three-column view per rule (intended | implemented | actual) with the gap and its money or case figure.

## Key design decision

**Models propose; queries measure.** No figure in a three-layer report comes from model output. That is what makes "£391,808 authorised without sign-off" something an auditor can sign.
