"use client";
import React, { useId, useState } from "react";
import { Rule, Condition, ConditionGroup } from "@repo/core/evaluators";
import styles from "./RuleForm.module.css";

interface RuleFormProps {
  onSave: (rule: Rule) => void;
  initialRule?: Rule;
}

export default function RuleForm({ onSave, initialRule }: RuleFormProps) {
  const uid = useId();
  const [name, setName] = useState(initialRule?.name || "");
  const [priority, setPriority] = useState(initialRule?.priority || 0);
  const [conditions, setConditions] = useState<(Condition | ConditionGroup)[]>(
    initialRule?.condition?.conditions || []
  );
  const [actions, setActions] = useState(initialRule?.actions || []);

  const operators = ["==", "!=", ">", "<", ">=", "<=", "in", "not"];

  const exampleRules = [
    {
      name: "E-commerce VIP Discount",
      priority: 10,
      conditions: [{ field: "userType", operator: "==", value: "VIP" }, { field: "cartValue", operator: ">=", value: 500 }],
      actions: [{ type: "discount", target: "cart", payload: "20%" }]
    },
    {
      name: "Content Moderation",
      priority: 15,
      conditions: [{ field: "reportCount", operator: ">=", value: 3 }],
      actions: [{ type: "flag", target: "content", payload: "review" }]
    },
    {
      name: "Access Control",
      priority: 5,
      conditions: [{ field: "role", operator: "in", value: ["admin", "moderator"] }],
      actions: [{ type: "grant", target: "access", payload: "full" }]
    }
  ];

  const loadExample = (example: (typeof exampleRules)[number]) => {
    setName(example.name);
    setPriority(example.priority);
    setConditions(example.conditions);
    setActions(example.actions);
  };

  const addCondition = () => {
    setConditions(prev => [...prev, {
      field: "",
      operator: "==" as const,
      value: ""
    }]);
  };

  const updateCondition = (index: number, field: keyof Condition, value: Condition[keyof Condition]) => {
    setConditions(prev => prev.map((cond, i) => 
      i === index ? { ...cond, [field]: value } : cond
    ));
  };

  const removeCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  };

  const addAction = () => {
    setActions(prev => [...prev, {
      type: "",
      target: "",
      payload: ""
    }]);
  };

  const updateAction = (index: number, field: "type" | "target" | "payload", value: string) => {
    setActions(prev => prev.map((action, i) => 
      i === index ? { ...action, [field]: value } : action
    ));
  };

  const removeAction = (index: number) => {
    setActions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const rule: Rule = {
      name,
      priority,
      condition: {
        operator: "AND",
        conditions
      },
      actions
    };

    onSave(rule);
    
    // Reset form
    setName("");
    setPriority(0);
    setConditions([]);
    setActions([]);
  };

  return (
    <section className={styles.panel} aria-labelledby={`${uid}-title`}>
      <div className={styles.panelHead}>
        <h2 id={`${uid}-title`} className="k-h3">
          New rule
        </h2>
        <div className={styles.templates}>
          <span className={styles.templatesLabel}>Start from</span>
          {exampleRules.map((example) => (
            <button
              key={example.name}
              type="button"
              className={styles.template}
              onClick={() => loadExample(example)}
              title={`${example.conditions.length} condition${example.conditions.length !== 1 ? "s" : ""}, ${example.actions.length} action${example.actions.length !== 1 ? "s" : ""}`}
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div>
            <label className="k-label" htmlFor={`${uid}-name`}>
              Name
            </label>
            <input
              id={`${uid}-name`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Premium user discount"
              className="k-input"
              required
            />
          </div>
          <div>
            <label className="k-label" htmlFor={`${uid}-priority`}>
              Priority
            </label>
            <input
              id={`${uid}-priority`}
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              placeholder="0"
              className="k-input k-input--mono"
            />
          </div>
        </div>

        <div className={styles.section} role="group" aria-labelledby={`${uid}-if`}>
          <div className={styles.sectionHeader}>
            <h3 id={`${uid}-if`} className={styles.sectionTitle}>
              <span className={styles.keyword}>If</span> all of these hold
            </h3>
            <button type="button" onClick={addCondition} className="k-btn k-btn--ghost k-btn--sm">
              + Condition
            </button>
          </div>

          {conditions.length === 0 && <p className={styles.hint}>No conditions yet. Add at least one.</p>}

          {conditions.map((condition, index) => (
            <div key={index} className={styles.itemGrid}>
              <input
                type="text"
                aria-label={`Condition ${index + 1} field`}
                placeholder="field, e.g. userType"
                value={(condition as Condition).field || ""}
                onChange={(e) => updateCondition(index, "field", e.target.value)}
                className="k-input k-input--mono"
              />
              <select
                aria-label={`Condition ${index + 1} operator`}
                value={(condition as Condition).operator || "=="}
                onChange={(e) => updateCondition(index, "operator", e.target.value)}
                className={`k-input k-input--mono ${styles.select}`}
              >
                {operators.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
              <input
                type="text"
                aria-label={`Condition ${index + 1} value`}
                placeholder="value, e.g. premium or 25"
                value={(condition as Condition).value || ""}
                onChange={(e) => {
                  let value: string | number | boolean = e.target.value;
                  // Try to parse as number or boolean
                  if (!isNaN(Number(value)) && value !== "") {
                    value = Number(value);
                  } else if (value === "true" || value === "false") {
                    value = value === "true";
                  }
                  updateCondition(index, "value", value);
                }}
                className="k-input k-input--mono"
              />
              <button
                type="button"
                onClick={() => removeCondition(index)}
                className={styles.removeButton}
                aria-label={`Remove condition ${index + 1}`}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className={styles.section} role="group" aria-labelledby={`${uid}-then`}>
          <div className={styles.sectionHeader}>
            <h3 id={`${uid}-then`} className={styles.sectionTitle}>
              <span className={styles.keyword}>Then</span> do this
            </h3>
            <button type="button" onClick={addAction} className="k-btn k-btn--ghost k-btn--sm">
              + Action
            </button>
          </div>

          {actions.length === 0 && <p className={styles.hint}>No actions yet. Add at least one.</p>}

          {actions.map((action, index) => (
            <div key={index} className={styles.itemGrid}>
              <input
                type="text"
                aria-label={`Action ${index + 1} type`}
                placeholder="type, e.g. discount"
                value={action.type}
                onChange={(e) => updateAction(index, "type", e.target.value)}
                className="k-input k-input--mono"
              />
              <input
                type="text"
                aria-label={`Action ${index + 1} target`}
                placeholder="target, e.g. cart"
                value={action.target}
                onChange={(e) => updateAction(index, "target", e.target.value)}
                className="k-input k-input--mono"
              />
              <input
                type="text"
                aria-label={`Action ${index + 1} payload`}
                placeholder="payload, e.g. 15%"
                value={action.payload || ""}
                onChange={(e) => updateAction(index, "payload", e.target.value)}
                className="k-input k-input--mono"
              />
              <button
                type="button"
                onClick={() => removeAction(index)}
                className={styles.removeButton}
                aria-label={`Remove action ${index + 1}`}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <p className={styles.hint}>A rule needs a name, a condition and an action.</p>
          <button
            type="submit"
            disabled={!name || conditions.length === 0 || actions.length === 0}
            className="k-btn k-btn--primary"
          >
            Save rule
          </button>
        </div>
      </form>
    </section>
  );
}
