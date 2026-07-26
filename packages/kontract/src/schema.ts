import { z } from "zod";

/**
 * Where a rule was found in the target system. A rule may be evidenced in more
 * than one place, so `KontractRuleSchema.provenance` is a non-empty array.
 *
 * `commit` records the sha the evidence was read at. Phase 5's drift detection
 * diffs a PR against this baseline, so it is required, not optional.
 */
export const ProvenanceSchema = z.object({
  file: z.string().min(1, "Provenance requires a repo-relative file path"),
  line: z.number().int().positive(),
  endLine: z.number().int().positive().optional(),
  commit: z.string().min(1, "Provenance requires the commit it was read at"),
});

/**
 * Verification state of a rule.
 *
 * A rule is `unverified` until Verify (Phase 4) generates a test, runs it
 * against the real code, and says otherwise. No rule is trusted on the model's
 * word alone.
 */
export const RuleStatusSchema = z.enum([
  "verified",
  "unverified",
  "contradicted",
  "drifted",
]);

/**
 * Which kind of source the rule was extracted from.
 *
 * Phase 5's report sections derive from this: origins of only `code` are Dark
 * Logic; only `docs` is a Dead Rule candidate.
 */
export const RuleOriginSchema = z.enum(["code", "schema", "data", "docs"]);

/**
 * `id` is constrained to `R-<digits>` because the CI drift message is specified
 * in the brief as "this PR changes rule R-114" — the format is a requirement.
 */
export const KontractRuleSchema = z.object({
  id: z.string().regex(/^R-\d+$/, "Rule id must match R-<digits>, e.g. R-114"),
  statement: z
    .string()
    .min(10, "A rule statement must be a readable sentence, not a fragment"),
  provenance: z
    .array(ProvenanceSchema)
    .min(1, "Every rule needs at least one code reference"),
  confidence: z.number().min(0).max(1),
  origins: z
    .array(RuleOriginSchema)
    .min(1, "Every rule needs at least one origin"),
  status: RuleStatusSchema.default("unverified"),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const KontractDocumentSchema = z
  .object({
    /** Version discriminator from day one, so later schema changes are detectable. */
    kontractVersion: z.literal(1),
    module: z.string().min(1),
    generatedAt: z.string().datetime(),
    /** Sha of the target repo at extraction time. */
    commit: z.string().min(1),
    rules: z.array(KontractRuleSchema),
  })
  .superRefine((doc, ctx) => {
    // Duplicate ids would make the Phase 5 drift diff ambiguous.
    const seen = new Set<string>();
    doc.rules.forEach((rule, index) => {
      if (seen.has(rule.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rules", index, "id"],
          message: `Duplicate rule id: ${rule.id}`,
        });
      }
      seen.add(rule.id);
    });
  });

export type Provenance = z.infer<typeof ProvenanceSchema>;
export type RuleStatus = z.infer<typeof RuleStatusSchema>;
export type RuleOrigin = z.infer<typeof RuleOriginSchema>;
export type KontractRule = z.infer<typeof KontractRuleSchema>;
export type KontractDocument = z.infer<typeof KontractDocumentSchema>;
