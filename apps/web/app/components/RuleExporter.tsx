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

  const formats: { key: typeof exportFormat; label: string }[] = [
    { key: "json", label: "JSON" },
    { key: "typescript", label: "TypeScript" },
    { key: "javascript", label: "JavaScript" },
  ];

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
    <section className={styles.container} aria-labelledby="exporter-title">
      <div className={styles.head}>
        <h2 id="exporter-title" className="k-h3">
          Export
        </h2>
        <p className="k-muted">Take your rules into your own codebase as data or as ready-to-run code.</p>
      </div>

      <div className={styles.exportGrid}>
        <div className={styles.panel}>
          <div className={styles.toolbar}>
            <div className={styles.formats} role="radiogroup" aria-label="Export format">
              {formats.map((format) => (
                <button
                  key={format.key}
                  type="button"
                  role="radio"
                  aria-checked={exportFormat === format.key}
                  className={styles.format}
                  onClick={() => setExportFormat(format.key)}
                >
                  {format.label}
                </button>
              ))}
            </div>
            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={copyToClipboard}
                disabled={rules.length === 0}
                className="k-btn k-btn--ghost k-btn--sm"
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={downloadExport}
                disabled={rules.length === 0}
                className="k-btn k-btn--primary k-btn--sm"
              >
                Download
              </button>
            </div>
          </div>

          <pre className={`k-code ${styles.codePreview}`}>
            {rules.length > 0 ? generateExport() : "// No rules to export yet.\n// Create some in the Build tab first."}
          </pre>
        </div>

        <aside className={styles.useCases}>
          <h3 className={styles.asideTitle}>Example rules by domain</h3>
          {useCases.map((useCase) => (
            <details key={useCase.title} className={styles.useCaseCard}>
              <summary>
                <span className={styles.useCaseTitle}>{useCase.title}</span>
                <span className={styles.useCaseDesc}>{useCase.description}</span>
              </summary>
              <pre className="k-code">{JSON.stringify(useCase.example, null, 2)}</pre>
            </details>
          ))}

          <div className={styles.tips}>
            <h3 className={styles.asideTitle}>Integration notes</h3>
            <ul className={styles.tipList}>
              <li>Load rules from JSON at runtime to change behaviour without a deploy.</li>
              <li>Use the TypeScript export for type checking against the engine.</li>
              <li>Version rule files alongside code so every change is reviewable.</li>
              <li>Store rules per tenant in a database for multi-tenant products.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
