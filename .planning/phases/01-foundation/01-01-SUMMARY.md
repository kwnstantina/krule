# Phase 1 Plan 1: Test Runner Summary

**Vitest 3.2.7 wired into Turborepo with `@repo/core` as first consumer — `pnpm test` passes and caches, but requires Node 20 which is not the machine's active version**

## Accomplishments
- `pnpm test` runs from the repo root, fans out through Turbo, exits 0, and reports `FULL TURBO` on a repeat run
- `@repo/core` has a passing test file (2 real assertions) and a non-watch `test` script
- `@repo/core` is now in the `check-types` graph for the first time (3 → 4 tasks), so test-file types are actually checked
- Established that two root verification commands (`pnpm lint`, `pnpm build`) were **already failing before this work** — proven, not assumed

## Files Created/Modified
- `package.json` - added `test: turbo run test` script and `vitest ^3.2.7` devDependency
- `turbo.json` - added `test` task with `outputs: []` and deliberately no `dependsOn: ["^build"]`
- `packages/core/package.json` - added `test` and `check-types` scripts, `vitest` devDependency
- `packages/core/vitest.config.ts` - new; `src/**/*.test.ts`, node environment
- `packages/core/src/evaluator.test.ts` - new; smoke tests for `executeRules` (empty-rules result, non-mutation of caller's array)
- `packages/core/tsconfig.json` - excluded `src/**/*.test.ts` and `vitest.config.ts` from the build
- `packages/core/tsconfig.test.json` - new; `noEmit` config that *includes* tests, for `check-types`

## Decisions Made
- **Vitest 3, not 4** — reverted to the version the plan specified after 4 failed (see deviations). The plan was right.
- **Two tsconfigs in `@repo/core`** rather than one. `tsconfig.json` excludes tests so `build` does not emit them into `dist`; `tsconfig.test.json` includes them so `check-types` still validates them. A single config cannot do both, since `build` and type-check share it.
- **No placeholder `test` scripts** added to packages that have no tests. Turbo resolves the task for all 10 workspaces but only runs the one that defines a script, which is the desired behavior.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Node 16.14.0 active; repo requires >=18 — WORKAROUND ONLY, NEEDS USER ACTION**
- **Found during:** Task 2 (first test run)
- **Issue:** `node --version` is v16.14.0 from `C:\Program Files\nodejs`. The repo's own `engines` field requires `>=18`, pnpm warns `Unsupported engine`, and Vitest failed at startup with `SyntaxError: The requested module 'node:util' does not provide an export named 'styleText'`. Node 16 has been EOL since September 2023.
- **Fix:** nvm-windows already has **20.20.2 and 18.18.0 installed** — they are just not active. All execution and verification for this plan ran under a session-scoped `PATH` override to `%APPDATA%\nvm\v20.20.2`.
- **NOT FULLY RESOLVED:** switching globally requires `nvm use 20.20.2`, which needs admin elevation and changes Node machine-wide for every repo in the workspace. That is the user's call, so it was left undone. **Until it is done, `pnpm test` will fail in a normal shell.**
- **Verification:** `node --version` → v20.20.2 under the override; all tests pass
- **Commit:** see below

**2. [Self-inflicted, corrected] Installed Vitest 4 instead of the planned `^3`**
- **Found during:** Task 1 (install)
- **Issue:** `pnpm add -Dw vitest` resolved to 4.1.10. Vitest 4 builds on rolldown, whose native binding failed to load (`MODULE_NOT_FOUND` on `binding-TuFFIE_J.mjs`) even under Node 20.
- **Fix:** Pinned `vitest@^3` → 3.2.7, which uses esbuild and has no native binding. The plan specified `^3`; deviating from it caused the failure.
- **Files modified:** `package.json`, `packages/core/package.json`, `pnpm-lock.yaml`
- **Verification:** `pnpm --filter @repo/core test` → 2 passed

**3. [Rule 1 — Bug, self-introduced] `tsc` emitted test artifacts into the published build**
- **Found during:** Task 3 (verification)
- **Issue:** `packages/core/tsconfig.json` has `include: ["src"]`, so adding `src/evaluator.test.ts` made `pnpm --filter @repo/core build` emit `dist/evaluator.test.js`, `.d.ts` and `.d.ts.map` — shipping tests as package output.
- **Fix:** Added `src/**/*.test.ts` and `vitest.config.ts` to the tsconfig `exclude`; deleted and rebuilt `dist`.
- **Verification:** `ls packages/core/dist/` now shows only `evaluator`, `evaluators`, `types` artifacts
- **Note:** `target: es5` and `moduleResolution: node` were left untouched, as the plan required.

**4. [Rule 2 — Missing critical] The exclude in fix #3 left test files type-checked by nothing**
- **Found during:** Task 3 (verification)
- **Issue:** `@repo/core` had no `check-types` script, so it was absent from the root `check-types` graph. Its test file's types had been covered incidentally by `build` — and fix #3 removed that. Net effect: zero type coverage on tests, right as Plan 01-02 is about to add many more.
- **Fix:** Added `packages/core/tsconfig.test.json` (extends the build config, `noEmit`, includes tests) and a `check-types: tsc -p tsconfig.test.json` script.
- **Verification:** `pnpm check-types` went from 3 to 4 tasks and exits 0

### Deferred Enhancements

Logged to `.planning/ISSUES.md`:
- ISS-001: `pnpm lint` fails on pre-existing warnings in `apps/docs` / `apps/web`
- ISS-002: `pnpm build` fails — `@repo/ai-sdk` cannot resolve `@repo/core/evaluators`

---

**Total deviations:** 4 auto-fixed (1 blocking with an outstanding user action, 1 self-inflicted correction, 1 bug, 1 missing critical), 2 deferred
**Impact on plan:** No scope creep. Fixes 3 and 4 were both cleanup of problems this plan itself introduced. Deviation 1 is an environment constraint that outlives this plan.

## Verification Results

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm test` (root) | **exit 0** | 1 task, 2 tests passing |
| Turbo cache on repeat | **FULL TURBO** | 534ms, 1 cached |
| `pnpm check-types` | **exit 0** | 4 tasks, now including `@repo/core` |
| `pnpm lint` | **exit 1** | Pre-existing, unrelated — see ISS-001 |
| `pnpm build` | **exit 2** | Pre-existing, unrelated — see ISS-002 |

The plan listed `pnpm lint` as a required check. It does not pass, and it did not pass
before this work either. Both failures were **proven** pre-existing by stashing all
changes (`git stash -u`) and reproducing the identical errors against the committed tree.
Neither is in this plan's scope; fixing them would be unrelated scope creep.

## Issues Encountered
- The Node/Vitest interaction cost the most time: Node 16 masked the real problem, and once
  Node 20 was in play the Vitest 4 rolldown binding surfaced as a second, unrelated failure.
  Diagnosing them in sequence rather than assuming a single cause was what resolved it.

## Next Phase Readiness

**Ready for `01-02-PLAN.md`** (evaluator fix, test-first). The harness it needs exists, and
test-file types are checked, which matters because 01-02 adds substantially more tests.

**One blocker for the user, not for the next plan:** run `nvm use 20.20.2` (needs admin) to
make Node 20 the default. Until then every test run needs the session PATH override, and
`pnpm dev` is also unsupported on Node 16 — Next.js 15 requires 18.18+.

---
*Phase: 01-foundation*
*Plan: 01*
*Completed: 2026-07-26*
