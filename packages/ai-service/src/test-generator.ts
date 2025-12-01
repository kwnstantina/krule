import type { Rule } from "@repo/core/evaluators";
import { GroqClient } from "./groq-client";
import { TEST_SCENARIO_PROMPT, formatPrompt } from "./prompts";

export interface TestScenario {
  name: string;
  data: Record<string, any>;
  shouldTrigger?: boolean;
  description?: string;
}

export interface TestGenerationResult {
  success: boolean;
  scenarios?: TestScenario[];
  error?: string;
}

/**
 * Test Generator Service
 * Auto-generates test scenarios for rules
 */
export class TestGenerator {
  private groq: GroqClient;

  constructor(apiKey?: string) {
    this.groq = new GroqClient(apiKey);
  }

  /**
   * Generate test scenarios for a rule
   */
  async generate(rule: Rule): Promise<TestGenerationResult> {
    try {
      const prompt = formatPrompt(TEST_SCENARIO_PROMPT, { rule });

      const response = await this.groq.complete(
        "You are an expert QA engineer that creates comprehensive test scenarios for business rules.",
        prompt,
        { temperature: 0.7, maxTokens: 1000 }
      );

      // Extract JSON array
      const scenarios = this.extractJSONArray(response);

      // Enhance scenarios with shouldTrigger flag
      const enhanced = this.enhanceScenarios(scenarios);

      return {
        success: true,
        scenarios: enhanced,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate edge case scenarios specifically
   */
  async generateEdgeCases(rule: Rule): Promise<TestGenerationResult> {
    try {
      const prompt = `Generate 5 edge case test scenarios for this rule:\n\n${JSON.stringify(rule, null, 2)}\n\nFocus on:\n- Boundary values (exactly at thresholds)\n- Null/undefined values\n- Empty arrays\n- Type edge cases\n- Extreme values\n\nReturn as JSON array with "name" and "data" fields.`;

      const response = await this.groq.complete(
        "You are an expert QA engineer specializing in edge case testing.",
        prompt,
        { temperature: 0.7, maxTokens: 800 }
      );

      const scenarios = this.extractJSONArray(response);
      const enhanced = this.enhanceScenarios(scenarios);

      return {
        success: true,
        scenarios: enhanced,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate positive test cases (should trigger rule)
   */
  async generatePositiveCases(rule: Rule, count: number = 3): Promise<TestGenerationResult> {
    try {
      const prompt = `Generate ${count} test scenarios where this rule SHOULD trigger:\n\n${JSON.stringify(rule, null, 2)}\n\nCreate realistic, diverse examples. Return as JSON array with "name" and "data" fields.`;

      const response = await this.groq.complete(
        "You are an expert QA engineer creating positive test cases.",
        prompt,
        { temperature: 0.8, maxTokens: 800 }
      );

      const scenarios = this.extractJSONArray(response);
      const enhanced = scenarios.map(s => ({
        ...s,
        shouldTrigger: true,
        description: "Positive test - rule should trigger",
      }));

      return {
        success: true,
        scenarios: enhanced,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate negative test cases (should NOT trigger rule)
   */
  async generateNegativeCases(rule: Rule, count: number = 3): Promise<TestGenerationResult> {
    try {
      const prompt = `Generate ${count} test scenarios where this rule should NOT trigger:\n\n${JSON.stringify(rule, null, 2)}\n\nCreate realistic, diverse examples. Return as JSON array with "name" and "data" fields.`;

      const response = await this.groq.complete(
        "You are an expert QA engineer creating negative test cases.",
        prompt,
        { temperature: 0.8, maxTokens: 800 }
      );

      const scenarios = this.extractJSONArray(response);
      const enhanced = scenarios.map(s => ({
        ...s,
        shouldTrigger: false,
        description: "Negative test - rule should not trigger",
      }));

      return {
        success: true,
        scenarios: enhanced,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate a complete test suite
   */
  async generateSuite(rule: Rule): Promise<TestGenerationResult> {
    try {
      const [positive, negative, edge] = await Promise.all([
        this.generatePositiveCases(rule, 2),
        this.generateNegativeCases(rule, 2),
        this.generateEdgeCases(rule),
      ]);

      const allScenarios = [
        ...(positive.scenarios || []),
        ...(negative.scenarios || []),
        ...(edge.scenarios || []),
      ];

      return {
        success: true,
        scenarios: allScenarios,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Extract JSON array from AI response
   */
  private extractJSONArray(response: string): any[] {
    let cleaned = response.trim();

    // Remove markdown code blocks
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/, '');
    cleaned = cleaned.replace(/```\s*$/, '');

    // Find array boundaries
    const startIndex = cleaned.indexOf('[');
    const endIndex = cleaned.lastIndexOf(']');

    if (startIndex === -1 || endIndex === -1) {
      throw new SyntaxError("No JSON array found in response");
    }

    const jsonStr = cleaned.substring(startIndex, endIndex + 1);
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) {
      throw new SyntaxError("Expected JSON array");
    }

    return parsed;
  }

  /**
   * Enhance scenarios with additional metadata
   */
  private enhanceScenarios(scenarios: any[]): TestScenario[] {
    return scenarios.map(s => ({
      name: s.name || "Unnamed scenario",
      data: s.data || {},
      shouldTrigger: s.shouldTrigger,
      description: s.description,
    }));
  }
}

export default TestGenerator;
