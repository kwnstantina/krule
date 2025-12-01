"use client";

import React from "react";
import type { Rule } from "@repo/core/evaluators";
import styles from "./RulePreview.module.css";

export interface RulePreviewProps {
  rule: Rule;
  onAccept?: () => void;
  onRefine?: () => void;
  onExplain?: () => void;
}

export default function RulePreview({ rule, onAccept, onRefine, onExplain }: RulePreviewProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>Generated Rule Preview</h4>
        <div className={styles.badge}>✨ AI Generated</div>
      </div>

      <div className={styles.ruleCard}>
        {/* Rule Header */}
        <div className={styles.ruleHeader}>
          <h5 className={styles.ruleName}>{rule.name || "Unnamed Rule"}</h5>
          <span className={styles.priority}>Priority {rule.priority}</span>
        </div>

        {/* Conditions */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>IF</span>
            <span className={styles.sectionTitle}>Conditions</span>
          </div>
          <div className={styles.sectionContent}>
            {rule.condition.conditions.map((cond: any, idx: number) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <div className={styles.operator}>{rule.condition.operator}</div>
                )}
                <div className={styles.condition}>
                  <span className={styles.field}>{cond.field}</span>
                  <span className={styles.condOperator}>{cond.operator}</span>
                  <span className={styles.value}>
                    {typeof cond.value === "string" ? `"${cond.value}"` : JSON.stringify(cond.value)}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className={styles.arrow}>↓</div>

        {/* Actions */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>THEN</span>
            <span className={styles.sectionTitle}>Actions</span>
          </div>
          <div className={styles.sectionContent}>
            {rule.actions.map((action: any, idx: number) => (
              <div key={idx} className={styles.action}>
                <span className={styles.actionIcon}>⚡</span>
                <span className={styles.actionText}>
                  {action.type} on {action.target}
                  {action.payload && (
                    <span className={styles.payload}>
                      {JSON.stringify(action.payload)}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {onExplain && (
          <button
            onClick={onExplain}
            className={`${styles.button} ${styles.explainButton}`}
          >
            💡 Explain
          </button>
        )}
        {onRefine && (
          <button
            onClick={onRefine}
            className={`${styles.button} ${styles.refineButton}`}
          >
            ✏️ Refine
          </button>
        )}
        {onAccept && (
          <button
            onClick={onAccept}
            className={`${styles.button} ${styles.acceptButton}`}
          >
            ✓ Accept Rule
          </button>
        )}
      </div>
    </div>
  );
}
