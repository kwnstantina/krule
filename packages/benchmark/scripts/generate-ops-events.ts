/**
 * Regenerates fixtures/legacy-claims-ops/events/claim-events.csv. Deterministic;
 * `ops-fixture.test.ts` fails if the checked-in file differs from this output.
 */
import { writeFile } from "node:fs/promises";
import { generateOpsEvents, opsEventsPath } from "../src/index";

async function main(): Promise<void> {
  await writeFile(opsEventsPath(), generateOpsEvents(), "utf8");
  process.stdout.write("wrote " + opsEventsPath() + "\n");
}

main().catch((error: unknown) => {
  process.stderr.write(String(error) + "\n");
  process.exitCode = 1;
});
