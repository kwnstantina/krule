"use client";

import React from "react";
import styles from "./StreamingIndicator.module.css";

export default function StreamingIndicator() {
  return (
    <div className={styles.container}>
      <div className={styles.avatar}>
        <span className={styles.avatarIcon}>🤖</span>
      </div>

      <div className={styles.content}>
        <div className={styles.dots}>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
        <div className={styles.text}>AI is thinking...</div>
      </div>
    </div>
  );
}
