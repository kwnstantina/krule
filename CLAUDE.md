# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What KRule is

KRule is a visual rule-engine builder: a pure TypeScript evaluation engine plus a Next.js UI for creating, testing, and exporting business rules — with an AI layer that turns natural-language prompts into validated rules via Groq (Llama 3.3). It is a **pnpm + Turborepo monorepo** (two Next.js 15 apps, six shared packages). Node >= 18, pnpm 9.

## Commands

Run from the repo root unless noted. Turbo fans tasks out across the workspace.

| Command | What it does |
|---------|--------------|
| `pnpm install` | Install the whole workspace |
| `pnpm dev` | Run **both** apps with hot reload — `web` on :3000, `docs` on :3001 (Turbopack) |
| `pnpm build` | Build all packages + apps |
| `pnpm lint` | ESLint across the workspace (apps run `next lint --max-warnings 0`) |
| `pnpm check-types` | `tsc --noEmit` across the workspace |
| `pnpm format` | Prettier over `**/*.{ts,tsx,md}` |

Scope to one workspace with `--filter`:
```bash
pnpm --filter web dev            # rule builder only (:3000)
pnpm --filter docs dev           # docs site only (:3001)
pnpm --filter @repo/core build   # tsc build of one package
```

Database (Prisma / PostgreSQL) — scripts live in `packages/database`:
```bash
docker-compose up -d                       # Postgres on :5432 (+ pgAdmin :5050)
pnpm --filter @repo/database db:generate   # regenerate Prisma client (run after schema edits)
pnpm --filter @repo/database db:push       # push schema.prisma to the DB (no migration files)
pnpm --filter @repo/database db:studio     # Prisma Studio
```

**No automated test runner is configured** — there is no `test` script and no test task in `turbo.json`. "Testing" in the README/docs means manual testing in the UI or ad-hoc `executeRules(...)` scripts. Don't tell the user `pnpm test` exists; if they need real tests, a runner has to be added first.

## Environment setup (required for the AI features)

The AI features need a Groq key and a Postgres URL, and they must be present in **two** places (the root `.env` for Prisma/CLI, and `apps/web/.env.local` for the running Next app):
```
GROQ_API_KEY=gsk_...
DATABASE_URL=postgresql://postgres:password@localhost:5432/krule
```
The engine (`@repo/core`) and the UI's manual rule builder work without either; only the `/api/ai/*` routes and the DB writes require them. See `AI_FEATURES_SETUP.md`, `AI_SETUP.md`, `DATABASE_SETUP.md`.

## Architecture — two independent layers

### 1. The rule engine (`@repo/core`, framework-agnostic)
- `packages/core/src/types.ts` — the **single source of truth**. Zod schemas (`RuleSchema`, `ConditionSchema`, `ConditionGroupSchema`) with types inferred from them. A `Rule` = `{ priority, condition: ConditionGroup, actions: Action[] }`; conditions nest via `ConditionGroup` (`AND/OR/XOR/NAND/NOR`) containing leaf `Condition`s (`==`, `!=`, `>`, `<`, `>=`, `<=`, `in`, `not`).
- `packages/core/src/evaluator.ts` — `executeRules(rules, context)` sorts by `priority` desc and returns a `Map<target, {type, payload}>`; `evaluateCondition`, `registerOperator`, `getOperator`.
- Exported **only** via the `./evaluators` subpath: `import { executeRules, Rule, RuleSchema } from "@repo/core/evaluators"`.

### 2. The AI layer (Groq → service → API routes → Prisma)
Natural language becomes a validated `Rule` through this chain:
```
UI (AIAssistant / chat components)
  → apps/web/app/api/ai/{generate,chat,explain,validate,test-scenarios,conversations}/route.ts   (Next route handlers)
    → @repo/ai-service (RuleGenerator, RuleExplainer, Validator, TestGenerator, ContextManager)
      → GroqClient (packages/ai-service/src/groq-client.ts, model llama-3.3-70b-versatile)
    → @repo/database (Prisma singleton `db`) persists rules / conversations / usage
```
- **Self-correcting generation loop** (`packages/ai-service/src/rule-generator.ts`): calls Groq → `extractJSON` strips markdown fences → `RuleSchema.parse`. On a `ZodError` it feeds the validation errors back into the prompt and retries, up to `maxRetries` (default 3). Prompts live in `packages/ai-service/src/prompts.ts` — edit these to change AI behavior.
- **`@repo/ai-sdk`** (`packages/ai-sdk/src/client.ts`) is a standalone HTTP client (`KRuleAI`) that hits the deployed `/api/ai/*` endpoints — it is the external/programmatic entry point, separate from `@repo/ai-service` (which runs *inside* the routes).

