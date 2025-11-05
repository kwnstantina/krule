import React from 'react';

export const metadata = {
  title: 'Quick Start - KRule Documentation',
  description: 'Get up and running with KRule in minutes with this quick start guide',
};

export default function QuickStartPage() {
  return (
    <div className="docs-content">
      <div className="docs-header">
        <h1>Quick Start</h1>
        <p className="lead">Build your first rule in minutes with KRule's intuitive interface and powerful engine.</p>
      </div>

      <div className="docs-section">
        <h2>5-Minute Setup</h2>
        <p>Follow these steps to create your first rule and see KRule in action:</p>
        
        <div className="step-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Launch KRule</h3>
              <p>Start the development server:</p>
              <div className="code-block">
                <pre><code>{`pnpm --filter web dev`}</code></pre>
              </div>
              <p>Open <a href="http://localhost:3000" target="_blank">http://localhost:3000</a> in your browser.</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Create Your First Rule</h3>
              <p>Click "Create New Rule" and set up a simple validation rule:</p>
              <div className="code-block">
                <pre><code>{`{
  "name": "Age Verification",
  "description": "Check if user is adult",
  "conditions": [
    {
      "field": "age",
      "operator": ">=",
      "value": 18
    }
  ],
  "actions": [
    {
      "type": "set",
      "field": "canPurchase",
      "value": true
    }
  ]
}`}</code></pre>
              </div>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Test Your Rule</h3>
              <p>Use the built-in tester with sample data:</p>
              <div className="code-block">
                <pre><code>{`{
  "age": 25,
  "name": "John Doe"
}`}</code></pre>
              </div>
              <p>Expected result: <code>canPurchase: true</code></p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Export Your Rule</h3>
              <p>Export to your preferred format:</p>
              <ul>
                <li><strong>JSON</strong> - Universal format</li>
                <li><strong>JavaScript</strong> - Direct integration</li>
                <li><strong>TypeScript</strong> - Type-safe integration</li>
                <li><strong>Python</strong> - Backend integration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Real-World Example</h2>
        <p>Let's build a practical e-commerce discount rule:</p>
        
        <h3>Scenario</h3>
        <p>Apply a 10% discount for orders over $100 from VIP customers.</p>
        
        <h3>Rule Configuration</h3>
        <div className="code-block">
          <pre><code>{`{
  "name": "VIP Discount Rule",
  "description": "10% discount for VIP customers on orders over $100",
  "conditions": [
    {
      "field": "customer.tier",
      "operator": "equals",
      "value": "VIP"
    },
    {
      "field": "order.total",
      "operator": "greaterThan",
      "value": 100
    }
  ],
  "actions": [
    {
      "type": "calculate",
      "field": "discount",
      "formula": "order.total * 0.1"
    },
    {
      "type": "calculate",
      "field": "finalTotal",
      "formula": "order.total - discount"
    },
    {
      "type": "set",
      "field": "discountApplied",
      "value": true
    }
  ]
}`}</code></pre>
        </div>

        <h3>Test Data</h3>
        <div className="code-block">
          <pre><code>{`{
  "customer": {
    "id": "12345",
    "name": "Alice Johnson",
    "tier": "VIP",
    "email": "alice@example.com"
  },
  "order": {
    "id": "ORD-001",
    "total": 150.00,
    "items": [
      { "name": "Premium Headphones", "price": 150.00 }
    ]
  }
}`}</code></pre>
        </div>

        <h3>Expected Result</h3>
        <div className="code-block">
          <pre><code>{`{
  "customer": { ... },
  "order": { ... },
  "discount": 15.00,
  "finalTotal": 135.00,
  "discountApplied": true
}`}</code></pre>
        </div>
      </div>

      <div className="docs-section">
        <h2>Integration Examples</h2>
        
        <h3>React Integration</h3>
        <div className="code-block">
          <pre><code>{`import { RuleEngine } from 'krule-engine';
import { useState, useEffect } from 'react';

function CheckoutComponent({ order, customer }) {
  const [finalOrder, setFinalOrder] = useState(null);
  const engine = new RuleEngine();

  useEffect(() => {
    const rules = [
      // Your exported rule here
      vipDiscountRule,
      shippingRule,
      taxRule
    ];

    const result = engine.executeRules(rules, { order, customer });
    setFinalOrder(result);
  }, [order, customer]);

  return (
    <div className="checkout">
      <h2>Order Summary</h2>
      <p>Subtotal: ${order.total}</p>
      {finalOrder?.discountApplied && (
        <p>Discount: -${finalOrder.discount}</p>
      )}
      <p><strong>Total: ${finalOrder?.finalTotal || order.total}</strong></p>
    </div>
  );
}`}</code></pre>
        </div>

        <h3>Node.js Backend Integration</h3>
        <div className="code-block">
          <pre><code>{`const { RuleEngine } = require('krule-engine');
const express = require('express');

const app = express();
const engine = new RuleEngine();

// Load your rules
const rules = require('./rules/business-rules.json');

app.post('/api/apply-rules', (req, res) => {
  try {
    const { data } = req.body;
    const result = engine.executeRules(rules, data);
    
    res.json({
      success: true,
      data: result,
      rulesApplied: result._appliedRules || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('Rule engine server running on port 3000');
});`}</code></pre>
        </div>
      </div>

      <div className="docs-section">
        <h2>Best Practices</h2>
        
        <div className="best-practice">
          <h3>🎯 Keep Rules Simple</h3>
          <p>Start with simple conditions and actions. Complex rules can be built by combining simpler ones.</p>
        </div>

        <div className="best-practice">
          <h3>🧪 Test Thoroughly</h3>
          <p>Always test your rules with various data scenarios, including edge cases and invalid data.</p>
        </div>

        <div className="best-practice">
          <h3>📝 Document Your Rules</h3>
          <p>Use descriptive names and descriptions for your rules to make them maintainable.</p>
        </div>

        <div className="best-practice">
          <h3>🔄 Version Control</h3>
          <p>Store your rules in version control and track changes over time.</p>
        </div>

        <div className="best-practice">
          <h3>⚡ Performance Optimization</h3>
          <p>Order conditions by likelihood of being false to short-circuit evaluation.</p>
        </div>
      </div>

      <div className="docs-section">
        <h2>Common Patterns</h2>
        
        <h3>Conditional Logic</h3>
        <div className="code-block">
          <pre><code>{`// IF-THEN-ELSE pattern
{
  "conditions": [
    { "field": "user.age", "operator": ">=", "value": 18 }
  ],
  "actions": [
    { "type": "set", "field": "access", "value": "granted" }
  ],
  "elseActions": [
    { "type": "set", "field": "access", "value": "denied" }
  ]
}`}</code></pre>
        </div>

        <h3>Nested Conditions</h3>
        <div className="code-block">
          <pre><code>{`// Complex AND/OR logic
{
  "conditions": {
    "operator": "AND",
    "conditions": [
      {
        "operator": "OR",
        "conditions": [
          { "field": "user.tier", "operator": "equals", "value": "premium" },
          { "field": "user.tier", "operator": "equals", "value": "vip" }
        ]
      },
      { "field": "order.total", "operator": ">", "value": 50 }
    ]
  }
}`}</code></pre>
        </div>

        <h3>Dynamic Calculations</h3>
        <div className="code-block">
          <pre><code>{`// Calculate based on multiple fields
{
  "actions": [
    {
      "type": "calculate",
      "field": "shipping",
      "formula": "order.weight * 0.5 + (order.total > 100 ? 0 : 5)"
    }
  ]
}`}</code></pre>
        </div>
      </div>

      <div className="docs-navigation">
        <div className="nav-item prev">
          <a href="/docs/installation">
            <span className="nav-label">Previous</span>
            <span className="nav-title">← Installation</span>
          </a>
        </div>
        <div className="nav-item next">
          <a href="/docs/configuration">
            <span className="nav-label">Next</span>
            <span className="nav-title">Configuration →</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export { QuickStartPage };