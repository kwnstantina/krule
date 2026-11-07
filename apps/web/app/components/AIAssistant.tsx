"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Rule } from "@repo/core/evaluators";
import ChatMessage from "./chat/ChatMessage";
import ChatInput from "./chat/ChatInput";
import StreamingIndicator from "./chat/StreamingIndicator";
import RulePreview from "./chat/RulePreview";
import styles from "./AIAssistant.module.css";

export interface AIAssistantProps {
  onRuleGenerated?: (rule: Rule) => void;
  userId?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  rule?: Rule;
}

const QUICK_PROMPTS = [
  { label: "Content moderation", prompt: "Create a content moderation rule" },
  { label: "Access control", prompt: "Create a user access control rule" },
  { label: "Discount", prompt: "Create an e-commerce discount rule" },
];

export default function AIAssistant({ onRuleGenerated, userId }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "Describe a rule in plain language and I'll draft it as an executable rule you can review, refine and add to your list.",
      timestamp: new Date(),
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentRule, setCurrentRule] = useState<Rule | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    // Scroll the message list, not the page, so opening the tab doesn't jump.
    const list = messagesRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    try {
      // Call AI generate endpoint
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: content,
          userId: userId || "demo-user",
        }),
      });

      const data = await response.json();

      if (data.success && data.rule) {
        // Add assistant message with generated rule
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I've generated a rule based on your description. Here's what I created:`,
          timestamp: new Date(),
          rule: data.rule,
        };

        setMessages(prev => [...prev, assistantMessage]);
        setCurrentRule(data.rule);
      } else {
        // Error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I encountered an error: ${data.error || "Unknown error"}. Could you try rephrasing your request?`,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered a technical error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleAcceptRule = () => {
    if (currentRule && onRuleGenerated) {
      onRuleGenerated(currentRule);

      const confirmMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Rule added to your list. You'll find it in the Build tab.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, confirmMessage]);
      setCurrentRule(null);
    }
  };

  const handleRefineRule = () => {
    const refineMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "How would you like to refine this rule? Tell me what changes you'd like to make.",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, refineMessage]);
  };

  const handleExplainRule = async () => {
    if (!currentRule) return;

    setIsStreaming(true);

    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rule: currentRule,
          type: "full",
        }),
      });

      const data = await response.json();

      if (data.success && data.explanation) {
        const explainMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: data.explanation,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, explainMessage]);
      }
    } catch (error) {
      console.error("Failed to explain rule:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "system",
        content: "New conversation. What rule would you like to create?",
        timestamp: new Date(),
      },
    ]);
    setCurrentRule(null);
  };

  return (
    <section className={styles.container} aria-labelledby="ai-title">
      <div className={styles.header}>
        <div>
          <h2 id="ai-title" className="k-h3">
            AI assistant
          </h2>
          <p className="k-muted">Drafts a rule from your description. Review every rule before you add it.</p>
        </div>
        <button
          type="button"
          onClick={handleNewConversation}
          className="k-btn k-btn--ghost k-btn--sm"
        >
          New conversation
        </button>
      </div>

      <div ref={messagesRef} className={styles.messages} aria-live="polite">
        {messages.map((message) => (
          <React.Fragment key={message.id}>
            <ChatMessage
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
            {message.rule && (
              <RulePreview
                rule={message.rule}
                onAccept={handleAcceptRule}
                onRefine={handleRefineRule}
                onExplain={handleExplainRule}
              />
            )}
          </React.Fragment>
        ))}

        {isStreaming && <StreamingIndicator />}
      </div>

      <div className={styles.composer}>
        <div className={styles.quickActions}>
          <span className={styles.quickLabel}>Try</span>
          {QUICK_PROMPTS.map(({ label, prompt }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className={styles.quickAction}
              disabled={isStreaming}
            >
              {label}
            </button>
          ))}
        </div>
        <ChatInput
          onSend={handleSendMessage}
          disabled={isStreaming}
          placeholder="e.g. Give VIP users 20% off when their cart is over $100"
        />
      </div>
    </section>
  );
}
