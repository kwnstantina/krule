import Groq from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

/**
 * Groq client wrapper with configuration and helpers
 */
export class GroqClient {
  private client: Groq;
  private defaultModel: string = "llama-3.3-70b-versatile";
  private defaultTemperature: number = 0.7;
  private maxTokens: number = 2048;

  constructor(apiKey?: string) {
    if (!apiKey && !process.env.GROQ_API_KEY) {
      throw new Error(
        "Groq API key is required. Set GROQ_API_KEY environment variable or pass apiKey to constructor."
      );
    }

    this.client = new Groq({
      apiKey: apiKey || process.env.GROQ_API_KEY,
    });
  }

  /**
   * Generate a chat completion
   */
  async chat(
    messages: ChatCompletionMessageParam[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    }
  ) {
    const response = await this.client.chat.completions.create({
      model: options?.model || this.defaultModel,
      messages,
      temperature: options?.temperature ?? this.defaultTemperature,
      max_tokens: options?.maxTokens || this.maxTokens,
      stream: options?.stream || false,
    });

    return response;
  }

  /**
   * Generate a streaming chat completion
   */
  async *chatStream(
    messages: ChatCompletionMessageParam[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    const stream = await this.client.chat.completions.create({
      model: options?.model || this.defaultModel,
      messages,
      temperature: options?.temperature ?? this.defaultTemperature,
      max_tokens: options?.maxTokens || this.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  /**
   * Simple completion for single-turn requests
   */
  async complete(
    systemPrompt: string,
    userPrompt: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: options?.model || this.defaultModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: options?.temperature ?? this.defaultTemperature,
      max_tokens: options?.maxTokens || this.maxTokens,
      stream: false as const,
    });

    return response.choices[0]?.message?.content || "";
  }

  /**
   * Estimate token count (rough approximation)
   * More accurate would use tiktoken, but this is good enough
   */
  estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Truncate messages to fit within context window
   * Keeps system message and most recent messages
   */
  truncateMessages(
    messages: ChatCompletionMessageParam[],
    maxTokens: number = 6000
  ): ChatCompletionMessageParam[] {
    let totalTokens = 0;
    const result: ChatCompletionMessageParam[] = [];

    // Always keep system message (first)
    const firstMessage = messages[0];
    if (messages.length > 0 && firstMessage && firstMessage.role === "system") {
      result.push(firstMessage);
      totalTokens += this.estimateTokens(String(firstMessage.content ?? ""));
      messages = messages.slice(1);
    }

    // Add messages from end (most recent) until we hit limit
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (!msg) continue;
      const tokens = this.estimateTokens(String(msg.content ?? ""));

      if (totalTokens + tokens > maxTokens) {
        break;
      }

      result.unshift(msg);
      totalTokens += tokens;
    }

    return result;
  }

  /**
   * Set default model
   */
  setDefaultModel(model: string) {
    this.defaultModel = model;
  }

  /**
   * Set default temperature
   */
  setDefaultTemperature(temperature: number) {
    this.defaultTemperature = temperature;
  }
}

export default GroqClient;
