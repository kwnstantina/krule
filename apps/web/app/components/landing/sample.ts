/**
 * Real output from `krule demo fixtures/legacy-claims`, trimmed for the landing
 * page. Demo mode reads extraction from the answer key, but the statuses come
 * from the real Verify step re-reading the fixture source.
 */
export type Status = "verified" | "contradicted" | "drifted" | "unverified";

export interface SampleRule {
  id: string;
  statement: string;
  status: Status;
  citations: string[];
  finding?: string;
  tag?: string;
}

export const SAMPLE_MODULE = "legacy-claims";

export const SAMPLE_COUNTS: Record<Status, number> = {
  verified: 15,
  contradicted: 1,
  drifted: 0,
  unverified: 14,
};

export const SAMPLE_RULES: SampleRule[] = [
  {
    id: "R-004",
    statement: "A claim is rejected if the policy lapsed more than 45 days before the incident date.",
    status: "contradicted",
    citations: ["src/authorise-claim.ts:62", "docs/underwriting-wiki.md:14"],
    finding: "code applies 45 but the wiki states 30",
  },
  {
    id: "R-007",
    statement: "A CA claim held by a handler below seniority 3 requires sign-off whatever the claim is worth.",
    status: "verified",
    citations: ["src/authorise-claim.ts:84"],
    tag: "dark logic: in code, in no document",
  },
  {
    id: "R-006",
    statement: "CA claims with a settlement estimate below CAD 750 are auto-authorised without handler involvement.",
    status: "verified",
    citations: ["src/authorise-claim.ts:77", "docs/underwriting-wiki.md:30"],
  },
  {
    id: "R-001",
    statement: "A claim at status 'X' is routed to the legacy reconciliation queue and left pending.",
    status: "unverified",
    citations: ["src/authorise-claim.ts:38"],
    finding: "qualitative rule: needs a generated test",
  },
];
