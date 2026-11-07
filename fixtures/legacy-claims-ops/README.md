# legacy-claims-ops: three-layer benchmark fixture

The same fictional claims business as `../legacy-claims`, seen through two more
layers:

- `policy/claims-authority-policy.md` holds the **intended** rules: a formal
  authority policy, the way a compliance team would write it.
- `events/claim-events.csv` holds the **actual** behaviour: a process-mining
  style event log (`case_id`, `activity`, `timestamp`, `actor`, …) for 400
  claims.

The **implemented** layer is the code and schema in `../legacy-claims`, which
this fixture does not copy or change.

`PLANTED.md` is the answer sheet: 12 findings across eight gap types, including
two control cases that must *not* be flagged.

The event log is generated. Do not edit it by hand:

    pnpm --filter @repo/benchmark generate-ops-events

`fixtures/` is excluded from Prettier. Keep it that way, because the policy
clause numbers and the CSV are cited as evidence.
