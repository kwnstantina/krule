import type { KontractDocument, KontractRule, RuleStatus } from "@repo/kontract";

/**
 * A verdict as produced by `@repo/verify`, narrowed to what the report needs.
 * Declared structurally rather than imported so `@repo/report` can render a
 * kontract that has never been verified.
 */
export interface ReportVerdict {
  id: string;
  status: RuleStatus;
  reason: string;
}

export interface ReportSections {
  inventory: KontractRule[];
  contradictions: KontractRule[];
  darkLogic: KontractRule[];
  deadRules: KontractRule[];
  counts: Record<RuleStatus, number>;
  reasons: Map<string, string>;
}

/**
 * Dark Logic: the rule is in the code and the documentation says nothing.
 *
 * Derived from `origins` rather than from a flag the model set, which is why
 * `origins` had to exist on `KontractRule` from the start.
 */
export function isDarkLogic(rule: KontractRule): boolean {
  const hasImplementation = rule.origins.some(
    (origin) => origin === "code" || origin === "schema" || origin === "data",
  );
  return hasImplementation && !rule.origins.includes("docs");
}

/**
 * Dead Rules: the documentation describes it and nothing implements it.
 *
 * The other half — a rule implemented in a branch that can never execute — is
 * reported by Verify, because reachability is not visible in `origins`.
 */
export function isDeadRule(rule: KontractRule): boolean {
  return rule.origins.length > 0 && rule.origins.every((o) => o === "docs");
}

export function buildSections(
  document: KontractDocument,
  verdicts: ReportVerdict[] = [],
): ReportSections {
  const byId = new Map(verdicts.map((verdict) => [verdict.id, verdict]));
  const counts: Record<RuleStatus, number> = {
    verified: 0,
    unverified: 0,
    contradicted: 0,
    drifted: 0,
  };

  for (const rule of document.rules) {
    // The verdict wins over the stored status: a report rendered straight after
    // a verify run should show what that run concluded, even if the kontract on
    // disk has not been rewritten yet.
    const status = byId.get(rule.id)?.status ?? rule.status;
    counts[status] += 1;
  }

  const statusOf = (rule: KontractRule): RuleStatus =>
    byId.get(rule.id)?.status ?? rule.status;

  return {
    inventory: document.rules,
    contradictions: document.rules.filter(
      (rule) => statusOf(rule) === "contradicted",
    ),
    darkLogic: document.rules.filter(isDarkLogic),
    deadRules: document.rules.filter(isDeadRule),
    counts,
    reasons: new Map(
      verdicts.map((verdict) => [verdict.id, verdict.reason]),
    ),
  };
}

/**
 * The status to render for a rule: the verdict from this run if there is one,
 * otherwise whatever the kontract already carried.
 */
export function effectiveStatus(
  rule: KontractRule,
  verdicts: ReportVerdict[],
): RuleStatus {
  return (
    verdicts.find((verdict) => verdict.id === rule.id)?.status ?? rule.status
  );
}
