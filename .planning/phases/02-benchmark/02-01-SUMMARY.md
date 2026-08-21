# Phase 2 Plan 1: Legacy Fixture Summary

**`fixtures/legacy-claims/` — a runnable legal-expenses module in deliberately legacy TypeScript, plus SQL schema, seed data and a three-years-stale wiki, carrying 30 planted rules recorded in `PLANTED.md` with line-accurate provenance**

## Accomplishments
- Two modules of valid-but-ugly TypeScript (`authorise-claim.ts`, `disbursements.ts`) — long nested functions, inline magic numbers, stringly-typed statuses, UK/CA branching, DAS/non-DAS split. Type-checks in isolation (`tsc --noEmit --skipLibCheck`, exit 0), so Phase 4 can generate real tests against it.
- All five planted categories present: 6 dark-logic rules, 5 dead rules, 4 contradictions, a genuinely unreachable branch, and a diverged duplicate.
- SQL schema carrying 4 schema-origin rules in its shape (CHECK constraints, NOT NULL + FK), and 29 seed rows carrying 4 data-origin regularities stated nowhere else.
- A wiki that reads as confidently accurate and is wrong about the lapse window, silent on every dark-logic rule, and describes four rules that no longer exist.
- `PLANTED.md`: 30 rules with statement, evidence, origins, classification and difficulty. **All 45 file+line references verified to resolve** to the content they claim.
- Root `.prettierignore` covering `fixtures/`, protecting the line numbers the answer key pins.

## Files Created/Modified
- `fixtures/legacy-claims/src/types.ts` - record shapes, with the "do not reorder" legacy warning
- `fixtures/legacy-claims/src/authorise-claim.ts` - authorisation; rules R-001..R-011
- `fixtures/legacy-claims/src/disbursements.ts` - payment run; rules R-012..R-019
- `fixtures/legacy-claims/db/schema.sql` - 3 tables; rules R-020..R-023
- `fixtures/legacy-claims/db/seed.sql` - 29 rows; rules R-023..R-026
- `fixtures/legacy-claims/docs/underwriting-wiki.md` - stale wiki; the 30-day contradiction and 3 dead rules
- `fixtures/legacy-claims/docs/handler-guide.md` - handler guide; correct overlap plus 1 dead rule
- `fixtures/legacy-claims/PLANTED.md` - the answer sheet
- `.prettierignore` - new, covers `fixtures/`

## Category counts

| Category | Count | Plan minimum |
|----------|-------|--------------|
| `dark-logic` | 6 | >= 3 |
| `dead-rule` | 5 | >= 3 |
| `contradiction` | 4 | >= 2 |
| `schema` origin | 4 | >= 2 |
| `data` origin | 4 | >= 2 |
| **Total rules** | **30** | 24-30 |

## Decisions Made
- **The dead branch is classified `dead-rule`, not `dark-logic`.** `status === 'X'` is undocumented, which looks like dark logic, but nothing writes `'X'` and no seed row uses it. Unreachable-but-present is the "never-executed" half of Dead Rules, and classifying it as dark logic would have made the Phase 5 section wrong.
- **The stale comment contradicts the code while the wiki agrees with it.** That makes R-008 a comment-vs-code contradiction with a clear right answer, rather than a three-way muddle where extraction can't be scored.
- **The handler guide documents £2,500, agreeing with `authorise-claim.ts` and not `disbursements.ts`.** The code/code divergence is therefore visible from the docs too, which is how it would surface in a real audit.
- **Split the auto-authorisation thresholds into two rules** (R-005 UK, R-006 CA) rather than one, because the extractor should be credited or penalised per market — the CA threshold is in a different currency and a different branch.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The plan's `.prettierignore` verification command was wrong**
- **Found during:** Task 1 (verification)
- **Issue:** The plan specifies `git check-ignore -v` to confirm `.prettierignore` covers the fixture. `git check-ignore` reads `.gitignore`, not `.prettierignore` — it cannot verify this, and if it *did* report a match that would mean the fixture was untracked, which is the opposite of what we want (it must be committed).
- **Fix:** Verified the real property instead, which the plan's own `<verification>` block specifies: ran `pnpm format` and confirmed `git status` shows no modification to `fixtures/`. Also confirmed `git check-ignore` exits 1 (not gitignored), so the fixture is tracked.
- **Verification:** after `pnpm format`, `fixtures/` remains `??` untracked with zero `M` entries.

### Deferred Enhancements

Logged to `.planning/ISSUES.md`:
- ISS-005: `pnpm format` reformats 81 tracked files

## Issues Encountered

**`pnpm format` rewrites the whole repo.** Running it as the plan instructed reformatted 81 pre-existing tracked files (+2954/-1522) — prettier has never been run repo-wide, and Prettier 3 defaults (`trailingComma: "all"`, different wrap points) disagree with how the source was written. The fixture itself was correctly untouched, so the line-stability check passed, but the collateral diff was reverted with `git checkout -- .` after confirming it contained nothing authored this session and was purely formatting. Logged as ISS-005 — **anyone running `pnpm format` before Phase 5's CI gates will produce an 81-file diff that buries the real change.**

## Verification Results

| Check | Result |
|-------|--------|
| `tsc --noEmit --skipLibCheck` over fixture src | **exit 0** |
| `pnpm test` (root) | **exit 0** — 54 tests, 2 tasks |
| `pnpm format` leaves `fixtures/` untouched | **yes** — `??` only, no `M` |
| `PLANTED.md` rule rows | **30** (target 24-30) |
| `PLANTED.md` file+line references resolve | **45/45** |
| Status `'X'` in seed data | **0 occurrences** |
| Status `'X'` in code | **1** (the dead branch) |
| Seed rows | **29** (target 20-30) |
| No seed row violates the £250,000 CHECK | **confirmed** |
| Fixture is not a workspace package | **confirmed** — `pnpm-workspace.yaml` globs only `apps/*`, `packages/*` |
| Fixture has no `tsconfig.json` / `package.json` | **confirmed** |

## Next Phase Readiness

The benchmark target exists and is line-stable. **Plan 02-02 (answer key in kontract form + precision/recall scoring harness) is deliberately being skipped for now** at the user's direction — the priority changed mid-phase to a demonstrable end-to-end product. `PLANTED.md` already encodes the ground truth 02-02 would have consumed, so the scoring harness can be added later without rework.

Next work is the vertical slice: `krule discover` -> `krule verify` -> `krule report` against this fixture.

---
*Phase: 02-benchmark*
*Plan: 01*
*Completed: 2026-08-21*
