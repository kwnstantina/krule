"use client";

import React, { useState } from "react";
import { Rule, executeRules } from "@repo/core/evaluators";
import styles from "./RuleTester.module.css";

interface RuleTesterProps {
  rules: Rule[];
}

export default function RuleTester({ rules }: RuleTesterProps) {
  const [testData, setTestData] = useState(`{
  "userType": "premium",
  "age": 28,
  "country": "US",
  "cartValue": 150,
  "reportCount": 0,
  "verified": true
}`);
  const [results, setResults] = useState<ReturnType<typeof executeRules> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    try {
      const context = JSON.parse(testData);
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      const testResults = executeRules(rules, context);
      setResults(testResults);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format");
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleScenarios = [
    {
      name: "E-commerce User",
      data: {
        userType: "premium",
        age: 28,
        country: "US",
        cartValue: 150,
        items: ["electronics", "books"],
        verified: true
      }
    },
    {
      name: "Content Moderation",
      data: {
        content: "This is a test message",
        userId: "user123",
        reportCount: 0,
        sentiment: "positive",
        verified: true
      }
    },
    {
      name: "Access Control",
      data: {
        role: "admin",
        department: "engineering",
        clearanceLevel: 3,
        lastLogin: "2024-01-15",
        verified: true
      }
    },
    {
      name: "High Risk User",
      data: {
        userType: "basic",
        reportCount: 5,
        sentiment: "negative",
        verified: false,
        country: "Unknown"
      }
    }
  ];

  return (
    <section className={styles.container} aria-labelledby="tester-title">
      <div className={styles.head}>
        <h2 id="tester-title" className="k-h3">
          Test against sample data
        </h2>
        <p className="k-muted">
          Rules run in priority order against the JSON context. Results show the final action for each target.
        </p>
      </div>

      {rules.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No rules to test</p>
          <p className="k-muted">Create rules in the Build tab, or load the examples there.</p>
        </div>
      ) : (
        <div className={styles.testGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <label htmlFor="tester-context" className={styles.panelTitle}>
                Context <span className={styles.panelMeta}>JSON</span>
              </label>
            </div>
            <textarea
              id="tester-context"
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              className={`k-input k-input--mono ${styles.textarea}`}
              placeholder="Enter test data as JSON..."
              spellCheck={false}
            />

            <div className={styles.scenarios}>
              <span className={styles.scenariosLabel}>Scenarios</span>
              {exampleScenarios.map((scenario) => (
                <button
                  key={scenario.name}
                  type="button"
                  onClick={() => setTestData(JSON.stringify(scenario.data, null, 2))}
                  className={styles.scenario}
                >
                  {scenario.name}
                </button>
              ))}
            </div>

            <button type="button" onClick={runTest} disabled={isLoading} className="k-btn k-btn--primary">
              {isLoading ? "Running…" : "Run rules"}
            </button>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelTitle}>Result</h3>
              {results && results.size > 0 && (
                <span className={styles.resultCount}>
                  {results.size} target{results.size !== 1 ? "s" : ""} affected
                </span>
              )}
            </div>

            <div className={styles.results} aria-live="polite">
              {error && (
                <div className={styles.errorMessage} role="alert">
                  <strong>Could not run.</strong> {error}
                </div>
              )}

              {results && results.size === 0 && (
                <div className={styles.placeholder}>
                  <p>No rule matched this context.</p>
                  <p className={styles.placeholderSub}>Adjust the data or the rule conditions.</p>
                </div>
              )}

              {results && results.size > 0 && (
                <ul className={styles.resultList}>
                  {Array.from(results.entries()).map(([target, action]) => (
                    <li key={target} className={styles.resultItem}>
                      <code className={styles.resultTarget}>{target}</code>
                      <span className={styles.resultType}>{action.type}</span>
                      {action.payload !== undefined && action.payload !== "" && (
                        <code className={styles.resultPayload}>{JSON.stringify(action.payload)}</code>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {!results && !error && (
                <div className={styles.placeholder}>
                  <p>Ready when you are.</p>
                  <p className={styles.placeholderSub}>Edit the context and run the rules.</p>
                </div>
              )}
            </div>

            <div className={styles.activeRules}>
              <h4 className={styles.activeRulesTitle}>Rules in play ({rules.length})</h4>
              <ul className={styles.activeRulesList}>
                {rules.map((rule, index) => (
                  <li key={rule.id || index}>
                    <span className={styles.activeRuleName}>{rule.name || "Unnamed rule"}</span>
                    <span className={styles.activeRuleMeta}>
                      priority {rule.priority}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
