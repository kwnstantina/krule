import { CLASS_TAG_PREFIX, CLASSIFICATIONS, tagValue } from "./planted";
import { difficultyOf, PASS_THRESHOLD, type ScoreResult } from "./score";

function percent(value: number): string {
  return (value * 100).toFixed(1).padStart(5) + "%";
}

function bar(value: number, width = 24): string {
  const filled = Math.round(value * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

function clip(text: string, width = 78): string {
  return text.length <= width ? text : text.slice(0, width - 1) + "…";
}

/**
 * Renders a score as plain text for the terminal.
 *
 * The headline is the least useful part. The miss list and the misdescribed list
 * are what tell you which prompt change to try next, so they are always printed
 * in full.
 */
export function renderScoreReport(result: ScoreResult): string {
  const lines: string[] = [];
  const verdict = result.meetsThreshold ? "PASS" : "BELOW TARGET";

  lines.push(
    `  judge      ${result.judge}`,
    `  key        ${result.keyCount} rules`,
    `  extracted  ${result.discoveredCount} rules`,
    "",
    `  recall     ${percent(result.recall)}  ${bar(result.recall)}  (${result.truePositives}/${result.keyCount})`,
    `  precision  ${percent(result.precision)}  ${bar(result.precision)}`,
    `  f1         ${percent(result.f1)}`,
    `  threshold  ${percent(PASS_THRESHOLD)}  ${verdict}`,
    "",
    "  by classification",
  );

  for (const classification of CLASSIFICATIONS) {
    const entry = result.byClass[classification];
    if (entry.total === 0) continue;
    lines.push(
      `    ${classification.padEnd(14)} ${String(entry.found).padStart(2)}/${String(entry.total).padEnd(2)} ${percent(entry.recall)}  ${bar(entry.recall, 16)}`,
    );
  }

  if (result.judge.startsWith("deterministic")) {
    lines.push(
      "",
      "  NOTE  Scored with the offline placeholder judge (term overlap). It",
      "        under-credits paraphrase. Set ANTHROPIC_API_KEY for a real figure.",
    );
  }

  if (result.missed.length > 0) {
    lines.push("", `  missed (${result.missed.length})`);
    for (const rule of result.missed) {
      const classification = tagValue(rule, CLASS_TAG_PREFIX) ?? "?";
      lines.push(
        `    ${rule.id}  [${classification}, ${difficultyOf(rule)}]  ${clip(rule.statement, 60)}`,
      );
    }
  }

  if (result.misdescribed.length > 0) {
    lines.push("", `  right place, wrong rule (${result.misdescribed.length})`);
    for (const entry of result.misdescribed) {
      lines.push(
        `    ${entry.discoveredId}  vs ${entry.keyIds.join(", ")}  ${clip(entry.reasons[0] ?? "", 60)}`,
      );
    }
  }

  if (result.unmatched.length > 0) {
    lines.push(
      "",
      `  not in the key (${result.unmatched.length}) — false positives, or real rules the key lacks`,
    );
    for (const rule of result.unmatched) {
      lines.push(`    ${rule.id}  ${clip(rule.statement, 70)}`);
    }
  }

  return lines.join("\n") + "\n";
}
