/**
 * Numeric and code-literal extraction, shared by the statement and the evidence
 * side of verification.
 *
 * Verification is only as good as this normalisation: `£10,000` in a wiki and
 * `10000` in TypeScript are the same business threshold, and if they do not
 * compare equal here then every documented rule looks like a contradiction.
 */

/**
 * Pulls comparable numbers out of a string.
 *
 * Thousands separators are stripped so `10,000` matches `10000`. Currency
 * symbols are ignored — the magnitude is the rule, the symbol is presentation.
 * Trailing ordinals and times (`15:00`) are captured as their own values so a
 * cutoff hour still compares.
 */
export function extractNumbers(text: string): number[] {
  const found = new Set<number>();

  // Regex character classes are pattern syntax, not business values. A CHECK
  // constraint like LIKE 'LEI-__-[0-9][0-9]' would otherwise contribute 0 and 9
  // as thresholds and make every rule citing it look contradicted.
  const withoutCharClasses = text.replace(/\[[^\]\n]*\]/g, " ");

  // Times first, so 15:00 yields the hour 15 rather than {15, 0}. A cutoff is
  // compared against an hour in the code, and the stray 0 from the minutes was
  // showing up as an unsupported claim.
  const timePattern = /\b(\d{1,2}):(\d{2})\b/g;
  const withoutTimes = withoutCharClasses.replace(
    timePattern,
    (_match, hour: string) => " " + hour + " ",
  );

  // Match runs of digits, optionally comma-grouped, optionally with decimals.
  const pattern = /\d[\d,]*(?:\.\d+)?/g;
  for (const match of withoutTimes.matchAll(pattern)) {
    const normalized = match[0].replace(/,/g, "");
    const value = Number(normalized);
    if (Number.isFinite(value)) found.add(value);
  }

  return [...found].sort((a, b) => a - b);
}

/**
 * Single-quoted or double-quoted short literals — the stringly-typed status
 * codes legacy systems use (`'A'`, `'CA'`, `'BACS'`).
 */
export function extractLiterals(text: string): string[] {
  const found = new Set<string>();
  const pattern = /['"]([A-Za-z_][A-Za-z0-9_]{0,15})['"]/g;
  for (const match of text.matchAll(pattern)) {
    const value = match[1];
    if (value !== undefined) found.add(value);
  }
  return [...found].sort();
}

/**
 * A window of lines around a cited line.
 *
 * A citation points at the line the evidence starts on, but the value it asserts
 * is often a line or two away — a threshold on the `if`, the comment above it,
 * the constraint name on the line before the CHECK. Two lines either side keeps
 * those together without swallowing unrelated code.
 */
export const WINDOW_RADIUS = 2;

export function windowAround(
  lines: string[],
  line: number,
  endLine?: number,
): string {
  const start = Math.max(0, line - 1 - WINDOW_RADIUS);
  const end = Math.min(lines.length, (endLine ?? line) + WINDOW_RADIUS);
  return lines.slice(start, end).join("\n");
}
