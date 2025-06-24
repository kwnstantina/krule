"use client";

import React , { useState }from "react";
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
  const [results, setResults] = useState<Map<string, any> | null>(null);
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
    <div className={styles.container}>
      <h3 className={styles.title}>
        🧪 Test Your Rules
      </h3>
      
      {rules.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📝</div>
          <h4 style={{ margin: "0 0 0.5rem 0", color: "#4a5568" }}>No rules to test</h4>
          <p  className={styles.paragraph}>
            Create some rules first in the Rule Builder tab, or load example rules to get started.
          </p>
        </div>
      ) : (
        <div className={styles.testGrid}>
          <div className={styles.inputSection}>
            <h4 className={styles.sectionTitle}>
              📝 Test Data (JSON)
            </h4>
            <textarea
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              className={styles.textarea}
              placeholder="Enter test data as JSON..."
            />
            
            <div className={styles.examplesSection}>
              <h5 className={styles.sectionTitle} style={{ fontSize: "1rem" }}>
                💡 Example Scenarios
              </h5>
              <div className={styles.exampleButtons}>
                {exampleScenarios.map((scenario, index) => (
                  <button
                    key={index}
                    onClick={() => setTestData(JSON.stringify(scenario.data, null, 2))}
                    className={styles.exampleButton}
                  >
                    {scenario.name}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={runTest}
              disabled={isLoading}
              className={styles.runButton}
            >
              {isLoading ? "🔄 Running..." : "🚀 Run Test"}
            </button>
          </div>
          
          <div className={styles.resultsSection}>
            <h4 className={styles.sectionTitle}>
              📊 Test Results
            </h4>
            
            {error && (
              <div className={styles.errorMessage}>
                <strong>❌ Error:</strong> {error}
              </div>
            )}
            
            <div className={styles.resultsContainer}>
              {results && (
                <>
                  {results.size === 0 ? (
                    <div className={styles.noResults}>
                      <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🤷‍♂️</div>
                      <div>No rules were triggered by the test data.</div>
                      <div style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                        Try adjusting your test data or rule conditions.
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.resultsHeader}>
                        ✅ {results.size} action(s) triggered
                      </div>
                      <div className={styles.resultsContent}>
                        {Array.from(results.entries()).map(([target, action], index) => (
                          <div key={index} className={styles.resultItem}>
                            <div className={styles.resultTarget}>
                              🎯 Target: {target}
                            </div>
                            <div className={styles.resultDetails}>
                              <div className={styles.resultDetail}>
                                <span className={styles.resultDetailLabel}>Type:</span> {action.type}
                              </div>
                              {action.payload && (
                                <div className={styles.resultDetail}>
                                  <span className={styles.resultDetailLabel}>Payload:</span> {JSON.stringify(action.payload)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
              
              {!results && !error && (
                <div className={styles.noResults}>
                  <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚡</div>
                  <div>Ready to test your rules</div>
                  <div style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                    Enter test data and click "Run Test" to see results
                  </div>
                </div>
              )}
            </div>
            
            <div className={styles.activeRulesSection}>
              <h5 className={styles.sectionTitle} style={{ fontSize: "1rem" }}>
                📋 Active Rules ({rules.length})
              </h5>
              <div className={styles.activeRulesList}>
                {rules.map((rule, index) => (
                  <div key={rule.id || index} className={styles.activeRuleItem}>
                    <div className={styles.activeRuleName}>{rule.name}</div>
                    <div className={styles.activeRuleMeta}>
                      Priority: {rule.priority} | Conditions: {rule.condition.conditions.length} | Actions: {rule.actions.length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}