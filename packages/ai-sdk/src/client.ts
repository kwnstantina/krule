import type { Rule } from "@repo/core/evaluators";

export interface KRuleAIConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

export interface GenerateRuleOptions {
  prompt: string;
  userId?: string;
}

export interface GenerateRuleResponse {
  success: boolean;
  rule?: Rule;
  error?: string;
  attempts?: number;
}

export interface ExplainRuleOptions {
  rule: Rule;
  type?: "full" | "conditions" | "actions" | "useCases";
}

export interface ExplainRuleResponse {
  success: boolean;
  explanation?: string;
  error?: string;
}

export interface ValidateRuleOptions {
  rule: any;
  userId?: string;
}

export interface ValidateRuleResponse {
  valid: boolean;
  errors?: any[];
  aiExplanation?: string;
  suggestions?: string[];
  issues?: string[];
  warnings?: string[];
}

export interface TestScenario {
  name: string;
  data: Record<string, any>;
  shouldTrigger?: boolean;
  description?: string;
}

export interface GenerateTestsOptions {
  rule: Rule;
  type?: "all" | "positive" | "negative" | "edge" | "suite";
  count?: number;
}

export interface GenerateTestsResponse {
  success: boolean;
  scenarios?: TestScenario[];
  error?: string;
}

/**
 * KRule AI SDK Client
 * Generate and manage business rules using natural language
 */
export class KRuleAI {
  private apiKey?: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: KRuleAIConfig = {}) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "http://localhost:3000/api/ai";
    this.timeout = config.timeout || 30000; // 30 seconds
  }

  /**
   * Generate a rule from natural language
   *
   * @example
   * const result = await client.generateRule({
   *   prompt: "Give VIP users 20% off when cart is over $100"
   * });
   */
  async generateRule(options: GenerateRuleOptions): Promise<GenerateRuleResponse> {
    return this.request<GenerateRuleResponse>("/generate", {
      method: "POST",
      body: JSON.stringify({
        prompt: options.prompt,
        userId: options.userId,
      }),
    });
  }

  /**
   * Explain a rule in plain language
   *
   * @example
   * const result = await client.explainRule({
   *   rule: myRule,
   *   type: "full"
   * });
   */
  async explainRule(options: ExplainRuleOptions): Promise<ExplainRuleResponse> {
    return this.request<ExplainRuleResponse>("/explain", {
      method: "POST",
      body: JSON.stringify({
        rule: options.rule,
        type: options.type || "full",
      }),
    });
  }

  /**
   * Validate a rule with AI-assisted error explanations
   *
   * @example
   * const result = await client.validateRule({
   *   rule: myRule
   * });
   */
  async validateRule(options: ValidateRuleOptions): Promise<ValidateRuleResponse> {
    return this.request<ValidateRuleResponse>("/validate", {
      method: "POST",
      body: JSON.stringify({
        rule: options.rule,
        userId: options.userId,
      }),
    });
  }

  /**
   * Generate test scenarios for a rule
   *
   * @example
   * const result = await client.generateTests({
   *   rule: myRule,
   *   type: "suite"
   * });
   */
  async generateTests(options: GenerateTestsOptions): Promise<GenerateTestsResponse> {
    return this.request<GenerateTestsResponse>("/test-scenarios", {
      method: "POST",
      body: JSON.stringify({
        rule: options.rule,
        type: options.type || "all",
        count: options.count || 3,
      }),
    });
  }

  /**
   * Create a conversational session
   */
  createConversation(userId?: string) {
    return new Conversation(this, userId);
  }

  /**
   * Make HTTP request to API
   */
  private async request<T>(endpoint: string, init: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((init.headers as Record<string, string>) || {}),
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(error.error || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }
        throw error;
      }

      throw new Error("Unknown error occurred");
    }
  }
}

/**
 * Conversational session for multi-turn interactions
 */
export class Conversation {
  private client: KRuleAI;
  private userId?: string;
  private conversationId?: string;
  private messages: Array<{ role: string; content: string }> = [];
  private currentRule?: Rule;

  constructor(client: KRuleAI, userId?: string) {
    this.client = client;
    this.userId = userId;
  }

  /**
   * Send a message and get a response
   */
  async send(message: string): Promise<string> {
    // Add user message to history
    this.messages.push({ role: "user", content: message });

    try {
      // Generate rule from message
      const result = await this.client.generateRule({
        prompt: message,
        userId: this.userId,
      });

      if (result.success && result.rule) {
        this.currentRule = result.rule;
        const response = "I've generated a rule based on your description. You can access it using getRule().";
        this.messages.push({ role: "assistant", content: response });
        return response;
      } else {
        const response = result.error || "Failed to generate rule";
        this.messages.push({ role: "assistant", content: response });
        return response;
      }
    } catch (error) {
      const response = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
      this.messages.push({ role: "assistant", content: response });
      return response;
    }
  }

  /**
   * Get the current rule being worked on
   */
  getRule(): Rule | undefined {
    return this.currentRule;
  }

  /**
   * Get conversation history
   */
  getHistory(): Array<{ role: string; content: string }> {
    return [...this.messages];
  }

  /**
   * Clear conversation history
   */
  clear(): void {
    this.messages = [];
    this.currentRule = undefined;
    this.conversationId = undefined;
  }
}

export default KRuleAI;
