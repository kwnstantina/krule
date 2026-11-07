import React from "react";
import type { Condition, ConditionGroup, Rule } from "@repo/core/evaluators";
import styles from "./RuleSummary.module.css";

function formatValue(value: unknown): string {
  return typeof value === "string" ? `"${value}"` : JSON.stringify(value);
}

type Item = Condition | { operator: string; conditions: Item[] };

function isGroup(item: Item): item is { operator: string; conditions: Item[] } {
  return "conditions" in item;
}

function ConditionList({ group }: { group: ConditionGroup }) {
  const items: Item[] = group.conditions;
  return (
    <div className={styles.conditions}>
      {items.map((cond, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className={styles.joiner}>{group.operator}</span>}
          {isGroup(cond) ? (
            <div className={styles.nested}>
              <ConditionList group={cond} />
            </div>
          ) : (
            <code className={styles.condition}>
              <span className={styles.field}>{cond.field}</span>
              <span className={styles.op}>{cond.operator}</span>
              <span className={styles.value}>{formatValue(cond.value)}</span>
            </code>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/** The IF / THEN reading of an executable rule, shared by the builder list and the AI preview. */
export default function RuleSummary({ rule }: { rule: Rule }) {
  return (
    <div className={styles.summary}>
      <div className={styles.block}>
        <span className={styles.keyword}>If</span>
        {rule.condition.conditions.length > 0 ? (
          <ConditionList group={rule.condition} />
        ) : (
          <span className={styles.empty}>always</span>
        )}
      </div>
      <div className={styles.block}>
        <span className={styles.keyword}>Then</span>
        <div className={styles.conditions}>
          {rule.actions.map((action, idx) => (
            <code key={idx} className={styles.action}>
              <span className={styles.field}>{action.type}</span>
              <span className={styles.op}>→</span>
              <span>{action.target}</span>
              {action.payload !== undefined && action.payload !== "" && (
                <span className={styles.value}>{JSON.stringify(action.payload)}</span>
              )}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}
