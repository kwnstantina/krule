# Issues

Deferred enhancements and redesign candidates surfaced during execution.

Per the deviation rules, bugs / missing-critical gaps / blockers are fixed in-flight and
recorded in the relevant SUMMARY.md. Only nice-to-haves and deliberate "not now" calls
land here.

| # | Found in | Issue | Why deferred |
|---|----------|-------|--------------|
| ISS-001 | 01-01 Task 3 | `pnpm lint` exits 1. `apps/docs` and `apps/web` carry pre-existing `react/no-unescaped-entities` and `react/jsx-no-target-blank` warnings, which `next lint --max-warnings 0` treats as failures. Roughly 20 in `apps/docs/app/docs/**` alone. | Pre-existing and unrelated to this initiative — proven by reproducing against the stashed tree. Fixing it means editing UI copy across many doc pages, which is scope creep. Worth doing before CI gates land in Phase 5, since a permanently-red lint makes the drift check's signal harder to trust. |
| ISS-003 | 01-02 Task 1 | `executeRules` shared-target priority is inverted. It sorts by `priority` desc then `results.set(target, …)`, so a later `set` overwrites an earlier one and the **lowest**-priority matching rule wins the final value for a shared target. Pinned by a characterization test, not fixed. | Changing it alters evaluation semantics the web UI and Groq-generated rules were authored against, with no test coverage on those paths to catch a regression. It is also a product question (does priority mean "wins the target" or "evaluated first"?). **Must be decided before Phase 6 plans are written** — if the legacy system resolves conflicts highest-priority-wins, the equivalence proof will fail on shared-target cases and look like a translation bug rather than an engine mismatch. |
| ISS-002 | 01-01 Task 3 | `pnpm build` exits 2. `@repo/ai-sdk` fails with `TS2307: Cannot find module '@repo/core/evaluators'`. Cause: `packages/ai-sdk/tsconfig.json` sets `moduleResolution: node` (node10), which cannot read `exports` maps, and `@repo/core` publishes its `./evaluators` subpath *only* via `exports` — no `typesVersions`, no root `.d.ts`. | Pre-existing — identical errors reproduce against the committed tree with all session changes stashed. The fix is a one-line `moduleResolution` change in `ai-sdk`, but it touches a package outside Phase 1 and should be verified against the app builds that consume it. Revisit before Phase 6, which puts real weight on `@repo/core`'s public surface. |
