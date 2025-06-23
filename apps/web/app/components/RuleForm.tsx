"use client";
import React , { useState }from "react";
import { Rule, Condition, ConditionGroup } from "@repo/core/evaluators";
import styles from "./RuleForm.module.css";

interface RuleFormProps {
  onSave: (rule: Rule) => void;
  initialRule?: Rule;
}

export default function RuleForm({ onSave, initialRule }: RuleFormProps) {
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

  const loadExample = (example: any) => {
    setName(example.name);
    setPriority(example.priority);
    setConditions(example.conditions);
    setActions(example.actions);
  };

  const addCondition = () => {
    setConditions(prev => [...prev, {
      field: "",
      operator: "==" as any,
      value: ""
    }]);
  };

  const updateCondition = (index: number, field: keyof Condition, value: any) => {
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

  const updateAction = (index: number, field: string, value: any) => {
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
    <div>
      <div className={styles.exampleRules}>
        <h4 className={styles.exampleTitle}>
          ⚡ Quick Start Examples
        </h4>
        <div className={styles.exampleGrid}>
          {exampleRules.map((example, index) => (
            <div
              key={index}
              className={styles.exampleCard}
              onClick={() => loadExample(example)}
            >
              <h5 className={styles.exampleCardTitle}>{example.name}</h5>
              <p className={styles.exampleCardDesc}>
                {example.conditions.length} condition(s), {example.actions.length} action(s)
              </p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <h3 className={styles.formTitle}>
          🛠️ Create New Rule
        </h3>
        
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Rule Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a descriptive rule name"
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Priority (higher = first):
            </label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              placeholder="0"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>
              🔗 Conditions
            </h4>
            <button type="button" onClick={addCondition} className={styles.addButton}>
              + Add Condition
            </button>
          </div>
          
          {conditions.map((condition, index) => (
            <div key={index} className={styles.itemGrid}>
              <input
                type="text"
                placeholder="Field name (e.g. userType, age)"
                value={(condition as Condition).field || ""}
                onChange={(e) => updateCondition(index, "field", e.target.value)}
                className={styles.input}
              />
              <select
                value={(condition as Condition).operator || "=="}
                onChange={(e) => updateCondition(index, "operator", e.target.value)}
                className={styles.select}
              >
                {operators.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Value (e.g. premium, 25, true)"
                value={(condition as Condition).value || ""}
                onChange={(e) => {
                  let value: any = e.target.value;
                  // Try to parse as number or boolean
                  if (!isNaN(Number(value)) && value !== "") {
                    value = Number(value);
                  } else if (value === "true" || value === "false") {
                    value = value === "true";
                  }
                  updateCondition(index, "value", value);
                }}
                className={styles.input}
              />
              <button
                type="button"
                onClick={() => removeCondition(index)}
                className={styles.removeButton}
                title="Remove condition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>
              ⚡ Actions
            </h4>
            <button type="button" onClick={addAction} className={`${styles.addButton}`} style={{background: "linear-gradient(135deg, #38b2ac 0%, #319795 100%)"}}>
              + Add Action
            </button>
          </div>
          
          {actions.map((action, index) => (
            <div key={index} className={styles.itemGrid}>
              <input
                type="text"
                placeholder="Action type (e.g. discount, flag)"
                value={action.type}
                onChange={(e) => updateAction(index, "type", e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Target (e.g. cart, user)"
                value={action.target}
                onChange={(e) => updateAction(index, "target", e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Payload (e.g. {amount: 10})"
                value={action.payload || ""}
                onChange={(e) => updateAction(index, "payload", e.target.value)}
                className={styles.input}
              />
              <button
                type="button"
                onClick={() => removeAction(index)}
                className={styles.removeButton}
                title="Remove action"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={!name || conditions.length === 0 || actions.length === 0}
          className={styles.submitButton}
        >
          💾 Save Rule
        </button>
      </form>
    </div>
  );
}