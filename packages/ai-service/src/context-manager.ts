import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

/**
 * Context Manager
 * Manages conversation history and context window
 */
export class ContextManager {
  private messages: ConversationMessage[] = [];
  private maxTokens: number;
  private systemPrompt: string;

  constructor(systemPrompt: string, maxTokens: number = 6000) {
    this.systemPrompt = systemPrompt;
    this.maxTokens = maxTokens;
  }

  /**
   * Add a user message
   */
  addUserMessage(content: string, metadata?: Record<string, any>) {
    this.messages.push({
      role: "user",
      content,
      timestamp: new Date(),
      metadata,
    });
  }

  /**
   * Add an assistant message
   */
  addAssistantMessage(content: string, metadata?: Record<string, any>) {
    this.messages.push({
      role: "assistant",
      content,
      timestamp: new Date(),
      metadata,
    });
  }

  /**
   * Get all messages formatted for Groq API
   */
  getMessages(): ChatCompletionMessageParam[] {
    const formatted: ChatCompletionMessageParam[] = [
      { role: "system", content: this.systemPrompt },
    ];

    // Add conversation messages
    for (const msg of this.messages) {
      formatted.push({
        role: msg.role,
        content: msg.content,
      });
    }

    return this.truncateToFit(formatted);
  }

  /**
   * Get last N messages
   */
  getLastMessages(count: number): ConversationMessage[] {
    return this.messages.slice(-count);
  }

  /**
   * Get message count
   */
  getMessageCount(): number {
    return this.messages.length;
  }

  /**
   * Clear all messages (except system prompt)
   */
  clear() {
    this.messages = [];
  }

  /**
   * Update system prompt
   */
  setSystemPrompt(prompt: string) {
    this.systemPrompt = prompt;
  }

  /**
   * Truncate messages to fit within token limit
   * Keeps system message and most recent messages
   */
  private truncateToFit(
    messages: ChatCompletionMessageParam[]
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

      if (totalTokens + tokens > this.maxTokens) {
        break;
      }

      result.splice(1, 0, msg); // Insert after system message
      totalTokens += tokens;
    }

    return result;
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Get conversation summary
   */
  getSummary(): {
    messageCount: number;
    estimatedTokens: number;
    timespan: { start?: Date; end?: Date };
  } {
    const timestamps = this.messages
      .map(m => m.timestamp)
      .filter((t): t is Date => t !== undefined);

    return {
      messageCount: this.messages.length,
      estimatedTokens: this.messages.reduce(
        (sum, msg) => sum + this.estimateTokens(msg.content),
        0
      ),
      timespan: {
        start: timestamps.length > 0 ? timestamps[0] : undefined,
        end: timestamps.length > 0 ? timestamps[timestamps.length - 1] : undefined,
      },
    };
  }

  /**
   * Export conversation for storage
   */
  export(): ConversationMessage[] {
    return [...this.messages];
  }

  /**
   * Import conversation from storage
   */
  import(messages: ConversationMessage[]) {
    this.messages = [...messages];
  }
}

export default ContextManager;
