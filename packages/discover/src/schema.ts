import { z } from "zod";

/**
 * What the model is asked to return, per rule.
 *
 * Deliberately *not* a `KontractRule`. Three fields are ours to assign, not the
 * model's:
 *
 * - `id` — assigned in order after extraction, so it always matches `R-<digits>`
 *   and is stable across runs rather than whatever the model felt like emitting.
 * - `commit` on each provenance entry — read from the target repo at scan time.
 * - `status` — always starts `unverified`; only Verify may change it.
 */
export const ExtractedRuleSchema = z.object({
  statement: z
    .string()
    .min(10, "A rule statement must be a readable sentence, not a fragment"),
  provenance: z
    .array(
      z.object({
        file: z.string().min(1),
        line: z.number().int().positive(),
        endLine: z.number().int().positive().optional(),
      }),
    )
    .min(1, "Every rule needs at least one file and line reference"),
  confidence: z.number().min(0).max(1),
  origins: z.array(z.enum(["code", "schema", "data", "docs"])).min(1),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const ExtractionResultSchema = z.object({
  rules: z.array(ExtractedRuleSchema),
});

export type ExtractedRule = z.infer<typeof ExtractedRuleSchema>;
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

/**
 * The same shape as JSON Schema, for `output_config.format`.
 *
 * This is hand-written rather than generated because the SDK's `zodOutputFormat`
 * helper imports `zod/v4` and this workspace is pinned to Zod 3.24 for
 * `@repo/core`. **Keep it in step with `ExtractionResultSchema` above** — a
 * drift between the two shows up as a confusing `ZodError` on a response the
 * API considered valid. `schema.test.ts` pins the two together.
 *
 * Structured outputs reject several JSON Schema keywords (`minLength`,
 * `minItems`, `minimum`, …), so the bounds live only in the Zod layer.
 * `additionalProperties: false` is required on every object.
 */
export const EXTRACTION_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    rules: {
      type: "array",
      items: {
        type: "object",
        properties: {
          statement: {
            type: "string",
            description:
              "The business rule in one plain-language sentence, as a domain expert would state it. No code identifiers.",
          },
          provenance: {
            type: "array",
            description:
              "Every place this rule is evidenced. Line numbers are those shown in the corpus.",
            items: {
              type: "object",
              properties: {
                file: {
                  type: "string",
                  description: "Module-relative path exactly as given.",
                },
                line: {
                  type: "integer",
                  description: "The line the evidence starts on.",
                },
                endLine: {
                  type: "integer",
                  description: "Last line, when the evidence spans a range.",
                },
              },
              required: ["file", "line"],
              additionalProperties: false,
            },
          },
          confidence: {
            type: "number",
            description:
              "0 to 1. How certain you are this is a real business rule and stated correctly.",
          },
          origins: {
            type: "array",
            description:
              "Which kinds of source evidence this rule. Drives the report's Dark Logic (code only) and Dead Rules (docs only) sections.",
            items: { type: "string", enum: ["code", "schema", "data", "docs"] },
          },
          notes: {
            type: "string",
            description:
              "Only when it adds something the statement cannot carry — e.g. which sources disagree, or why the branch is unreachable.",
          },
          tags: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["statement", "provenance", "confidence", "origins"],
        additionalProperties: false,
      },
    },
  },
  required: ["rules"],
  additionalProperties: false,
};
