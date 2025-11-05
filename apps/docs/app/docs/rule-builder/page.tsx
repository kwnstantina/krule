import React from 'react';

export const metadata = {
  title: 'Rule Builder Interface - KRule Documentation',
  description: 'Master the KRule visual interface for building complex business rules',
};

export default function RuleBuilderPage() {
  return (
    <div className="docs-content">
      <div className="docs-header">
        <h1>Rule Builder Interface</h1>
        <p className="lead">Learn how to use KRule's intuitive visual interface to build complex business rules without writing code.</p>
      </div>

      <div className="docs-section">
        <h2>Interface Overview</h2>
        <p>The Rule Builder provides a comprehensive visual environment for creating, editing, and managing business rules. The interface is designed to be intuitive for both technical and non-technical users.</p>
        
        <div className="interface-sections">
          <div className="section-card">
            <h3>📋 Rule List Panel</h3>
            <p>Browse, search, and organize your rules. Features include filtering by category, status, and last modified date.</p>
          </div>
          
          <div className="section-card">
            <h3>🎯 Condition Builder</h3>
            <p>Visual drag-and-drop interface for creating complex logical conditions with AND/OR operators.</p>
          </div>
          
          <div className="section-card">
            <h3>⚡ Action Designer</h3>
            <p>Define what happens when rule conditions are met, including calculations, assignments, and function calls.</p>
          </div>
          
          <div className="section-card">
            <h3>🧪 Test Panel</h3>
            <p>Test your rules with sample data and see results in real-time before deploying.</p>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Creating Your First Rule</h2>
        
        <div className="step-by-step">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Start a New Rule</h3>
              <p>Click the "Create New Rule" button in the main interface.</p>
              <div className="code-block">
                <pre><code>{`// Rule metadata will be initialized with:
{
  "id": "auto-generated-uuid",
  "name": "Untitled Rule",
  "description": "",
  "category": "general",
  "priority": 10,
  "enabled": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}`}</code></pre>
              </div>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Configure Rule Properties</h3>
              <p>Set the rule name, description, category, and priority.</p>
              <ul>
                <li><strong>Name:</strong> A descriptive name for your rule</li>
                <li><strong>Description:</strong> Detailed explanation of what the rule does</li>
                <li><strong>Category:</strong> Group rules by business domain</li>
                <li><strong>Priority:</strong> Execution order (higher numbers first)</li>
              </ul>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Build Conditions</h3>
              <p>Use the visual condition builder to define when the rule should execute.</p>
              <div className="visual-example">
                <div className="condition-block">
                  <span className="condition-field">user.age</span>
                  <span className="condition-operator">≥</span>
                  <span className="condition-value">18</span>
                </div>
                <div className="logical-operator">AND</div>
                <div className="condition-block">
                  <span className="condition-field">order.total</span>
                  <span className="condition-operator">></span>
                  <span className="condition-value">100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Define Actions</h3>
              <p>Specify what should happen when conditions are met.</p>
              <div className="action-example">
                <div className="action-block">
                  <span className="action-type">Set</span>
                  <span className="action-field">discount</span>
                  <span className="action-value">order.total * 0.1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Condition Builder</h2>
        
        <div className="builder-section">
          <h3>Simple Conditions</h3>
          <p>Create basic comparisons between fields and values:</p>
          
          <div className="condition-types-grid">
            <div className="condition-type-card">
              <h4>Comparison</h4>
              <div className="code-block">
                <pre><code>{`field: "user.age"
operator: "greaterThan"
value: 21`}</code></pre>
              </div>
            </div>
            
            <div className="condition-type-card">
              <h4>Equality</h4>
              <div className="code-block">
                <pre><code>{`field: "user.status"
operator: "equals"
value: "premium"`}</code></pre>
              </div>
            </div>
            
            <div className="condition-type-card">
              <h4>Contains</h4>
              <div className="code-block">
                <pre><code>{`field: "order.items"
operator: "contains"
value: "electronics"`}</code></pre>
              </div>
            </div>
            
            <div className="condition-type-card">
              <h4>Range</h4>
              <div className="code-block">
                <pre><code>{`field: "order.total"
operator: "between"
min: 50
max: 200`}</code></pre>
              </div>
            </div>
          </div>
        </div>

        <div className="builder-section">
          <h3>Complex Conditions</h3>
          <p>Build sophisticated logic using compound conditions:</p>
          
          <div className="complex-condition-example">
            <div className="condition-group">
              <div className="group-header">IF (</div>
              <div className="condition-content">
                <div className="condition-row">
                  <span className="field">user.tier</span>
                  <span className="op">equals</span>
                  <span className="value">"VIP"</span>
                </div>
                <div className="logical-op">OR</div>
                <div className="condition-row">
                  <span className="field">user.loyaltyPoints</span>
                  <span className="op">></span>
                  <span className="value">1000</span>
                </div>
              </div>
              <div className="group-footer">)</div>
            </div>
            
            <div className="logical-op main">AND</div>
            
            <div className="condition-group">
              <div className="group-header">IF (</div>
              <div className="condition-content">
                <div className="condition-row">
                  <span className="field">order.total</span>
                  <span className="op">>=</span>
                  <span className="value">100</span>
                </div>
                <div className="logical-op">AND</div>
                <div className="condition-row">
                  <span className="field">order.category</span>
                  <span className="op">in</span>
                  <span className="value">["electronics", "books"]</span>
                </div>
              </div>
              <div className="group-footer">)</div>
            </div>
          </div>
        </div>

        <div className="builder-section">
          <h3>Available Operators</h3>
          <div className="operators-table">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Operators</th>
                  <th>Data Types</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Comparison</td>
                  <td><code>equals</code>, <code>notEquals</code>, <code>greaterThan</code>, <code>lessThan</code>, <code>greaterThanOrEqual</code>, <code>lessThanOrEqual</code></td>
                  <td>Number, String, Date</td>
                </tr>
                <tr>
                  <td>String</td>
                  <td><code>contains</code>, <code>startsWith</code>, <code>endsWith</code>, <code>matches</code></td>
                  <td>String</td>
                </tr>
                <tr>
                  <td>Array</td>
                  <td><code>includes</code>, <code>excludes</code>, <code>hasLength</code>, <code>isEmpty</code></td>
                  <td>Array</td>
                </tr>
                <tr>
                  <td>Range</td>
                  <td><code>between</code>, <code>in</code>, <code>notIn</code></td>
                  <td>Number, String, Date</td>
                </tr>
                <tr>
                  <td>Date</td>
                  <td><code>isBefore</code>, <code>isAfter</code>, <code>isToday</code>, <code>isWithinLast</code></td>
                  <td>Date</td>
                </tr>
                <tr>
                  <td>Existence</td>
                  <td><code>exists</code>, <code>notExists</code>, <code>isNull</code>, <code>isNotNull</code></td>
                  <td>Any</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Action Designer</h2>
        
        <div className="action-types-section">
          <h3>Set Actions</h3>
          <p>Assign values to fields in the result object:</p>
          <div className="code-block">
            <pre><code>{`{
  "type": "set",
  "field": "user.status",
  "value": "premium"
}

// Dynamic values using expressions
{
  "type": "set", 
  "field": "welcome.message",
  "value": "Hello " + user.firstName + "!"
}`}</code></pre>
          </div>
        </div>

        <div className="action-types-section">
          <h3>Calculate Actions</h3>
          <p>Perform mathematical calculations:</p>
          <div className="code-block">
            <pre><code>{`{
  "type": "calculate",
  "field": "discount.amount",
  "formula": "order.total * 0.15"
}

// Complex calculations
{
  "type": "calculate",
  "field": "shipping.cost",
  "formula": "Math.max(5, order.weight * 0.5 + (order.distance * 0.1))"
}`}</code></pre>
          </div>
        </div>

        <div className="action-types-section">
          <h3>Transform Actions</h3>
          <p>Apply transformations to data:</p>
          <div className="code-block">
            <pre><code>{`{
  "type": "transform",
  "field": "user.email",
  "function": "toLowerCase",
  "target": "user.normalizedEmail"
}

// Built-in transform functions:
// - toLowerCase, toUpperCase
// - trim, capitalize
// - formatDate, formatCurrency
// - round, floor, ceil`}</code></pre>
          </div>
        </div>

        <div className="action-types-section">
          <h3>Conditional Actions</h3>
          <p>Execute actions based on additional conditions:</p>
          <div className="code-block">
            <pre><code>{`{
  "type": "conditional",
  "condition": {
    "field": "order.total",
    "operator": "greaterThan", 
    "value": 500
  },
  "then": [
    {
      "type": "set",
      "field": "shipping.free",
      "value": true
    }
  ],
  "else": [
    {
      "type": "calculate",
      "field": "shipping.cost",
      "formula": "order.weight * 2.5"
    }
  ]
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Advanced Features</h2>
        
        <div className="advanced-feature">
          <h3>Rule Templates</h3>
          <p>Create reusable rule templates for common patterns:</p>
          <div className="code-block">
            <pre><code>{`// Discount template
{
  "template": "discount-rule",
  "parameters": {
    "userTier": "{{tier}}",
    "minimumOrder": "{{minOrder}}",
    "discountPercent": "{{discount}}"
  },
  "conditions": [
    {
      "field": "user.tier",
      "operator": "equals",
      "value": "{{tier}}"
    },
    {
      "field": "order.total",
      "operator": "greaterThan",
      "value": "{{minOrder}}"
    }
  ],
  "actions": [
    {
      "type": "calculate",
      "field": "discount",
      "formula": "order.total * {{discount}}"
    }
  ]
}`}</code></pre>
          </div>
        </div>

        <div className="advanced-feature">
          <h3>Rule Chaining</h3>
          <p>Create rules that depend on results from other rules:</p>
          <div className="code-block">
            <pre><code>{`// Rule 1: Calculate base discount
{
  "id": "base-discount",
  "priority": 100,
  "conditions": [...],
  "actions": [
    {
      "type": "set",
      "field": "discount.base",
      "value": "order.total * 0.1"
    }
  ]
}

// Rule 2: Apply loyalty bonus (depends on Rule 1)
{
  "id": "loyalty-bonus", 
  "priority": 90,
  "dependencies": ["base-discount"],
  "conditions": [
    {
      "field": "discount.base",
      "operator": "exists"
    },
    {
      "field": "user.loyaltyTier",
      "operator": "equals",
      "value": "gold"
    }
  ],
  "actions": [
    {
      "type": "calculate",
      "field": "discount.total",
      "formula": "discount.base * 1.5"
    }
  ]
}`}</code></pre>
          </div>
        </div>

        <div className="advanced-feature">
          <h3>Custom Functions</h3>
          <p>Register and use custom functions in conditions and actions:</p>
          <div className="code-block">
            <pre><code>{`// Register custom function
engine.registerFunction('isValidCreditCard', (cardNumber) => {
  // Luhn algorithm implementation
  return luhnCheck(cardNumber);
});

// Use in conditions
{
  "function": "isValidCreditCard",
  "field": "payment.cardNumber",
  "operator": "equals",
  "value": true
}

// Use in actions  
{
  "type": "invoke",
  "function": "sendEmail",
  "parameters": {
    "to": "user.email",
    "template": "welcome",
    "data": {
      "name": "user.firstName"
    }
  }
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Best Practices</h2>
        
        <div className="best-practices-grid">
          <div className="practice-card">
            <h3>🎯 Clear Naming</h3>
            <p>Use descriptive names for rules, fields, and variables.</p>
            <div className="practice-example">
              <div className="good">✅ "VIP Customer Free Shipping"</div>
              <div className="bad">❌ "Rule 1"</div>
            </div>
          </div>

          <div className="practice-card">
            <h3>📝 Document Logic</h3>
            <p>Add detailed descriptions explaining the business reasoning.</p>
            <div className="practice-example">
              <div className="good">✅ "Apply 15% discount for premium customers with orders over $100 to increase retention"</div>
              <div className="bad">❌ "Discount rule"</div>
            </div>
          </div>

          <div className="practice-card">
            <h3>🔍 Optimize Conditions</h3>
            <p>Order conditions from most to least selective for better performance.</p>
            <div className="practice-example">
              <div className="good">✅ Check rare conditions first</div>
              <div className="bad">❌ Check common conditions first</div>
            </div>
          </div>

          <div className="practice-card">
            <h3>🧪 Test Thoroughly</h3>
            <p>Test rules with various data scenarios including edge cases.</p>
            <div className="practice-example">
              <div className="good">✅ Test with boundary values, nulls, empty arrays</div>
              <div className="bad">❌ Test only happy path</div>
            </div>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Keyboard Shortcuts</h2>
        <div className="shortcuts-table">
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Windows/Linux</th>
                <th>Mac</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>New Rule</td>
                <td><kbd>Ctrl</kbd> + <kbd>N</kbd></td>
                <td><kbd>⌘</kbd> + <kbd>N</kbd></td>
              </tr>
              <tr>
                <td>Save Rule</td>
                <td><kbd>Ctrl</kbd> + <kbd>S</kbd></td>
                <td><kbd>⌘</kbd> + <kbd>S</kbd></td>
              </tr>
              <tr>
                <td>Test Rule</td>
                <td><kbd>Ctrl</kbd> + <kbd>T</kbd></td>
                <td><kbd>⌘</kbd> + <kbd>T</kbd></td>
              </tr>
              <tr>
                <td>Add Condition</td>
                <td><kbd>Ctrl</kbd> + <kbd>K</kbd></td>
                <td><kbd>⌘</kbd> + <kbd>K</kbd></td>
              </tr>
              <tr>
                <td>Add Action</td>
                <td><kbd>Ctrl</kbd> + <kbd>J</kbd></td>
                <td><kbd>⌘</kbd> + <kbd>J</kbd></td>
              </tr>
              <tr>
                <td>Duplicate Rule</td>
                <td><kbd>Ctrl</kbd> + <kbd>D</kbd></td>
                <td><kbd>⌘</kbd> + <kbd>D</kbd></td>
              </tr>
              <tr>
                <td>Delete Selected</td>
                <td><kbd>Delete</kbd></td>
                <td><kbd>⌫</kbd></td>
              </tr>
              <tr>
                <td>Undo</td>
                <td><kbd>Ctrl</kbd> + <kbd>Z</kbd></td>
                <td><kbd>⌘</kbd> + <kbd>Z</kbd></td>
              </tr>
              <tr>
                <td>Redo</td>
                <td><kbd>Ctrl</kbd> + <kbd>Y</kbd></td>
                <td><kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>Z</kbd></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="docs-navigation">
        <div className="nav-item prev">
          <a href="/docs/rule-engine-basics">
            <span className="nav-label">Previous</span>
            <span className="nav-title">← Rule Engine Basics</span>
          </a>
        </div>
        <div className="nav-item next">
          <a href="/docs/rule-testing">
            <span className="nav-label">Next</span>
            <span className="nav-title">Rule Testing →</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export { RuleBuilderPage };