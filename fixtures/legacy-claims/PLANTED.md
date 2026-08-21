# Planted rules — `legacy-claims` benchmark fixture

This is the fixture's answer sheet: the authoritative record of every business
rule deliberately planted in this module, written as each rule was planted.

It is committed on purpose. This is a synthetic benchmark, not a held-out test
set — a human reviewer has to be able to read the fixture and independently agree
with this table. Discover never reads this file.

**30 rules.** Each is worth 3.33%, so the 80% acceptance threshold in
`.planning/BRIEF.md` sits at 24 of 30 and has finer resolution than the scoring
granularity.

## Classification vocabulary

| Classification | Meaning |
|----------------|---------|
| `normal` | Present in the code and described correctly in the docs, or a plain schema/data rule. Extraction should find these. |
| `dark-logic` | Present **only** in code. The docs say nothing about it. Feeds the audit report's Dark Logic section. |
| `dead-rule` | Described in the docs but implemented nowhere, **or** implemented in an unreachable branch. Feeds the Dead Rules section. |
| `contradiction` | Two sources disagree about the same rule — docs vs code, comment vs code, or code vs code. Feeds the Contradiction Report. |

## The rules

| id | statement | evidence | origins | classification | difficulty |
|----|-----------|----------|---------|----------------|------------|
| R-001 | A claim at status `'X'` is routed to the legacy reconciliation queue and left pending. | `src/authorise-claim.ts:38` | code | dead-rule | hard |
| R-002 | A claim where the insured party and the counterparty are the same party is rejected for conflict of interest. | `src/authorise-claim.ts:47`; `docs/underwriting-wiki.md:22` | code, docs | normal | easy |
| R-003 | Where a claim has no incident date, the policy inception date is used in its place. | `src/authorise-claim.ts:59` | code | dark-logic | medium |
| R-004 | A claim is rejected if the policy lapsed more than 45 days before the incident date. | `src/authorise-claim.ts:62`; `docs/underwriting-wiki.md:14` | code, docs | contradiction | easy |
| R-005 | UK claims with a settlement estimate below £1,000 are auto-authorised without handler involvement. | `src/authorise-claim.ts:70`; `docs/underwriting-wiki.md:29` | code, docs | normal | easy |
| R-006 | CA claims with a settlement estimate below CAD 750 are auto-authorised without handler involvement. | `src/authorise-claim.ts:77`; `docs/underwriting-wiki.md:30` | code, docs | normal | easy |
| R-007 | A CA claim held by a handler below seniority 3 requires sign-off whatever the claim is worth. | `src/authorise-claim.ts:84` | code | dark-logic | medium |
| R-008 | A claim with a settlement estimate above £10,000 requires senior handler sign-off. | `src/authorise-claim.ts:93`; stale comment at `src/authorise-claim.ts:92` | code | contradiction | easy |
| R-009 | A claim from a broker on the referral watchlist requires sign-off whatever the claim is worth. | `src/authorise-claim.ts:107`; list at `src/authorise-claim.ts:13` | code | dark-logic | hard |
| R-010 | DAS-brand claims are exempt from the panel-solicitor requirement. | `src/authorise-claim.ts:117`; `docs/underwriting-wiki.md:55` | code, docs | normal | easy |
| R-011 | A non-DAS claim above £2,500 must use a panel solicitor, or it is rejected. | `src/authorise-claim.ts:118`; `docs/handler-guide.md:14` | code, docs | contradiction | hard |
| R-012 | A disbursement cannot be paid unless its parent claim is authorised (status `'A'`). | `src/disbursements.ts:23`; `docs/handler-guide.md:22` | code, docs | normal | easy |
| R-013 | A rejected disbursement may be resubmitted at most twice. | `src/disbursements.ts:29`; `docs/handler-guide.md:33` | code, docs | normal | easy |
| R-014 | CAD disbursements on CA claims are converted to GBP at a hardcoded rate of 1.72. | `src/disbursements.ts:41` | code | dark-logic | medium |
| R-015 | Counsel fees are capped at £3,500 per disbursement, and the handler is not told. | `src/disbursements.ts:46` | code | dark-logic | medium |
| R-016 | Medical-report disbursements are exempt from the counsel fee cap. | `src/disbursements.ts:52`; `docs/handler-guide.md:39` | code, docs | normal | medium |
| R-017 | A non-DAS disbursement above £5,000 requires a panel solicitor. | `src/disbursements.ts:60` | code | contradiction | hard |
| R-018 | A BACS submission at or after 15:00 takes the next working day's value date. | `src/disbursements.ts:76`; `docs/handler-guide.md:27` | code, docs | normal | easy |
| R-019 | On Fridays the BACS cutoff is 12:00 rather than 15:00. | `src/disbursements.ts:72` | code | dark-logic | hard |
| R-020 | A claim's settlement amount may never exceed £250,000. | `db/schema.sql:32`; `docs/underwriting-wiki.md:42` | schema, docs | normal | easy |
| R-021 | Every claim must reference a handler — the column is NOT NULL and foreign-keyed. | `db/schema.sql:27`; `db/schema.sql:36` | schema | normal | easy |
| R-022 | A disbursement amount must be strictly positive. | `db/schema.sql:50` | schema | normal | easy |
| R-023 | A claim reference follows the form `LEI-<market>-<6 digits>`. | `db/schema.sql:35`; `db/seed.sql:12` | schema, data | normal | medium |
| R-024 | No CA claim carries a disbursement above CAD 25,000. | `db/seed.sql:35` | data | normal | hard |
| R-025 | Every claim at status `'A'` has both `authorised_at` and `authorised_by` populated; no other status does. | `db/seed.sql:12` | data | normal | medium |
| R-026 | Cheque payments occur only on non-DAS claims; DAS business is always BACS. | `db/seed.sql:33`; `db/seed.sql:34` | data | normal | hard |
| R-027 | A claim above £50,000 requires a second signature from the Claims Manager. | `docs/underwriting-wiki.md:36` | docs | dead-rule | medium |
| R-028 | Provisional cover may be granted for 14 days pending confirmation of cover. | `docs/underwriting-wiki.md:49` | docs | dead-rule | medium |
| R-029 | An ATE claim requires the solicitor's signed CFA to be uploaded before authorisation. | `docs/underwriting-wiki.md:64` | docs | dead-rule | medium |
| R-030 | A telephone contact attempt must be logged within 2 working days of receipt. | `docs/handler-guide.md:9` | docs | dead-rule | easy |

