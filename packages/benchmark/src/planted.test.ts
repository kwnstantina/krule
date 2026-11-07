import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readKontractFile } from "@repo/kontract";
import { FIXTURE_COMMIT, FIXTURE_GENERATED_AT } from "./fixture";
import { answerKeyFromPlanted, answerKeyPath, tagValue } from "./index";

const FIXTURE = join(__dirname, "..", "..", "..", "fixtures", "legacy-claims");

describe("legacy-claims answer key", () => {
  it("parses through the kontract schema with all 30 planted rules", async () => {
    const key = await readKontractFile(answerKeyPath("legacy-claims"));
    expect(key.rules).toHaveLength(30);
    expect(key.module).toBe("legacy-claims");
  });

  it("meets every category minimum from the 02-01 plan", async () => {
    const key = await readKontractFile(answerKeyPath("legacy-claims"));
    const count = (classification: string) =>
      key.rules.filter((rule) => tagValue(rule, "class:") === classification)
        .length;
    expect(count("dark-logic")).toBeGreaterThanOrEqual(3);
    expect(count("dead-rule")).toBeGreaterThanOrEqual(3);
    expect(count("contradiction")).toBeGreaterThanOrEqual(2);
    expect(
      key.rules.filter((rule) => rule.origins.includes("schema")).length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      key.rules.filter((rule) => rule.origins.includes("data")).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("marks exactly the contradictions as contradicted", async () => {
    const key = await readKontractFile(answerKeyPath("legacy-claims"));
    for (const rule of key.rules) {
      const isContradiction = tagValue(rule, "class:") === "contradiction";
      expect(rule.status).toBe(isContradiction ? "contradicted" : "unverified");
    }
  });

  it("cites only files and lines that exist in the fixture", async () => {
    const key = await readKontractFile(answerKeyPath("legacy-claims"));
    for (const rule of key.rules) {
      for (const { file, line } of rule.provenance) {
        const path = join(FIXTURE, file);
        await expect(access(path)).resolves.toBeUndefined();
        const lineCount = (await readFile(path, "utf8")).split("\n").length;
        expect(line, `${rule.id} cites ${file}:${line}`).toBeLessThanOrEqual(
          lineCount,
        );
      }
    }
  });

  it("is exactly what PLANTED.md generates — regenerate with pnpm generate-key", async () => {
    const committed = await readKontractFile(answerKeyPath("legacy-claims"));
    const regenerated = answerKeyFromPlanted(
      await readFile(join(FIXTURE, "PLANTED.md"), "utf8"),
      {
        module: "legacy-claims",
        commit: FIXTURE_COMMIT,
        generatedAt: FIXTURE_GENERATED_AT,
      },
    );
    expect(committed).toEqual(regenerated);
  });
});
