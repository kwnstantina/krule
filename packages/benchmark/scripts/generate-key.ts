/**
 * Regenerates answer-key/legacy-claims.kontract.yaml from the fixture's
 * PLANTED.md. Run after editing PLANTED.md; `planted.test.ts` fails until you do.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { serializeKontract } from "@repo/kontract";
import { answerKeyFromPlanted, answerKeyPath } from "../src/index";
import { FIXTURE_COMMIT, FIXTURE_GENERATED_AT } from "../src/fixture";

async function main(): Promise<void> {
  const planted = join(
    __dirname,
    "..",
    "..",
    "..",
    "fixtures",
    "legacy-claims",
    "PLANTED.md",
  );
  const key = answerKeyFromPlanted(await readFile(planted, "utf8"), {
    module: "legacy-claims",
    commit: FIXTURE_COMMIT,
    generatedAt: FIXTURE_GENERATED_AT,
  });
  const header =
    "# Generated from fixtures/legacy-claims/PLANTED.md by `pnpm generate-key`.\n" +
    "# Do not edit by hand; edit PLANTED.md and regenerate.\n";
  await writeFile(
    answerKeyPath("legacy-claims"),
    header + serializeKontract(key),
    "utf8",
  );
  process.stdout.write(`wrote ${key.rules.length} rules\n`);
}

void main();
