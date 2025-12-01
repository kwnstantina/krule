/**
 * @repo/ai-sdk
 * KRule AI SDK for generating business rules from natural language
 */

export { KRuleAI, Conversation } from "./client";
export type {
  KRuleAIConfig,
  GenerateRuleOptions,
  GenerateRuleResponse,
  ExplainRuleOptions,
  ExplainRuleResponse,
  ValidateRuleOptions,
  ValidateRuleResponse,
  TestScenario,
  GenerateTestsOptions,
  GenerateTestsResponse,
} from "./client";

// Re-export Rule type from core
export type { Rule } from "@repo/core/evaluators";
