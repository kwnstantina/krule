# KRule — Business Logic Observability

**One-liner**: Extract a company's business logic from its real systems (code + schema + data + docs), verify each rule against the code with generated tests, keep it true as the code changes, and — when ready — migrate rules into explicit execution on the existing KRule engine.

## Problem

In legacy financial systems, the real business rules live scattered across 15-year-old code, database conventions, and stale wikis — no one can reliably answer "what does this system actually do." Documentation drifts from reality, and compliance regimes (DORA Art. 8, Solvency II) now demand documentation that is current and provable. Today that gap is closed by €1–5M / 18-month manual consulting engagements. KRule collapses that into a repeatable, verifiable, read-only extraction.

## Starting point (existing code)

- `krule` monorepo (pnpm + Turborepo, Next.js 15, TS). `@repo/core` is a working rule evaluation engine → it becomes the **Runtime** layer, reused as-is.
- Existing Groq-based AI features are unrelated to this initiative and stay untouched.
- `kontract` does **not** exist yet — its schema, CLI, MCP server and CI templates are all new work here.

## Success Criteria

- [ ] `krule discover <module>` produces `rules.kontract.yaml` — every rule in plain language with provenance (file, line, commit) and a confidence score
- [ ] Every rule carries a generated executable test run against real code; status is `verified | unverified | contradicted | drifted` and shown differently in the report
- [ ] The command emits an `audit-report.html` with four sections: Rule Inventory, Contradiction Report, Dark Logic (code-only rules), Dead Rules (doc-only / never-executed)
- [ ] A PR that changes a rule triggers a correct drift flag in CI ("this PR changes rule R-114 …")
- [ ] Extraction matches a written ground-truth answer key ≥80% on a benchmark module
- [ ] One rule family is migrated to the KRule Runtime engine with Verify-proven input/output equivalence

## Constraints

- Build **inside the krule monorepo** as new packages (`@repo/kontract`, `@repo/discover`, `@repo/verify`, a CLI app); extend `@repo/core` only as the Runtime target
- LLM = **Claude (Anthropic, 1M-token context)**, provider-abstracted so on-prem Bedrock / Vertex / customer API keys can slot in later
- Extraction is **read-only** against target systems; runs **on-prem** — only the report leaves. No rule enters the model without a code reference + generated test
- TypeScript throughout; a real test runner must be added (the repo currently has none)

## Out of Scope

- All GTM: pricing, prospect lists, sales pitches, revenue model (strategy doc keeps those, not the plan)
- SaaS dashboard, user accounts, multi-tenant hosting
- On-prem deployment packaging and DORA-formatted report pack (buildable later; deferred)
- The live ARAG data benchmark — we prove the engine on a **synthetic fixture** first, wire ARAG (`Claims.BE`, `CLM.Disbursements`) in afterward
- Rewriting the existing rule engine or the Groq AI features
