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

export default function AIAssistant({ onRuleGenerated, userId }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "👋 Welcome to the AI Rule Generator! Describe the rule you want to create in plain English, and I'll generate it for you.",
      timestamp: new Date(),
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentRule, setCurrentRule] = useState<Rule | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        content: "✓ Rule accepted! The rule has been added to your rule list. You can find it in the Builder tab.",
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
        content: "New conversation started! What rule would you like to create?",
        timestamp: new Date(),
      },
    ]);
    setCurrentRule(null);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3 className={styles.title}>🤖 AI Rule Assistant</h3>
          <p className={styles.subtitle}>
            Describe your rule in plain language, and I'll generate it for you
          </p>
        </div>
        <button
          onClick={handleNewConversation}
          className={styles.newChatButton}
          title="Start new conversation"
        >
          ✨ New Chat
        </button>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
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

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={styles.inputContainer}>
        <ChatInput
          onSend={handleSendMessage}
          disabled={isStreaming}
          placeholder="E.g., 'Give VIP users 20% off when their cart is over $100'"
        />
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <button
          onClick={() => handleSendMessage("Create a content moderation rule")}
          className={styles.quickAction}
          disabled={isStreaming}
        >
          📝 Content Moderation
        </button>
        <button
          onClick={() => handleSendMessage("Create a user access control rule")}
          className={styles.quickAction}
          disabled={isStreaming}
        >
          🔐 Access Control
        </button>
        <button
          onClick={() => handleSendMessage("Create an e-commerce discount rule")}
          className={styles.quickAction}
          disabled={isStreaming}
        >
          💰 Discount Rule
        </button>
      </div>
    </div>
  );
}
