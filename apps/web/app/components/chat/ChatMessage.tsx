"use client";

import React from "react";
import styles from "./ChatMessage.module.css";

export interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";
  const isSystem = role === "system";

  return (
    <div className={`${styles.message} ${isUser ? styles.user : styles.assistant}`}>
      {!isUser && !isSystem && (
        <div className={styles.avatar}>
          <span className={styles.avatarIcon}>🤖</span>
        </div>
      )}

      <div className={styles.content}>
        {isSystem && (
          <div className={styles.systemBadge}>System</div>
        )}
        <div className={styles.text}>
          {content}
        </div>
        {timestamp && (
          <div className={styles.timestamp}>
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>

      {isUser && (
        <div className={`${styles.avatar} ${styles.avatarUser}`}>
          <span className={styles.avatarIcon}>👤</span>
        </div>
      )}
    </div>
  );
}
