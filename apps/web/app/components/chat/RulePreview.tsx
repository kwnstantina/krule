"use client";

import React from "react";
import type { Rule } from "@repo/core/evaluators";
import RuleSummary from "../RuleSummary";
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
        <span className={styles.badge}>Draft</span>
        <h4 className={styles.ruleName}>{rule.name || "Unnamed rule"}</h4>
        <span className={styles.priority}>priority {rule.priority}</span>
      </div>

      <RuleSummary rule={rule} />

      <div className={styles.actions}>
        {onExplain && (
          <button type="button" onClick={onExplain} className="k-btn k-btn--quiet k-btn--sm">
            Explain
          </button>
        )}
        {onRefine && (
          <button type="button" onClick={onRefine} className="k-btn k-btn--ghost k-btn--sm">
            Refine
          </button>
        )}
        {onAccept && (
          <button type="button" onClick={onAccept} className="k-btn k-btn--primary k-btn--sm">
            Add to rules
          </button>
        )}
      </div>
    </div>
  );
}