### 3. The kontract layer (`@repo/kontract`) — canonical extracted-rule format

Added by the **Business Logic Observability** initiative (see `.planning/BRIEF.md` and `.planning/ROADMAP.md`). This is the format for `rules.kontract.yaml`, the artifact that initiative is built around: Discover writes it, Verify annotates it, the audit report renders it, and CI diffs it for drift.

- `packages/kontract/src/schema.ts` — Zod schemas, types inferred from them. A `KontractRule` = `{ id, statement, provenance[], confidence, origins[], status, tags?, notes? }`. `id` must match `R-<digits>`. `status` is one of `verified | unverified | contradicted | drifted` and **defaults to `unverified`** — nothing is trusted until Verify proves it. `origins` (`code | schema | data | docs`) is what the audit report's Dark Logic (code-only) and Dead Rules (docs-only) sections derive from. A `KontractDocument` wraps `{ kontractVersion: 1, module, generatedAt, commit, rules[] }` and rejects duplicate rule ids.
- `packages/kontract/src/io.ts` — `parseKontract` / `serializeKontract` / `readKontractFile` / `writeKontractFile`, plus `updateRuleStatuses`. **Use `updateRuleStatuses` for in-place status rewrites**, not parse → mutate → serialize: it edits the YAML AST so reviewer comments survive, whereas the plain-object round trip discards every comment in the file.
- `ZodError`s are deliberately left to propagate from `parseKontract` — the AI generation loop feeds them back into the prompt to retry, so swallowing them breaks self-correction.
- Distinct from `@repo/core`'s `RuleSchema`: a kontract rule is a *documented, evidenced* business rule in plain language; a core `Rule` is an *executable* one. Phase 6 links them; there is intentionally no executable-rule field on `KontractRule` yet.

### Apps
- `apps/web` — the rule builder (:3000). `app/page.tsx` just renders `RuleBuilder`; the UI is tabbed (AI Assistant, build, test, export) under `app/components/`. All AI backend logic is in `app/api/ai/`.
- `apps/docs` — Next.js documentation site (:3001). Content-only; does **not** depend on `core`/`ai-service`/`database` (only `@repo/ui`).

## Conventions and gotchas specific to this repo

- **Workspace packages export raw `.ts` source**, not built `dist/`. Their `main`/`exports` point at `src/*.ts` (`@repo/core` → `./src/evaluators.ts`, `@repo/ai-service`/`@repo/database`/`@repo/ui` → `./src/index.ts`). The Next apps compile them directly (`next.config.js` is empty — no `transpilePackages` needed). The `build`/`dev` (`tsc`) scripts on `core`/`ai-service` emit `dist/` but that output is **not** what the apps consume, so you rarely need to build a package to see changes in `pnpm dev` — just edit the source.
- **After editing `packages/database/prisma/schema.prisma`**, run `db:generate` (client is stale otherwise) and `db:push`. There are **no migration files** — `db push` is the schema-sync mechanism here.
- **Prisma client is a singleton** exported as `db` from `@repo/database`; import that, don't `new PrismaClient()`.
- **API route pattern**: route handlers validate the body, instantiate the service with `process.env.GROQ_API_KEY`, and wrap DB writes (`generatedRule`, `apiUsage`, etc.) in `try/catch` that logs and continues — DB failures must not fail the AI request. New AI endpoints should follow this and include an `OPTIONS` CORS handler.
- **The evaluator is correct as of Phase 1 Plan 02** (`.planning/phases/01-foundation/01-02-SUMMARY.md`). Two long-standing bugs were fixed and are covered by tests in `packages/core/src/evaluator.test.ts`: `evaluateCondition` now recurses into nested `ConditionGroup`s (mapping children to booleans before applying the group operator), and group operators resolve through `getOperator`, so operators registered via `registerOperator` actually run. Unknown operators throw descriptive errors instead of an opaque `TypeError`. Earlier notes in this file described these as known bugs — that is no longer accurate.
- **One characterization quirk remains in `executeRules`, deliberately unchanged.** It sorts by `priority` **desc** and then `results.set(action.target, …)` in that order, so when two matching rules write the *same* target, the **lowest**-priority rule wins the final value. That is the opposite of what "priority" normally implies. It is pinned by a test (`lets the lowest-priority matching rule win a shared action target`) rather than fixed, because changing it would alter evaluation semantics the existing UI and AI-generated rules already depend on. Decide deliberately before changing it.
- **Package naming**: internal packages are scoped `@repo/*`; the two apps are unscoped (`web`, `docs`). Shared config lives in `@repo/eslint-config` and `@repo/typescript-config` — each package's `eslint.config.js` / `tsconfig.json` extends these.
