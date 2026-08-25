import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  KontractDocumentSchema,
  type KontractDocument,
  type KontractRule,
  type RuleOrigin,
} from "@repo/kontract";

const ORIGINS: readonly string[] = ["code", "schema", "data", "docs"];

/**
 * Builds a kontract from the fixture's committed `PLANTED.md` answer key.
 *
 * This exists so the verify → report → score path can be demonstrated without
 * an API key. **It is not extraction output — no model runs.** The rules come
 * from the answer key a human wrote when planting them, which is why the
 * command prints a banner saying so and stamps the provenance commit as
 * `answer-key` rather than a real sha.
 *
 * Everything downstream of this is the real thing: verification re-reads the
 * actual fixture source, and the report renders from the real kontract schema.
 */
export function kontractFromAnswerKey(markdown: string): KontractDocument {
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
                commit: "answer-key",
              },
            ],
      );

    if (provenance.length === 0) continue;

    const parsedOrigins = (origins ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter((origin): origin is RuleOrigin => ORIGINS.includes(origin));

    rules.push({
      id,
      statement: statement.replace(/`/g, ""),
      provenance,
      // The answer key is ground truth by construction, so confidence is 1.
      // A real extraction run produces a spread here instead.
      confidence: 1,
      origins: parsedOrigins.length > 0 ? parsedOrigins : ["code"],
      status: "unverified",
      tags: [classification, difficulty].filter(
        (tag): tag is string => tag !== undefined && tag !== "",
      ),
    });
  }

  return KontractDocumentSchema.parse({
    kontractVersion: 1,
    module: "legacy-claims",
    generatedAt: new Date().toISOString(),
    commit: "answer-key",
    rules,
  });
}

export const DEMO_BANNER = `
  ┌──────────────────────────────────────────────────────────────────────┐
  │  SIMULATED EXTRACTION                                                │
  │                                                                      │
  │  These rules were read from the fixture's committed answer key        │
  │  (PLANTED.md), not extracted by a model. No API call was made.        │
  │                                                                      │
  │  Everything after this point is real: verification re-reads the       │
  │  actual source files, and the report renders the real kontract.       │
  │                                                                      │
  │  For genuine extraction:  set ANTHROPIC_API_KEY, then krule discover  │
  └──────────────────────────────────────────────────────────────────────┘
`;

export async function loadAnswerKeyKontract(
  modulePath: string,
): Promise<KontractDocument> {
  return kontractFromAnswerKey(
    await readFile(join(modulePath, "PLANTED.md"), "utf8"),
  );
}
