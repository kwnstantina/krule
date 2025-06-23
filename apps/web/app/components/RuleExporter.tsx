"use client";

import React, { useState } from "react";
import { Rule } from "@repo/core/evaluators";
import styles from "./RuleExporter.module.css";

interface RuleExporterProps {
  rules: Rule[];
}

export default function RuleExporter({ rules }: RuleExporterProps) {
  const [exportFormat, setExportFormat] = useState<"json" | "typescript" | "javascript">("json");
  const [copied, setCopied] = useState(false);

  const generateExport = () => {
    switch (exportFormat) {
      case "json":
        return JSON.stringify(rules, null, 2);
      
      case "typescript":
        return `import { Rule, executeRules } from "@repo/core/evaluators";

const rules: Rule[] = ${JSON.stringify(rules, null, 2)};

// Usage example:
export function evaluateRules(context: Record<string, any>) {
  return executeRules(rules, context);
}

// Example usage:
// const context = { userType: "premium", cartValue: 150 };
// const results = evaluateRules(context);
// console.log(results);`;
      
      case "javascript":
        return `const { executeRules } = require("@repo/core/evaluators");

const rules = ${JSON.stringify(rules, null, 2)};

// Usage example:
function evaluateRules(context) {
  return executeRules(rules, context);
}

// Example usage:
// const context = { userType: "premium", cartValue: 150 };
// const results = evaluateRules(context);
// console.log(results);

module.exports = { rules, evaluateRules };`;
      
      default:
        return "";
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateExport());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadExport = () => {
    const content = generateExport();
    const extension = exportFormat === "json" ? "json" : exportFormat === "typescript" ? "ts" : "js";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `krule-rules.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const useCases = [
    {
      title: "E-commerce Pricing & Promotions",
      description: "Dynamic pricing rules, discount calculations, and promotional campaign logic based on user segments and cart values.",
      example: {
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
      }
    },
    {
      title: "Content Moderation & Safety",
      description: "Automated content filtering, user behavior analysis, and safety rule enforcement for platforms and communities.",
      example: {
        name: "Flag Suspicious Content",
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
    },
    {
      title: "Access Control & Security",
      description: "Role-based permissions, security policies, and access management for applications and systems.",
      example: {
        name: "Admin Access Control",
        priority: 30,
        condition: {
          operator: "AND",
          conditions: [
            { field: "role", operator: "==", value: "admin" },
            { field: "department", operator: "in", value: ["engineering", "security"] }
          ]
        },
        actions: [
          { type: "grant", target: "access", payload: { level: "full" } }
        ]
      }
    }
  ];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        📤 Export Rules & Use Cases
      </h3>
      
      <div className={styles.exportGrid}>
        <div className={styles.exportSection}>
          <h4 className={styles.sectionTitle}>
            🔧 Export Your Rules
          </h4>
          
          <div className={styles.formatSection}>
            <label className={styles.label}>
              Export Format:
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className={styles.select}
            >
              <option value="json">JSON (Data)</option>
              <option value="typescript">TypeScript (Code)</option>
              <option value="javascript">JavaScript (Code)</option>
            </select>
          </div>
          
          <div className={styles.buttonGroup}>
            <button
              onClick={copyToClipboard}
              disabled={rules.length === 0}
              className={`${styles.exportButton} ${styles.copyButton} ${copied ? styles.copyButtonSuccess : ""}`}
            >
              {copied ? "✅ Copied!" : "📋 Copy"}
            </button>
            <button
              onClick={downloadExport}
              disabled={rules.length === 0}
              className={`${styles.exportButton} ${styles.downloadButton}`}
            >
              💾 Download
            </button>
          </div>
          
          {rules.length === 0 && (
            <p className={styles.disabledMessage}>
              Create some rules first to enable export functionality.
            </p>
          )}
          
          <div className={styles.previewSection}>
            <h5 className={styles.sectionTitle} style={{ fontSize: "1rem" }}>
              👀 Preview
            </h5>
            <pre className={styles.codePreview}>
              {rules.length > 0 ? generateExport() : "// No rules to export\\n// Create some rules first"}
            </pre>
          </div>
        </div>
        
        <div className={styles.useCasesSection}>
          <h4 className={styles.sectionTitle}>
            💡 Use Case Examples
          </h4>
          
          {useCases.map((useCase, index) => (
            <div key={index} className={styles.useCaseCard}>
              <h5 className={styles.useCaseTitle}>
                {useCase.title}
              </h5>
              <p className={styles.useCaseDesc}>
                {useCase.description}
              </p>
              
              <details className={styles.useCaseExample}>
                <summary>
                  📝 View Example Rule
                </summary>
                <pre>
                  {JSON.stringify(useCase.example, null, 2)}
                </pre>
              </details>
            </div>
          ))}
          
          <div className={styles.integrationTips}>
            <h5 className={styles.integrationTitle}>
              💡 Integration Tips
            </h5>
            <ul className={styles.integrationList}>
              <li>Import rules from JSON for dynamic rule loading</li>
              <li>Use TypeScript exports for type safety in your apps</li>
              <li>Store rules in databases for multi-tenant applications</li>
              <li>Combine with React hooks for real-time rule evaluation</li>
              <li>Cache rule evaluation results for better performance</li>
              <li>Version your rules for rollback and change tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}