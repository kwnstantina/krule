"use client";
import React from "react";
import { useEffect, useState } from "react";
import RuleForm from "./RuleForm";
import RuleTester from "./RuleTester";
import RuleExporter from "./RuleExporter";
import AIAssistant from "./AIAssistant";
import RuleSummary from "./RuleSummary";
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

type Tab = "builder" | "tester" | "exporter" | "ai";

const TABS: { key: Tab; label: string; hash: string }[] = [
  { key: "builder", label: "Build", hash: "" },
  { key: "tester", label: "Test", hash: "test" },
  { key: "exporter", label: "Export", hash: "export" },
  { key: "ai", label: "AI assistant", hash: "ai" },
];

export default function RuleBuilder() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("builder");

  // Tabs are linkable: /builder#test, #export, #ai.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const match = TABS.find(tab => tab.hash === hash);
    if (match) setActiveTab(match.key);
  }, []);

  const selectTab = (tab: Tab) => {
    setActiveTab(tab);
    const hash = TABS.find(t => t.key === tab)?.hash;
    window.history.replaceState(null, "", hash ? `#${hash}` : window.location.pathname);
  };

  const addRule = (rule: Rule) => {
    setRules(prev => [...prev, { ...rule, id: Date.now().toString() }]);
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(rule => rule.id !== id));
  };

  const loadExampleRules = () => {
    setRules(exampleRules);
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <p className="k-eyebrow">Runtime</p>
        <h1 className={styles.title}>Rule builder</h1>
        <p className={styles.subtitle}>
          Write executable rules for the krule engine, run them against sample data, and export them as code.
          Linking audited rules to executable ones is on the roadmap.
        </p>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Rule builder">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={styles.tab}
            onClick={() => selectTab(tab.key)}
          >
            {tab.label}
            {tab.key === "builder" && <span className={styles.tabCount}>{rules.length}</span>}
          </button>
        ))}
      </div>

      <div className={styles.content} role="tabpanel">
        {activeTab === "builder" && (
          <div className={styles.builderGrid}>
            <RuleForm onSave={addRule} />

            <section className={styles.rulesSection} aria-labelledby="rules-heading">
              <div className={styles.sectionHead}>
                <h2 id="rules-heading" className="k-h3">
                  Rules <span className={styles.count}>{rules.length}</span>
                </h2>
                {rules.length === 0 && (
                  <button type="button" onClick={loadExampleRules} className="k-btn k-btn--ghost k-btn--sm">
                    Load examples
                  </button>
                )}
              </div>

              {rules.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyTitle}>No rules yet</p>
                  <p className="k-muted">
                    Fill in the form, start from a template, or load the examples to see how rules read.
                  </p>
                </div>
              ) : (
                <ol className={styles.rulesList}>
                  {rules.map(rule => (
                    <li key={rule.id} className={styles.ruleCard}>
                      <div className={styles.ruleCardHeader}>
                        <div>
                          <h3 className={styles.ruleTitle}>{rule.name || "Unnamed rule"}</h3>
                          <p className={styles.ruleMeta}>
                            priority {rule.priority} · {rule.condition.conditions.length} condition
                            {rule.condition.conditions.length !== 1 ? "s" : ""} · {rule.actions.length} action
                            {rule.actions.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteRule(rule.id!)}
                          className="k-btn k-btn--quiet k-btn--sm"
                          aria-label={`Delete ${rule.name || "rule"}`}
                        >
                          Delete
                        </button>
                      </div>
                      <RuleSummary rule={rule} />
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        )}

        {activeTab === "ai" && (
          <AIAssistant
            onRuleGenerated={(rule) => {
              addRule(rule);
              selectTab("builder"); // Switch to builder tab after accepting rule
            }}
            userId="demo-user"
          />
        )}

        {activeTab === "tester" && <RuleTester rules={rules} />}
        {activeTab === "exporter" && <RuleExporter rules={rules} />}
      </div>
    </main>
  );
}
