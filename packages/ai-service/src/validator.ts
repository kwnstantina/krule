import type { Rule } from "@repo/core/evaluators";
import { RuleSchema } from "@repo/core/evaluators";
import { ZodError } from "zod";
import { GroqClient } from "./groq-client";
import { VALIDATION_PROMPT, formatPrompt } from "./prompts";

export interface ValidationResult {
  valid: boolean;
  errors?: any[];
  aiExplanation?: string;
  suggestions?: string[];
}

/**
 * Validator Service
 * Validates rules and provides AI-assisted error explanations
 */
export class Validator {
  private groq: GroqClient;

  constructor(apiKey?: string) {
    this.groq = new GroqClient(apiKey);
  }

  /**
   * Validate a rule with AI-assisted error explanations
   */
  async validate(rule: any): Promise<ValidationResult> {
    try {
      // First, try Zod validation
      RuleSchema.parse(rule);

      return {
        valid: true,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        // Get AI explanation of the errors
        const aiExplanation = await this.explainErrors(rule, error.errors);

        return {
          valid: false,
          errors: error.errors,
          aiExplanation: aiExplanation || undefined,
        };
      }

      return {
        valid: false,
        errors: [
          {
            message: error instanceof Error ? error.message : String(error),
          },
        ],
      };
    }
  }

  /**
   * Get AI explanation of validation errors
   */
  private async explainErrors(
    rule: any,
    errors: any[]
  ): Promise<string | null> {
    try {
      const prompt = formatPrompt(VALIDATION_PROMPT, {
        rule: JSON.stringify(rule, null, 2),
        errors: JSON.stringify(errors, null, 2),
      });

      const response = await this.groq.complete(
        "You are a helpful assistant that explains validation errors in friendly, actionable language.",
        prompt,
        { temperature: 0.7, maxTokens: 400 }
      );

      return response.trim();
    } catch (error) {
      console.error("Failed to get AI explanation:", error);
      return null;
    }
  }

  /**
   * Suggest fixes for a validation error
   */
  async suggestFixes(rule: any, errors: any[]): Promise<string[]> {
    try {
      const prompt = `Given this invalid rule and errors, suggest specific fixes:\n\nRule: ${JSON.stringify(rule, null, 2)}\n\nErrors: ${JSON.stringify(errors, null, 2)}\n\nProvide 2-3 specific, actionable suggestions to fix the issues. Format as a numbered list.`;

      const response = await this.groq.complete(
        "You are a helpful assistant that suggests fixes for validation errors.",
        prompt,
        { temperature: 0.7, maxTokens: 300 }
      );

      // Parse numbered list into array
      const suggestions = response
        .split('\n')
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());

      return suggestions;
    } catch (error) {
      console.error("Failed to get fix suggestions:", error);
      return [];
    }
  }

  /**
   * Check for potential logical issues (beyond schema validation)
   */
  async checkLogic(rule: Rule): Promise<{
    issues: string[];
    warnings: string[];
  }> {
    try {
      const prompt = `Analyze this rule for logical issues or potential problems:\n\n${JSON.stringify(rule, null, 2)}\n\nIdentify:\n1. Logical contradictions (e.g., impossible conditions)\n2. Performance concerns (e.g., overly complex conditions)\n3. Edge cases that might not be handled\n4. Potential improvements\n\nFormat as:\nISSUES: (critical problems)\nWARNINGS: (potential improvements)`;

      const response = await this.groq.complete(
        "You are an expert at analyzing business rules for logical issues and optimization opportunities.",
        prompt,
        { temperature: 0.7, maxTokens: 400 }
      );

      // Parse response
      const issuesMatch = response.match(/ISSUES:([\s\S]*?)(?=WARNINGS:|$)/i);
      const warningsMatch = response.match(/WARNINGS:([\s\S]*?)$/i);

      const issues = issuesMatch?.[1]
        ? issuesMatch[1]
            .split('\n')
            .filter(line => line.trim() && line.trim() !== '-')
            .map(line => line.replace(/^[-*]\s*/, '').trim())
        : [];

      const warnings = warningsMatch?.[1]
        ? warningsMatch[1]
            .split('\n')
            .filter(line => line.trim() && line.trim() !== '-')
            .map(line => line.replace(/^[-*]\s*/, '').trim())
        : [];

      return { issues, warnings };
    } catch (error) {
      console.error("Failed to check logic:", error);
      return { issues: [], warnings: [] };
    }
  }

  /**
   * Validate in batch (for multiple rules)
   */
  async validateBatch(rules: any[]): Promise<ValidationResult[]> {
    return Promise.all(rules.map(rule => this.validate(rule)));
  }
}

export default Validator;
