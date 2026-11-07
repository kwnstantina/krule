"use client";

import React from "react";
import styles from "./ChatMessage.module.css";

export interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const author = role === "user" ? "You" : "krule";

  return (
    <div className={`${styles.message} ${styles[role]}`}>
      <div className={styles.meta}>
        <span className={styles.author}>{author}</span>
        {timestamp && (
          <time className={styles.timestamp} dateTime={new Date(timestamp).toISOString()}>
            {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </time>
        )}
      </div>
      <div className={styles.text}>{content}</div>
    </div>
  );
}
