"use client";

import React from "react";
import styles from "./StreamingIndicator.module.css";

export default function StreamingIndicator() {
  return (
    <div className={styles.container} role="status">
      <span className={styles.dots} aria-hidden="true">
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </span>
      <span className={styles.text}>Drafting…</span>
    </div>
  );
}
