import { readFile, writeFile } from "node:fs/promises";
import YAML, { isMap, isSeq } from "yaml";
import {
  KontractDocumentSchema,
  type KontractDocument,
  type RuleStatus,
} from "./schema";

/**
 * Parse and validate a kontract document.
 *
 * The `ZodError` is deliberately allowed to propagate. Phase 3's self-correcting
 * generation loop feeds validation errors back into the prompt and retries, so it
 * needs the structured error — never swallow it and return a partial document.
 */
export function parseKontract(yamlText: string): KontractDocument {
  return KontractDocumentSchema.parse(YAML.parse(yamlText));
}

/** Validate first, then serialize — an invalid document should never reach disk. */
export function serializeKontract(doc: KontractDocument): string {
  return YAML.stringify(KontractDocumentSchema.parse(doc));
}

export async function readKontractFile(path: string): Promise<KontractDocument> {
  return parseKontract(await readFile(path, "utf8"));
}

export async function writeKontractFile(
  path: string,
  doc: KontractDocument
): Promise<void> {
  await writeFile(path, serializeKontract(doc), "utf8");
}

/**
 * Rewrite rule statuses in place, preserving comments and formatting.
 *
 * Verify (Phase 4) stamps a status onto every rule in an existing file. Going
 * through `parseKontract` -> mutate -> `serializeKontract` would work, but the
 * plain-object round trip discards every YAML comment — and a kontract file is a
 * human-reviewed audit artifact, so reviewer annotations must survive a rewrite.
 * This operates on the YAML AST instead, which is the only way to keep them.
 *
 * Rules whose id is absent from `statuses` are left untouched. The resulting
 * document is validated before being returned.
 */
export function updateRuleStatuses(
  yamlText: string,
  statuses: Record<string, RuleStatus>
): string {
  const doc = YAML.parseDocument(yamlText);
  const rules = doc.get("rules", true);

  if (!isSeq(rules)) {
    throw new Error("kontract document has no `rules` sequence");
  }

  for (const item of rules.items) {
    if (!isMap(item)) continue;

    const id = item.get("id");
    if (typeof id !== "string") continue;

    const nextStatus = statuses[id];
    if (nextStatus) {
      item.set("status", nextStatus);
    }
  }

  // Validate the result rather than trusting the mutation.
  KontractDocumentSchema.parse(doc.toJS());

  return doc.toString();
}
