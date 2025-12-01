import type { Rule } from "@repo/core/evaluators";
import { GroqClient } from "./groq-client";
import { EXPLANATION_PROMPT, formatPrompt } from "./prompts";

export interface ExplanationResult {
  success: boolean;
  explanation?: string;
  error?: string;
}

/**
 * Rule Explainer Service
 * Generates human-readable explanations of rules
 */
export class RuleExplainer {
  private groq: GroqClient;

  constructor(apiKey?: string) {
    this.groq = new GroqClient(apiKey);
  }

  /**
   * Explain a rule in plain language
   */
  async explain(rule: Rule): Promise<ExplanationResult> {
    try {
      const prompt = formatPrompt(EXPLANATION_PROMPT, { rule });

      const response = await this.groq.complete(
        "You are a helpful assistant that explains technical rules in simple, conversational language.",
        prompt,
        { temperature: 0.7, maxTokens: 500 }
      );

      return {
        success: true,
        explanation: response.trim(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Explain specific conditions in a rule
   */
  async explainConditions(rule: Rule): Promise<ExplanationResult> {
    try {
      const prompt = `Explain the following rule conditions in simple terms:\n\n${JSON.stringify(rule.condition, null, 2)}\n\nProvide a clear explanation of when this rule will trigger.`;

      const response = await this.groq.complete(
        "You are a helpful assistant that explains technical conditions in simple language.",
        prompt,
        { temperature: 0.7, maxTokens: 300 }
      );

      return {
        success: true,
        explanation: response.trim(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Explain actions in a rule
   */
  async explainActions(rule: Rule): Promise<ExplanationResult> {
    try {
      const prompt = `Explain what the following actions do:\n\n${JSON.stringify(rule.actions, null, 2)}\n\nDescribe the outcomes in simple terms.`;

      const response = await this.groq.complete(
        "You are a helpful assistant that explains technical actions in simple language.",
        prompt,
        { temperature: 0.7, maxTokens: 300 }
      );

      return {
        success: true,
        explanation: response.trim(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Suggest use cases for a rule
   */
  async suggestUseCases(rule: Rule): Promise<ExplanationResult> {
    try {
      const prompt = `Given this rule:\n\n${JSON.stringify(rule, null, 2)}\n\nSuggest 3-5 real-world business use cases or scenarios where this rule would be valuable. Be specific and practical.`;

      const response = await this.groq.complete(
        "You are a business analyst helping identify practical applications for business rules.",
        prompt,
        { temperature: 0.8, maxTokens: 400 }
      );

      return {
        success: true,
        explanation: response.trim(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Stream explanation for long-form content
   */
  async *explainStream(rule: Rule): AsyncGenerator<string, void, unknown> {
    const prompt = formatPrompt(EXPLANATION_PROMPT, { rule });

    const stream = this.groq.chatStream(
      [
        {
          role: "system",
          content: "You are a helpful assistant that explains technical rules in simple, conversational language.",
        },
        { role: "user", content: prompt },
      ],
      { temperature: 0.7, maxTokens: 500 }
    );

    for await (const chunk of stream) {
      yield chunk;
    }
  }
}

export default RuleExplainer;
