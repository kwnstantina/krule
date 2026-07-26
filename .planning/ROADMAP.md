# Roadmap: KRule — Business Logic Observability

## Overview

We start by making the ground solid: a real test runner, a rule engine that actually
evaluates nested conditions, and `@repo/kontract` — the schema that every later package
reads or writes. Next we build the yardstick before the thing it measures: a synthetic
legacy fixture with planted dark logic, dead rules and contradictions, plus a written
answer key and a scoring harness. Only then does extraction get built, so its 80% score
is earned against a target we could not tune after the fact. Discover produces the rule
inventory with provenance; Verify proves each rule against the real code and stamps it
`verified | unverified | contradicted | drifted`; the audit report and CI drift check
surface those results outward. Finally one rule family moves onto the KRule Runtime with
input/output equivalence proven by Verify rather than asserted.

## Phases

- [x] **Phase 1: Foundation** - Test runner, a correct `@repo/core` evaluator, and the `@repo/kontract` schema
- [ ] **Phase 2: Benchmark** - Synthetic legacy fixture, ground-truth answer key, and the scoring harness
- [ ] **Phase 3: Discover** - Provider-abstracted extraction that emits `rules.kontract.yaml` and clears 80%
- [ ] **Phase 4: Verify** - Generated executable tests per rule, run against real code, status written back
- [ ] **Phase 5: Audit & Drift** - `audit-report.html` with four sections, plus PR drift flagging in CI
- [ ] **Phase 6: Runtime** - One rule family migrated to `@repo/core` with proven I/O equivalence

## Phase Details

### Phase 1: Foundation
**Goal**: Every downstream phase can be tested, the Runtime target actually works, and there is a single schema for rules to live in.
**Depends on**: Nothing (first phase)
**Plans**: 3 plans

Plans:
- [x] 01-01: Add Vitest — root config, `test` task in `turbo.json`, per-package wiring, one passing smoke test
- [x] 01-02: Fix `@repo/core` evaluator — recursive group evaluation and custom-operator dispatch, driven by tests written first
- [x] 01-03: `@repo/kontract` — Zod schema for a kontract rule (id, plain-language statement, provenance, confidence, status), YAML read/write, round-trip tests

**Why the evaluator fix is here:** the brief reuses `@repo/core` "as-is" as the Runtime
layer, but `packages/core/src/evaluator.ts:36` hands raw condition *objects* to the group
operator so nested groups never recurse, and the `customOperators` map is written but never
read. Phase 6 cannot prove equivalence against an engine that mis-evaluates nesting.

### Phase 2: Benchmark
**Goal**: A written, defensible target that extraction is measured against — built before extraction exists.
**Depends on**: Phase 1 (kontract schema, test runner)
**Plans**: 2 plans

Plans:
- [ ] 02-01: Synthetic legacy fixture module — code + schema + seed data + deliberately stale docs, with planted dark logic (code-only rules), dead rules (doc-only), and at least one genuine contradiction
- [ ] 02-02: Ground-truth answer key expressed in kontract form, plus the scoring harness (precision/recall against the key, reports the ≥80% figure)

**Sequencing note:** this precedes Discover on purpose. An answer key written after seeing
extractor output measures nothing.

### Phase 3: Discover
**Goal**: `krule discover <module>` produces `rules.kontract.yaml` — every rule in plain language with provenance and confidence — scoring ≥80% on the fixture.
**Depends on**: Phase 1, Phase 2
**Plans**: 3 plans

Plans:
- [ ] 03-01: LLM provider abstraction — Claude (Anthropic, 1M context) as the default implementation behind an interface that on-prem Bedrock / Vertex / customer keys can slot into
- [ ] 03-02: `@repo/discover` extraction pipeline — ingest code, schema, data and docs; emit kontract rules with provenance (file, line, commit) and a confidence score; read-only against the target
- [ ] 03-03: CLI app with `krule discover <module>`; run against the Phase 2 fixture, score with the harness, iterate prompts until it clears 80%

### Phase 4: Verify
**Goal**: No rule is trusted on the model's word — each carries a generated test that ran against real code.
**Depends on**: Phase 1, Phase 3
**Plans**: 3 plans

Plans:
- [ ] 04-01: `@repo/verify` test generation — turn a kontract rule plus its provenance into an executable test against the real code path
- [ ] 04-02: Execution and status assignment — `verified | unverified | contradicted | drifted`, written back into the kontract
- [ ] 04-03: `krule verify` CLI command; full run over the fixture with every rule reaching a status

### Phase 5: Audit & Drift
**Goal**: Results leave the tool in the two forms that matter — a report a human reads and a flag a PR trips.
**Depends on**: Phase 4
**Plans**: 3 plans

Plans:
- [ ] 05-01: `audit-report.html` renderer — Rule Inventory and Contradiction Report sections, with the four statuses rendered distinguishably
- [ ] 05-02: Dark Logic (code-only) and Dead Rules (doc-only / never-executed) sections; `krule report` command
- [ ] 05-03: CI drift detection — diff a PR against the baseline kontract, emit a correct drift flag ("this PR changes rule R-114 …"), plus the pipeline template

### Phase 6: Runtime
**Goal**: Close the loop — extracted rules become executable on the existing engine, with equivalence proven rather than claimed.
**Depends on**: Phase 1 (evaluator fix), Phase 4 (Verify)
**Plans**: 2 plans

Plans:
- [ ] 06-01: Select one rule family from the fixture and translate it into `@repo/core` Rule format
- [ ] 06-02: Equivalence harness — Verify-driven proof that the legacy code path and Runtime execution produce identical output across the generated test inputs

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-07-26 |
| 2. Benchmark | 0/2 | Not started | - |
| 3. Discover | 0/3 | Not started | - |
| 4. Verify | 0/3 | Not started | - |
| 5. Audit & Drift | 0/3 | Not started | - |
| 6. Runtime | 0/2 | Not started | - |

## Success Criteria Coverage

Mapping to `BRIEF.md`, so nothing is orphaned:

| Brief criterion | Delivered by |
|-----------------|--------------|
| `krule discover <module>` → `rules.kontract.yaml` with provenance + confidence | Phase 3 |
| Every rule carries a generated test; four statuses shown differently | Phase 4 (status), Phase 5 (shown) |
| `audit-report.html` with four sections | Phase 5 |
| PR changing a rule triggers a correct drift flag in CI | Phase 5 |
| Extraction ≥80% against a written answer key | Phase 2 (key + harness), Phase 3 (score) |
| One rule family on the Runtime with proven equivalence | Phase 6 |

## Out of Scope (from BRIEF.md — do not plan these)

GTM of any kind, SaaS dashboard / accounts / multi-tenancy, on-prem deployment packaging,
the DORA-formatted report pack, the live ARAG data benchmark (`Claims.BE`,
`CLM.Disbursements` — wired in after the fixture proves the engine), and rewriting the
existing Groq AI features.
