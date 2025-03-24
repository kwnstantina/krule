import { z } from "zod";

export const ConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(["==", "!=", ">", "<", ">=", "<=", "in", "not"]),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.any()), z.any()]),
});

export const ConditionGroupSchema: z.ZodSchema<any> = z.lazy(() =>
  z.object({
    operator: z.enum(["AND", "OR", "XOR", "NAND", "NOR"]),
    conditions: z.array(z.union([ConditionSchema, z.lazy(() => ConditionGroupSchema) as any])),
  })
) as any;

export const RuleSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  priority: z.number().default(0),
  condition: ConditionGroupSchema,
  actions: z.array(
    z.object({
      type: z.string(),
      target: z.string(),
      payload: z.any().optional(),
    })
  ),
});

export const CustomOperatorSchema = z.object({
  name: z.string(),
  evaluate: z.function().args(z.array(z.boolean())).returns(z.boolean()),
});

export type Condition = z.infer<typeof ConditionSchema>;
export type ConditionGroup = z.infer<typeof ConditionGroupSchema>;
export type Rule = z.infer<typeof RuleSchema>;
export type CustomOperator = z.infer<typeof CustomOperatorSchema>;