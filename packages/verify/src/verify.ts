import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { KontractDocument, KontractRule, RuleStatus } from "@repo/kontract";
import { extractNumbers, windowAround } from "./evidence";

/**
 * What verification concluded about one rule, and why.
 *
 * `reason` is written for a human reading the audit report, so it names the
 * value and the location rather than describing the check that ran.
 */
export interface RuleVerdict {
  id: string;
  status: RuleStatus;
  reason: string;
  /** Values the statement asserts that were found at the cited lines. */
  supported: number[];
  /** Values asserted but not found at any cited line. */
  unsupported: number[];
  /** Conflicting values found in other sources this rule cites. */
  conflicting: { file: string; line: number; value: number }[];
}

export interface VerifyResult {
  verdicts: RuleVerdict[];
  counts: Record<RuleStatus, number>;
}

interface LoadedFile {
  lines: string[];
}

async function loadCitedFiles(
  document: KontractDocument,
  moduleRoot: string,
): Promise<Map<string, LoadedFile>> {
  const paths = new Set<string>();
  for (const rule of document.rules) {
    for (const entry of rule.provenance) paths.add(entry.file);
  }

  const loaded = new Map<string, LoadedFile>();
  for (const path of paths) {
    try {
      const contents = await readFile(join(moduleRoot, path), "utf8");
      loaded.set(path, { lines: contents.split("\n") });
    } catch {
      // A citation to a file that no longer exists is itself a finding — the
      // rule will come out `drifted` rather than crashing the run.
    }
  }
  return loaded;
}

/**
 * Verifies one rule by re-reading its cited evidence and checking the values the
 * statement asserts are actually there.
 *
 * The four statuses come out of this as follows:
 *
 * - `verified` — every value the statement asserts was found at a cited line.
 * - `drifted` — an asserted value is absent from the cited line but present
 *   elsewhere in that file, or the file is gone. The rule was true once; the
 *   citation no longer lands on it.
 * - `contradicted` — a different source this same rule cites states a different
 *   value for the rule. This is what surfaces docs that disagree with code.
 * - `unverified` — nothing checkable. A qualitative rule with no numeric claim,
 *   or a documentation-only rule with no implementation to check against.
 *
 * **Limitation, stated plainly:** this proves the citation supports the
 * statement. It does not execute the code path. A rule can be `verified` here
 * and still describe behaviour the function never reaches — the unreachable-
 * branch case is caught by origins analysis in the report, not by this check.
 * Executable per-rule tests are Phase 4 and are not implemented.
 */
