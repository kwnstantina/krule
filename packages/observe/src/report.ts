import type { Observation, ObservationStatus } from "./evaluate";

const ORDER: ObservationStatus[] = ["breached", "confirmed", "holds", "no-evidence", "not-supported", "invalid"];

const HEADINGS: Record<ObservationStatus, string> = {
  breached: "Policy breached in practice",
  confirmed: "Unwritten rules the business follows",
  holds: "Policy holds in practice",
  "no-evidence": "Cannot be observed in this log",
  "not-supported": "Suspected patterns the data does not support",
  invalid: "Queries that reference things the log does not have",
};

const money = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 2 });

/** Plain-text summary for the terminal. Every figure is a query result. */
export function renderObservations(observations: Observation[]): string {
  const out: string[] = [];
  for (const status of ORDER) {
    const group = observations.filter((o) => o.status === status);
    if (group.length === 0) continue;
    out.push("", `  ${HEADINGS[status]} (${group.length})`);
    for (const o of group) {
      const h = o.hypothesis;
      const ref = h.policyRef === null ? "" : `  [${h.policyRef}]`;
      out.push(`    • ${h.statement}${ref}`);
      if (status === "invalid") {
        out.push(`      ${o.problems.join("; ")}`);
        continue;
      }
      if (status === "no-evidence") {
        if (o.problems.length > 0) out.push(`      ${o.problems.join("; ")}`);
        continue;
      }
      const sum =
        o.violatingSum !== null && o.violating > 0 ? `, ${h.sumField} total ${money(o.violatingSum)}` : "";
      out.push(`      ${o.conforming}/${o.population} conform (${(o.conformance * 100).toFixed(1)}%), ${o.violating} violate${sum}`);
      if (o.samples.length > 0) out.push(`      e.g. ${o.samples.join(", ")}`);
    }
  }
  return out.join("\n") + "\n";
}
