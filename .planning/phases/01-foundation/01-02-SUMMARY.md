# Phase 1 Plan 2: Evaluator Fix Summary

**`evaluateCondition` now recurses into nested condition groups and dispatches registered custom operators — 20 tests, up from 2, with the two silent-wrong-answer bugs gone**

## Accomplishments
- Nested `ConditionGroup`s are genuinely evaluated: children are mapped to booleans before the group operator is applied. Verified to four levels of nesting.
- Custom operators registered via `registerOperator` actually run — group operators now resolve through `getOperator`, which consults the custom map before the built-ins.
- Unknown operators throw descriptive errors (`Unknown group operator: MAYBE`, `Unknown condition operator: ≈`) instead of an opaque `TypeError: groupOperators[groupOperator] is not a function`.
- All five group operators (AND/OR/XOR/NAND/NOR) are covered with real leaf conditions, plus their empty-group semantics pinned deliberately.
- `RuleSchema.parse` → `executeRules` is covered end to end through the public `./evaluators` subpath, proving schema and evaluator agree — which Phase 3's Discover output depends on.
- All `as any` casts removed from `evaluateCondition`.

## Files Created/Modified
- `packages/core/src/evaluator.ts` - recursion, operator dispatch, error paths; typed `ComparisonOperator` / `GroupOperator`; declaration order reordered so `customOperators` and `getOperator` precede their use
- `packages/core/src/evaluator.test.ts` - 2 → 20 tests
- `CLAUDE.md` - replaced the "README oversells current behavior" known-bugs note, which is now false, with the current state plus the outstanding `executeRules` quirk

## Decisions Made
- **Typed the operator maps as `Record<string, ComparisonOperator>` / `Record<string, GroupOperator>`** instead of relying on `keyof typeof` lookups. With `noUncheckedIndexedAccess` on (from the shared base config), indexed access yields `T | undefined`, which is what forces the explicit guards that produce the descriptive errors. The old code cast the result with `as any` and lost that safety.
- **Moved `customOperators`, `registerOperator` and `getOperator` above `evaluateCondition`.** Previously `evaluateCondition` was defined before the `const customOperators` it now depends on. That only worked because calls happen after module init; reading top-down removes the temporal-dead-zone hazard. Not a redesign — same exports, same signatures.
- **Left the `executeRules` shared-target priority behavior alone** (see below).

## Deviations from Plan

**None — plan executed as written.** The plan anticipated the shared-target priority question and instructed pinning rather than fixing it; that is what happened.

## RED → GREEN Evidence

Tests were written first and observed failing. Before the fix: **11 failed, 9 passed (20 total)**.

Failing tests at RED:
```
evaluateCondition — leaf conditions > throws a descriptive error for an unsupported comparison operator
evaluateCondition — group operators > AND is true only when every condition holds
evaluateCondition — group operators > OR is true when at least one condition holds
evaluateCondition — group operators > XOR is true only when exactly one condition holds
evaluateCondition — group operators > NAND is the negation of AND
evaluateCondition — group operators > NOR is the negation of OR
evaluateCondition — group operators > throws a descriptive error for an unregistered group operator
evaluateCondition — nested groups > recurses ... returns false when the nesting resolves false
registerOperator > dispatches a registered custom group operator
registerOperator > receives evaluated booleans, not raw condition objects
public entry point > does not fire a schema-validated rule whose nested condition fails
```

Representative RED output confirming Bug 2 at the exact line the plan predicted:
```
TypeError: groupOperators[groupOperator] is not a function
 ❯ evaluateCondition src/evaluator.ts:36:40
    36|     return groupOperators[groupOperator](conditions);
```

Note how the old code failed: `AND` and `OR` returned `true` for any non-empty group and
`NAND`/`NOR` returned `false`, so a rule with nested conditions fired based on how many
conditions it had rather than what they said. The `public entry point` failure is the
clearest demonstration — a rule requiring `temp < 0` against a context of `temp: 30` fired
anyway (`expected 1 to be +0`).

After the fix: **20 passed, 0 failed**.

## The `executeRules` priority quirk — pinned, not fixed

`executeRules` sorts descending by `priority`, then calls `results.set(action.target, …)`
inside the loop. A later `set` overwrites an earlier one, so when two matching rules write
the **same** target, the **lowest**-priority rule determines the final value — inverted
from the normal meaning of priority.

This is now locked by the test `lets the lowest-priority matching rule win a shared action
target`, which asserts the current behavior with an explanatory comment.

**Why not fixed here:** it changes evaluation semantics rather than correcting an internal
defect. The web UI and the Groq-generated rules in `@repo/ai-service` were authored against
today's behavior, so flipping it could silently change outcomes with no test coverage on
those paths to catch it. It is also a genuine product question — whether priority should
mean "wins the target" or "evaluated first" — not an implementation detail.

**Why it matters downstream:** Phase 6 translates a rule family onto this engine and proves
input/output equivalence against the legacy code path. If the legacy system resolves
conflicts highest-priority-wins (the common convention), equivalence will fail on exactly
these shared-target cases, and it will look like a translation bug rather than an engine
semantics mismatch. Worth resolving before Phase 6 plans are written.

Logged as ISS-003.

## Verification Results

| Check | Result |
|-------|--------|
| `pnpm test` (root) | **exit 0** — 20 tests passing |
| `pnpm check-types` | **exit 0** — 4 tasks |
| `as any` in `evaluateCondition` | **none** |
| Nesting depth verified | **4 levels** |
| Custom operator proven to execute | **yes** — plus a test asserting it receives `[true, false]`, not raw objects |
| `pnpm lint` | **exit 1** — pre-existing, unrelated (ISS-001) |
| `pnpm build` | **exit 2** — pre-existing, unrelated (ISS-002) |

ISS-001 and ISS-002 were proven pre-existing during 01-01 by reproducing them against the
stashed tree. Neither is touched by this plan.

## Issues Encountered
- None. The plan's documented failure analysis matched the observed RED output exactly,
  including the predicted line number.

## Next Phase Readiness

**Ready for `01-03-PLAN.md`** (`@repo/kontract`). `@repo/core` can now honestly be described
as a working rule engine, which is what Phase 6's equivalence proof rests on.

**One decision to make before Phase 6 is planned:** the shared-target priority semantics
above (ISS-003).

---
*Phase: 01-foundation*
*Plan: 02*
*Completed: 2026-07-26*