export function verifyRule(
  rule: KontractRule,
  files: Map<string, LoadedFile>,
): RuleVerdict {
  const asserted = extractNumbers(rule.statement);
  const supported: number[] = [];
  const unsupported: number[] = [];
  const conflicting: RuleVerdict["conflicting"][number][] = [];

  const missingFiles = rule.provenance
    .filter((entry) => !files.has(entry.file))
    .map((entry) => entry.file);

  if (missingFiles.length > 0) {
    return {
      id: rule.id,
      status: "drifted",
      reason:
        "cited file no longer exists: " + [...new Set(missingFiles)].join(", "),
      supported,
      unsupported: asserted,
      conflicting,
    };
  }

  // Collect the values visible at each citation, keeping them attributed so a
  // conflict can name the file and line it came from.
  const windows = rule.provenance.map((entry) => {
    const file = files.get(entry.file);
    const text =
      file === undefined
        ? ""
        : windowAround(file.lines, entry.line, entry.endLine);
    return { entry, values: extractNumbers(text) };
  });

  const allVisible = new Set(windows.flatMap((w) => w.values));

  for (const value of asserted) {
    if (allVisible.has(value)) supported.push(value);
    else unsupported.push(value);
  }

  // A different source citing a different value for the same rule is the
  // contradiction signal. Restricted to citations in a *different file* from the
  // one that supports the statement: within a single file, unrelated numbers on
  // neighbouring lines are common and would produce false contradictions.
  const supportingFiles = new Set(
    windows
      .filter((w) => w.values.some((value) => supported.includes(value)))
      .map((w) => w.entry.file),
  );

  if (supported.length > 0) {
    for (const w of windows) {
      if (supportingFiles.has(w.entry.file)) continue;
      for (const value of w.values) {
        if (!asserted.includes(value)) {
          conflicting.push({
            file: w.entry.file,
            line: w.entry.line,
            value,
          });
        }
      }
    }
  }

  if (conflicting.length > 0) {
    const first = conflicting[0];
    return {
      id: rule.id,
      status: "contradicted",
      reason:
        "code applies " +
        supported.join(", ") +
        " but " +
        (first === undefined ? "another source" : first.file) +
        " states " +
        [...new Set(conflicting.map((c) => c.value))].join(", "),
      supported,
      unsupported,
      conflicting,
    };
  }

  if (asserted.length === 0) {
    return {
      id: rule.id,
      status: "unverified",
      reason:
        "no numeric claim to check against the source — qualitative rules need a generated test",
      supported,
      unsupported,
      conflicting,
    };
  }

  const citedLocations = rule.provenance
    .map((entry) => entry.file + ":" + String(entry.line))
    .join(", ");

  // Everything visible anywhere in the cited files, not just at the citation.
  const inCitedFiles = new Set(
    rule.provenance.flatMap((entry) => {
      const file = files.get(entry.file);
      return file === undefined ? [] : extractNumbers(file.lines.join("\n"));
    }),
  );

  if (supported.length === 0) {
    // Nothing the statement asserts is at the citation. If the value exists
    // elsewhere in the file the citation went stale; if nowhere, the statement
    // is not supported by this source at all.
    const elsewhere = unsupported.some((value) => inCitedFiles.has(value));
    return {
      id: rule.id,
      status: elsewhere ? "drifted" : "unverified",
      reason: elsewhere
        ? "asserts " +
          unsupported.join(", ") +
          " which is present in the file but not at " +
          citedLocations
        : "asserts " +
          unsupported.join(", ") +
          " which does not appear in the cited source",
      supported,
      unsupported,
      conflicting,
    };
  }

  // A statement may legitimately name a value it contrasts against — "on Fridays
  // the cutoff is 12:00 rather than 15:00" asserts 12 and mentions 15. Counting
  // the contrast as unsupported marked correct rules as drifted, so a value that
  // exists elsewhere in a cited file is accounted for.
  const unaccounted = unsupported.filter((value) => !inCitedFiles.has(value));

  if (unaccounted.length === 0) {
    return {
      id: rule.id,
      status: "verified",
      reason: "found " + supported.join(", ") + " at " + citedLocations,
      supported,
      unsupported,
      conflicting,
    };
  }

  return {
    id: rule.id,
    status: "unverified",
    reason:
      "found " +
      supported.join(", ") +
      " at " +
      citedLocations +
      ", but " +
      unaccounted.join(", ") +
      " appears nowhere in the cited source",
    supported,
    unsupported,
    conflicting,
  };
}

export async function verifyDocument(
  document: KontractDocument,
  moduleRoot: string,
): Promise<VerifyResult> {
  const files = await loadCitedFiles(document, moduleRoot);
  const verdicts = document.rules.map((rule) => verifyRule(rule, files));

  const counts: Record<RuleStatus, number> = {
    verified: 0,
    unverified: 0,
    contradicted: 0,
    drifted: 0,
  };
  for (const verdict of verdicts) counts[verdict.status] += 1;

  return { verdicts, counts };
}

/** Shaped for `updateRuleStatuses`, which rewrites the YAML in place. */
export function toStatusMap(result: VerifyResult): Record<string, RuleStatus> {
  return Object.fromEntries(
    result.verdicts.map((verdict) => [verdict.id, verdict.status]),
  );
}
