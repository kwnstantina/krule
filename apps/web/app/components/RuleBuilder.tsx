"use client";
import React from "react";
import { useState } from "react";
import RuleForm from "./RuleForm";
import RuleTester from "./RuleTester";
import RuleExporter from "./RuleExporter";
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
  const [activeTab, setActiveTab] = useState<"builder" | "tester" | "exporter">("builder");

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
      <header className={styles.header}>
        <h1 className={styles.title}>KRule - Rule Engine Builder</h1>
        <p className={styles.subtitle}>
          Build, test, and export rules for different use case scenarios with an intuitive visual interface
        </p>
      </header>

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${activeTab === "builder" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("builder")}
        >
          🛠️ Rule Builder
          <span className={styles.tabBadge}>{rules.length}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === "tester" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("tester")}
        >
          🧪 Test Rules
        </button>
        <button
          className={`${styles.tab} ${activeTab === "exporter" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("exporter")}
        >
          📤 Export & Examples
        </button>
      </div>

      <div className={styles.content}>

        {activeTab === "builder" && (
          <div>
            <RuleForm onSave={addRule} />
            <div className={styles.rulesSection}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 className={styles.sectionTitle}>
                  📋 Created Rules
                </h3>
                {rules.length === 0 && (
                  <button
                    onClick={loadExampleRules}
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      border: "none",
                      padding: "0.6rem 1.2rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "500",
                      fontSize: "0.9rem"
                    }}
                  >
                    ⚡ Load Example Rules
                  </button>
                )}
              </div>
              {rules.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>📝</div>
                  <h4 style={{ margin: "0 0 0.5rem 0", color: "#4a5568" }}>No rules created yet</h4>
                  <p style={{ margin: 0 }}>Create your first rule using the form above or load example rules to get started</p>
                </div>
              ) : (
                <div className={styles.rulesList}>
                  {rules.map(rule => (
                    <div key={rule.id} className={styles.ruleCard}>
                      <div className={styles.ruleCardHeader}>
                        <div>
                          <h4 className={styles.ruleTitle}>{rule.name || "Unnamed Rule"}</h4>
                          <div className={styles.ruleMetadata}>
                            <div className={styles.metadataItem}>
                              <span className={styles.priorityBadge}>Priority: {rule.priority}</span>
                            </div>
                            <div className={styles.metadataItem}>
                              🔗 {rule.condition.conditions.length} condition(s)
                            </div>
                            <div className={styles.metadataItem}>
                              ⚡ {rule.actions.length} action(s)
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteRule(rule.id!)}
                          className={styles.deleteButton}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "tester" && <RuleTester rules={rules} />}
        {activeTab === "exporter" && <RuleExporter rules={rules} />}
      </div>
    </div>
  );
}