## Category counts

| Category | Count | Plan minimum | Rules |
|----------|-------|--------------|-------|
| `dark-logic` | 6 | >= 3 | R-003, R-007, R-009, R-014, R-015, R-019 |
| `dead-rule` | 5 | >= 3 | R-001, R-027, R-028, R-029, R-030 |
| `contradiction` | 4 | >= 2 | R-004, R-008, R-011, R-017 |
| `normal` | 15 | — | the remainder |
| `schema` origin | 4 | >= 2 | R-020, R-021, R-022, R-023 |
| `data` origin | 4 | >= 2 | R-023, R-024, R-025, R-026 |
| **Total** | **30** | 24–30 | |

## The four contradictions, spelled out

Extraction is expected to surface both sides of each of these, not silently pick one.

1. **R-004 — lapse window, docs vs code.** The code applies a 45-day window
   (`src/authorise-claim.ts:62`). The wiki states 30 days, plainly and
   confidently (`docs/underwriting-wiki.md:14`). Neither file hints that the
   other is wrong.
2. **R-008 — sign-off threshold, comment vs code.** The comment immediately above
   the check reads "senior sign-off required over £5,000"
   (`src/authorise-claim.ts:92`); the code beneath it tests `> 10000`. The wiki
   agrees with the code, so the comment is the only wrong source.
3. **R-011 / R-017 — panel-solicitor limit, code vs code.** `authorise-claim.ts`
   applies £2,500; `disbursements.ts` applies £5,000 to the same check. The
   payments screen was split off in 2013 and the two copies diverged. The handler
   guide documents £2,500, so the docs agree with one half of the codebase and
   not the other.

## Why R-001 is a dead rule, not dark logic

`src/authorise-claim.ts:38` handles `claim.status === 'X'`. Nothing in the module
ever writes `'X'`, and no seed row uses it — verified against `db/seed.sql`. The
branch is genuinely unreachable, which makes it the "never-executed" half of Dead
Rules rather than an undocumented live rule.

## Line-number stability

The answer key pins provenance to specific lines, so `fixtures/` is listed in the
repo-root `.prettierignore`. Reformatting this directory would shift the lines and
silently invalidate the benchmark. Do not add a `tsconfig.json` or `package.json`
here either — the fixture is read material, and pulling it into `pnpm check-types`
would mean tidying deliberately-bad code.
