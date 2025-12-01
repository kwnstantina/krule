import { RuleSchema, type Rule } from "@repo/core/evaluators";
import { ZodError } from "zod";
import { GroqClient } from "./groq-client";
import { SYSTEM_PROMPT, REFINEMENT_PROMPT, formatPrompt } from "./prompts";

export interface GenerationResult {
  success: boolean;
  rule?: Rule;
  error?: string;
  validationErrors?: any[];
  attempts?: number;
}

/**
 * Rule Generator Service
 * Converts natural language to validated Rule objects
 */
export class RuleGenerator {
  private groq: GroqClient;
  private maxRetries: number = 3;

  constructor(apiKey?: string) {
    this.groq = new GroqClient(apiKey);
  }

  /**
   * Generate a rule from natural language
   */
  async generate(prompt: string): Promise<GenerationResult> {
    let attempts = 0;
    let lastError: string | undefined;
    let validationErrors: any[] | undefined;

    while (attempts < this.maxRetries) {
      attempts++;

      try {
        // Get AI response
        const response = await this.groq.complete(
          SYSTEM_PROMPT,
          prompt,
          { temperature: 0.7 }
        );

        // Parse JSON from response
        const rule = this.extractJSON(response);

        // Validate with Zod
        const validated = RuleSchema.parse(rule);

        return {
          success: true,
          rule: validated,
          attempts,
        };
      } catch (error) {
        if (error instanceof ZodError) {
          // Validation error - try to fix with AI
          validationErrors = error.errors;
          lastError = `Validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;

          if (attempts < this.maxRetries) {
            // Ask AI to fix the errors
            prompt = `${prompt}\n\nPrevious attempt had validation errors: ${lastError}. Please fix and return a valid rule.`;
          }
        } else if (error instanceof SyntaxError) {
          lastError = `Invalid JSON: ${error.message}`;
        } else {
          lastError = error instanceof Error ? error.message : String(error);
        }
      }
    }

    return {
      success: false,
      error: lastError || "Failed to generate valid rule after multiple attempts",
      validationErrors,
      attempts,
    };
  }

  /**
   * Refine an existing rule based on user feedback
   */
  async refine(currentRule: Rule, userRequest: string): Promise<GenerationResult> {
    const prompt = formatPrompt(REFINEMENT_PROMPT, {
      currentRule,
      userRequest,
    });

    try {
      const response = await this.groq.complete(
        SYSTEM_PROMPT,
        prompt,
        { temperature: 0.7 }
      );

      const rule = this.extractJSON(response);
      const validated = RuleSchema.parse(rule);

      return {
        success: true,
        rule: validated,
        attempts: 1,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          error: "Validation failed after refinement",
          validationErrors: error.errors,
          attempts: 1,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        attempts: 1,
      };
    }
  }

  /**
   * Generate a streaming response
   */
  async *generateStream(prompt: string): AsyncGenerator<string, void, unknown> {
    const stream = this.groq.chatStream(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      { temperature: 0.7 }
    );

    for await (const chunk of stream) {
      yield chunk;
    }
  }

  /**
   * Extract JSON from AI response
   * Handles cases where AI returns markdown code blocks or extra text
   */
  private extractJSON(response: string): any {
    // Remove markdown code blocks if present
    let cleaned = response.trim();

    // Remove ```json and ```
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/, '');
    cleaned = cleaned.replace(/```\s*$/, '');

    // Find JSON object boundaries
    const startIndex = cleaned.indexOf('{');
    const endIndex = cleaned.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      throw new SyntaxError("No JSON object found in response");
    }

    const jsonStr = cleaned.substring(startIndex, endIndex + 1);
    return JSON.parse(jsonStr);
  }

  /**
   * Validate a rule and return detailed error information
   */
  async validate(rule: any): Promise<{
    valid: boolean;
    errors?: any[];
  }> {
    try {
      RuleSchema.parse(rule);
      return { valid: true };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          valid: false,
          errors: error.errors,
        };
      }
      return {
        valid: false,
        errors: [{ message: error instanceof Error ? error.message : String(error) }],
      };
    }
  }

  /**
   * Set maximum retry attempts
   */
  setMaxRetries(max: number) {
    this.maxRetries = max;
  }
}

export default RuleGenerator;
