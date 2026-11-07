# Vision: business truth observability

Written 2026-11-07. This widens the direction set in `BRIEF.md`; it does not replace that brief.
Phases 1–6 still deliver the legacy-code product, and Phase 7 starts the wider one.

## The thesis

Every business runs on rules, and every rule exists in three places that never fully agree:

| Layer | Where it lives | What it tells you |
|-------|----------------|-------------------|
| **Intended** | Policies, SOPs, contracts, regulations, wikis, emails | What people *think* the rule is |
| **Implemented** | Code, configs, spreadsheets, workflow tools (SAP, Salesforce, Zapier) | What the systems *enforce* |
| **Actual** | Databases, event logs, tickets, transaction history | What *really* happens |

KRule finds every rule in all three layers, links each rule's versions together, and reports where they disagree, with reproducible evidence and a figure in money or cases.

Most tools cover one or two of these layers. Process mining (for example Celonis) compares a modelled process with what actually happens. GRC tools manage written policy. Code-analysis tools read code. The three-way comparison is KRule's opening.

## Why it isn't tied to one industry

The engine has no idea what insurance is. It knows **sources** (a reader per layer) and **rules** (a kontract entry whose evidence can be a code line, a policy clause, a data query, or an event-log statistic). Insurance is only the first fixture.

Build the engine so it works for any industry. Take it to market one use case at a time.

## Use cases, in order of how sharp they are

1. **A rulebook for AI agents.** Companies are putting agents into their processes and cannot tell them the real rules. KRule produces the rulebook, with evidence for every rule, and can then check what an agent did against it. The flow is discover → hand to the agent → audit the agent.
2. **An audit before migration.** For example: "we found 30 rules your consultants missed, and 4 your code gets wrong." This is the original `BRIEF.md` product.
3. **Continuous control monitoring.** Re-run on every PR and every nightly data load, so drift in any layer raises a flag (Phase 5 does this for code; this extends it).
4. **Regulatory change impact.** When a new rule arrives (DORA, the EU AI Act, a pricing directive), KRule answers which of our rules it touches and where each is enforced.

## Source readers to build after code

| Source | Layer | Notes |
|--------|-------|-------|
| Policy and SOP documents (Markdown, PDF, DOCX) | intended | Evidence is a clause reference. Phase 7. |
| Event logs (CSV, XES / OCEL) | actual | Evidence is a reproducible query plus its figure. Phase 7. |
| Spreadsheets | implemented | Formulas are code. In finance and pricing this is the biggest pile of legacy logic. |
| Database contents | actual | Rules inferred from the data itself: "99.2% of X do Y, here are the 31 exceptions". |
| Workflow tools and configs | implemented | SAP customising, Salesforce flows, Zapier. Later. |
| Tickets and email | intended / actual | Noisy. Treat as supporting evidence only. |

## Principles that carry over

- **No rule without evidence.** A finding from the data carries the query that produced it, so anyone can re-run it.
- **Say when there is no evidence.** "We could not observe this" is a valid result. Reporting a breach without evidence is fabrication (see F-10 in the ops fixture).
- **Measure before claiming.** Every new layer gets a fixture with planted findings and an answer sheet, written before the extractor exists, the same way Phase 2 was done.
- **Customer data stays put.** Readers run where the data lives. Models go through the provider interface (Anthropic, Bedrock, Vertex, others; see `phases/02-benchmark/MODEL-CHOICE.md`).
