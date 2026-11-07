# Planted findings: `legacy-claims-ops` three-layer fixture

This fixture extends `legacy-claims` from code to the whole business. Each rule
can be seen in three layers, and the findings are the places where those layers
disagree.

| Layer | Question | Source in this fixture |
|-------|----------|------------------------|
| **Intended** | What should happen? | `policy/claims-authority-policy.md` (CAP-003 v3.1) |
| **Implemented** | What do the systems enforce? | `../legacy-claims/src/**`, `../legacy-claims/db/**` (unchanged, see its PLANTED.md for the R-ids) |
| **Actual** | What really happened? | `events/claim-events.csv`: 400 claims and 2,893 events, Jan 2024 – Feb 2026 |

`legacy-claims` stays frozen. Its answer key pins line numbers, and `apps/web`
reads it. This fixture only adds layers next to it.

Every figure below is recomputed from the CSV by
`packages/benchmark/src/ops-findings.ts` and pinned in `ops-fixture.test.ts`. If
you regenerate the log (`pnpm --filter @repo/benchmark generate-ops-events`),
update the figures here and in that test together.

Money totals cover UK (GBP) claims only, so currencies are never summed together.

## Gap types

| Gap type | Meaning | Why a buyer cares |
|----------|---------|-------------------|
| `intended≠implemented` | Policy and system disagree | Systems enforce the wrong rule |
| `implemented≠actual` | The system rule is bypassed in practice | Control failure; audit finding |
| `intended≠actual` | Policy is not followed, with no system control in the way | Operational or compliance breach |
| `manual-control` | Policy rule absent from code, but people enforce it by hand, mostly | Fragile control; automation candidate |
| `undocumented` | Code and data agree; policy is silent | Dark logic, now confirmed live |
| `shadow` | Visible only in data. No policy, no code. | Tribal knowledge; key-person risk |
| `consistent` | All three agree | Control case: must **not** be flagged |
| `unobservable` | Policy rule with no code and no data to check it | The honest answer is "no evidence", not "breach" |

## The findings

| id | rule | intended | implemented | actual (from the log) | gap type |
|----|------|----------|-------------|-----------------------|----------|
| F-01 | Lapsed-cover window | §2.1: 30 days | 45 days (R-004) | **11** UK claims with lapse 31–45 days were authorised, total **£174,273** | `intended≠implemented` |
| F-02 | Senior sign-off over £10,000 | §3.2: no exceptions, incl. batch users | `> 10000` (R-008) | **7** UK claims over £10,000 authorised by `ops-batch` via `manual_override` with no sign-off, total **£391,808** | `implemented≠actual` |
| F-03 | Second signature over 50,000 | §3.4: Claims Manager | nowhere (R-027, dead rule) | **51 of 59** authorised claims over 50,000 carry a `second_signature` by H1. **8** lack it, **5** of them through the override path. | `manual-control` |
| F-04 | Panel solicitor for disbursements over £2,500 | §4.1: £2,500 | £5,000 in `disbursements.ts` (R-017) | **3** UK disbursements of £2,500–£5,000 paid on off-panel non-DAS files, total **£10,107** | `intended≠implemented` |
| F-05 | First contact within 2 working days | §5.1 | nowhere (R-030, dead rule) | **162 of 400** claims (40.5%) breached it; median delay 2 working days | `intended≠actual` |
| F-06 | Automatic authorisation below £1,000 / CAD 750 | §3.1 | R-005, R-006 | **42** claims auto-authorised, all within the limits | `consistent` |
| F-07 | Friday BACS cutoff at 12:00 | §4.3 says 15:00, silent on Fridays | 12:00 on Fridays (R-019, dark logic) | **21** Friday BACS payments submitted 12:00–15:00 were value-dated the next working day | `undocumented` |
| F-08 | BR0042 claims reassigned to the most senior handler | nothing | nothing | **20 of 20** authorised UK BR0042 claims were first `reassigned` to H1 | `shadow` |
| F-09 | December budget freeze | §6.1: 10 working days, all year round | nothing | **0 of 37** December-received claims were authorised before January | `intended≠actual` (shadow practice) |
| F-10 | Complaints acknowledged within 5 working days | §5.2 | nothing | no complaint events exist in the log | `unobservable` |
| F-11 | BR0388 on the referral watchlist | §3.3 lists 4 brokers | the code's list has only 3, without BR0388 (R-009) | **21** BR0388 claims of 10,000 or less authorised with no sign-off | `intended≠implemented` |
| F-12 | Counsel fee cap | §4.2: £4,000, handler notified | £3,500, silent (R-015) | **17** UK counsel fees of £3,500–£4,000 cut to £3,500, a shortfall of **£4,962**; no handler notification event exists | `intended≠implemented` |

## Scoring intent (Phase 7)

A three-layer run should report each finding with:

1. **The gap type** from the table above.
2. **Evidence from each layer it involves:** a policy clause, a code location and
   a figure from the data that someone can reproduce.
3. **The figure itself**, to within rounding.

The two control cases matter as much as the hits. Flagging F-06 as a problem is a
false positive. Reporting F-10 as "breached" instead of "no evidence" is a
fabrication, and it counts against precision.

## Deliberate limits

- One synthetic organisation, generated by a seeded script. Patterns are cleaner
  than real logs; Phase 7's real-data run is where noise gets tested.
- Thresholds on CA claims compare the raw CAD amount, as the legacy code does.
  F-03 counts both markets for that reason.
