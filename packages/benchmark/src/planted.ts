import {
  KontractDocumentSchema,
  type KontractDocument,
  type KontractRule,
  type RuleOrigin,
} from "@repo/kontract";

const ORIGINS: readonly string[] = ["code", "schema", "data", "docs"];

/** Classification vocabulary from the fixture's PLANTED.md. */
export const CLASSIFICATIONS = [
  "normal",
  "dark-logic",
  "dead-rule",
  "contradiction",
] as const;
export type Classification = (typeof CLASSIFICATIONS)[number];

export const CLASS_TAG_PREFIX = "class:";
export const DIFFICULTY_TAG_PREFIX = "difficulty:";

/** Reads a prefixed tag such as `class:dark-logic` off a rule. */
export function tagValue(rule: KontractRule, prefix: string): string | undefined {
  const tag = rule.tags?.find((candidate) => candidate.startsWith(prefix));
  return tag?.slice(prefix.length);
}

export interface AnswerKeyOptions {
  module: string;
  /** Sha the fixture was committed at — the provenance baseline. */
  commit: string;
  generatedAt: string;
}

/**
 * Converts the PLANTED.md rules table into an answer key in kontract form.
 *
 * The committed YAML key is produced by this function (`pnpm generate-key`), and
 * a test re-runs it against PLANTED.md so the two can never silently diverge.
 *
 * Two benchmark-only facts ride in `tags` rather than new schema fields, because
 * the kontract schema is the product format and Phases 3–5 all consume it:
 * `class:<classification>` and `difficulty:<level>`. Contradictions are stamped
 * `contradicted` — the status Verify should reach — so the key doubles as
 * Phase 4's expected-status ground truth.
 */
export function answerKeyFromPlanted(
  markdown: string,
  options: AnswerKeyOptions,
): KontractDocument {
  const rules: KontractRule[] = [];

  for (const line of markdown.split("\n")) {
    if (!line.startsWith("| R-")) continue;

    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    const [id, statement, evidence, origins, classification, difficulty] =
      cells;
    if (id === undefined || statement === undefined) continue;

    const provenance = (evidence ?? "")
      .split(";")
      .map((token) => /([\w./-]+\.(?:ts|sql|md)):(\d+)/.exec(token))
      .flatMap((match) =>
        match === null
          ? []
          : [
              {
                file: match[1] as string,
                line: Number(match[2]),
                commit: options.commit,
              },
            ],
      );

    if (provenance.length === 0) {
      throw new Error(`${id} in PLANTED.md has no file:line evidence`);
    }
    if (
      classification === undefined ||
      !(CLASSIFICATIONS as readonly string[]).includes(classification)
    ) {
      throw new Error(`${id} has unknown classification: ${classification}`);
    }

    const parsedOrigins = (origins ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter((origin): origin is RuleOrigin => ORIGINS.includes(origin));

    rules.push({
      id,
      statement: statement.replace(/`/g, ""),
      provenance,
      // Ground truth by construction.
      confidence: 1,
      origins: parsedOrigins,
      status: classification === "contradiction" ? "contradicted" : "unverified",
      tags: [
        CLASS_TAG_PREFIX + classification,
        ...(difficulty ? [DIFFICULTY_TAG_PREFIX + difficulty] : []),
      ],
    });
  }

  return KontractDocumentSchema.parse({
    kontractVersion: 1,
    module: options.module,
    generatedAt: options.generatedAt,
    commit: options.commit,
    rules,
  });
}
