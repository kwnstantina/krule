"use client";
import React from "react";
import { useState } from "react";
import RuleForm from "./RuleForm";
import RuleTester from "./RuleTester";
import RuleExporter from "./RuleExporter";
import AIAssistant from "./AIAssistant";
import { Rule } from "@repo/core/evaluators";
import styles from "./RuleBuilder.module.css";

const exampleRules: Rule[] = [
  {
    id: "example-1",
    name: "Premium User Discount",
    priority: 10,
    condition: {
      operator: "AND",
      conditions: [
        { field: "userType", operator: "==", value: "premium" },
        { field: "cartValue", operator: ">=", value: 100 }
      ]
    },
    actions: [
      { type: "discount", target: "cart", payload: { percentage: 15 } }
    ]
  },
  {
    id: "example-2",
    name: "Content Moderation Alert",
    priority: 20,
    condition: {
      operator: "OR",
      conditions: [
        { field: "reportCount", operator: ">=", value: 3 },
        { field: "sentiment", operator: "==", value: "negative" }
      ]
    },
    actions: [
      { type: "flag", target: "content", payload: { reason: "review_required" } }
    ]
  }
];

export default function RuleBuilder() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [activeTab, setActiveTab] = useState<"builder" | "tester" | "exporter" | "ai">("builder");

  const addRule = (rule: Rule) => {
    setRules(prev => [...prev, { ...rule, id: Date.now().toString() }]);
  };

  const updateRule = (id: string, updatedRule: Rule) => {
    setRules(prev => prev.map(rule => rule.id === id ? { ...updatedRule, id } : rule));
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(rule => rule.id !== id));
  };

  const loadExampleRules = () => {
    setRules(exampleRules);
  };


  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.backgroundContainer}>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
        <div className={styles.gradientOrb3}></div>
        <div className={styles.gridPattern}></div>
      </div>

      <div className={styles.contentWrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>KRule - Rule Engine Builder</h1>
          <p className={styles.subtitle}>
            Build, test, and export rules for different use case scenarios with an intuitive visual interface
          </p>
        </header>

        <div className={styles.tabContainer}>
          <button
            className={`${styles.tab} ${activeTab === "ai" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("ai")}
          >
            🤖 AI Assistant
          </button>
          <button
            className={`${styles.tab} ${activeTab === "builder" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("builder")}
          >
            Rule Builder
            <span className={styles.tabBadge}>{rules.length}</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === "tester" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("tester")}
          >
            Test Rules
          </button>
          <button
            className={`${styles.tab} ${activeTab === "exporter" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("exporter")}
          >
            Export & Examples
          </button>
        </div>

      <div className={styles.content}>

          {activeTab === "builder" && (
            <div>
              <RuleForm onSave={addRule} />
              <div className={styles.rulesSection}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h3 className={styles.sectionTitle}>
                    Created Rules
                  </h3>
                  {rules.length === 0 && (
                    <button
                      onClick={loadExampleRules}
                      style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "0.9375rem",
                        letterSpacing: "-0.01em",
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                        transition: "all 0.3s ease"
                      }}
                    >
                      Load Example Rules
                    </button>
                  )}
                </div>
                {rules.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>💡</div>
                    <h4 style={{ margin: "0 0 0.5rem 0" }}>No rules created yet</h4>
                    <p style={{ margin: 0 }}>Create your first rule using the form above or load example rules to get started</p>
                  </div>
                ) : (
                  <div className={styles.rulesList}>
                    {rules.map(rule => (
                      <div key={rule.id} className={styles.ruleCard}>
                        {/* Header */}
                        <div className={styles.ruleCardHeader}>
                          <h4 className={styles.ruleTitle}>{rule.name || "Unnamed Rule"}</h4>
                          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                            <span className={styles.ruleStatus}>Active</span>
                            <button
                              onClick={() => deleteRule(rule.id!)}
                              className={styles.deleteButton}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className={styles.ruleMetadata}>
                          <div className={styles.metadataItem}>
                            <span className={styles.priorityBadge}>Priority {rule.priority}</span>
                          </div>
                          <div className={styles.metadataItem}>
                            <span className={styles.conditionCount}>
                              {rule.condition.conditions.length} Condition{rule.condition.conditions.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className={styles.metadataItem}>
                            <span className={styles.actionCount}>
                              {rule.actions.length} Action{rule.actions.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {/* IF Condition Block */}
                        <div className={styles.ruleBlock}>
                          <div className={styles.blockHeader}>
                            <div className={styles.blockLabel}>IF</div>
                            <div className={styles.blockTitle}>Conditions</div>
                          </div>
                          <div className={styles.blockContent}>
                            {rule.condition.conditions.map((cond: any, idx: number) => (
                              <React.Fragment key={idx}>
                                {idx > 0 && (
                                  <div className={styles.logicConnector}>{rule.condition.operator}</div>
                                )}
                                <div className={styles.conditionRow}>
                                  <span className={styles.conditionField}>{cond.field}</span>
                                  <span className={styles.conditionOperator}>{cond.operator}</span>
                                  <span className={styles.conditionValue}>
                                    {typeof cond.value === "string" ? `"${cond.value}"` : cond.value}
                                  </span>
                                </div>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className={styles.flowArrow}>↓</div>

                        {/* THEN Action Block */}
                        <div className={styles.ruleBlock}>
                          <div className={styles.blockHeader}>
                            <div className={styles.blockLabel}>THEN</div>
                            <div className={styles.blockTitle}>Actions</div>
                          </div>
                          <div className={styles.blockContent}>
                            {rule.actions.map((action: any, idx: number) => (
                              <div key={idx} className={styles.actionRow}>
                                <span className={styles.actionIcon}>⚡</span>
                                <span className={styles.actionText}>
                                  {action.type} on {action.target}
                                  {action.payload && `: ${JSON.stringify(action.payload)}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <AIAssistant
              onRuleGenerated={(rule) => {
                addRule(rule);
                setActiveTab("builder"); // Switch to builder tab after accepting rule
              }}
              userId="demo-user"
            />
          )}

          {activeTab === "tester" && <RuleTester rules={rules} />}
          {activeTab === "exporter" && <RuleExporter rules={rules} />}
        </div>
      </div>
    </div>
  );
}