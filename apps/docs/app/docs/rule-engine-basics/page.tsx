import React from 'react';
import '../docs.css';

export const metadata = {
  title: 'Rule Engine Basics - KRule Documentation',
  description: 'Learn the fundamental concepts of rule engines and how KRule implements them',
};

export default function RuleEngineBasicsPage() {
  return (
    <div className="docs-content">
      <div className="docs-header">
        <h1>Rule Engine Basics</h1>
        <p className="lead">Understand the core concepts and architecture that power KRule's rule engine.</p>
      </div>

      <div className="docs-section">
        <h2>What is a Rule Engine?</h2>
        <p>A rule engine is a software system that executes business rules in a runtime production environment. It separates business logic from application code, making it easier to modify business rules without changing the underlying application.</p>
        
        <div className="concept-box">
          <h3>Key Benefits</h3>
          <ul>
            <li><strong>Separation of Concerns:</strong> Business logic is separate from application code</li>
            <li><strong>Flexibility:</strong> Rules can be modified without code changes</li>
            <li><strong>Maintainability:</strong> Non-technical users can update business rules</li>
            <li><strong>Consistency:</strong> Same rules applied across different parts of the system</li>
            <li><strong>Performance:</strong> Optimized execution of complex rule sets</li>
          </ul>
        </div>
      </div>

      <div className="docs-section">
        <h2>Core Components</h2>
        
        <div className="component-detail">
          <h3>1. Facts</h3>
          <p>Facts are the input data that rules operate on. They represent the current state of the system or environment.</p>
          
          <div className="code-block">
            <pre><code>{`// Example facts
const facts = {
  user: {
    id: "12345",
    name: "John Doe",
    age: 28,
    tier: "premium",
    registrationDate: "2023-01-15"
  },
  order: {
    id: "ORD-001",
    total: 150.00,
    items: 3,
    category: "electronics"
  },
  context: {
    timestamp: "2024-01-15T10:30:00Z",
    channel: "web",
    location: "US"
  }
};`}</code></pre>
          </div>
        </div>

        <div className="component-detail">
          <h3>2. Rules</h3>
          <p>Rules define the logic that determines what actions to take based on the facts. Each rule consists of conditions and actions.</p>
          
          <div className="code-block">
            <pre><code>{`// Example rule structure
const rule = {
  id: "premium-discount",
  name: "Premium User Discount",
  description: "Apply 15% discount for premium users on orders over $100",
  
  // Conditions (IF part)
  conditions: {
    operator: "AND",
    conditions: [
      {
        field: "user.tier",
        operator: "equals",
        value: "premium"
      },
      {
        field: "order.total",
        operator: "greaterThan",
        value: 100
      }
    ]
  },
  
  // Actions (THEN part)
  actions: [
    {
      type: "calculate",
      field: "discount",
      formula: "order.total * 0.15"
    },
    {
      type: "set",
      field: "discountApplied",
      value: true
    }
  ]
};`}</code></pre>
          </div>
        </div>

        <div className="component-detail">
          <h3>3. Working Memory</h3>
          <p>Working memory stores facts and intermediate results during rule execution. It's where the rule engine maintains the current state.</p>
          
          <div className="code-block">
            <pre><code>{`// Working memory contains:
// - Original facts
// - Derived facts from rule actions
// - Intermediate calculations
// - Rule execution metadata

const workingMemory = {
  // Original facts
  user: { ... },
  order: { ... },
  
  // Derived facts
  discount: 22.50,
  discountApplied: true,
  finalTotal: 127.50,
  
  // Metadata
  _executedRules: ["premium-discount"],
  _executionTime: 45,
  _lastUpdated: "2024-01-15T10:30:00.123Z"
};`}</code></pre>
          </div>
        </div>

        <div className="component-detail">
          <h3>4. Inference Engine</h3>
          <p>The inference engine is the core component that evaluates conditions and executes actions. It determines which rules to fire and in what order.</p>
          
          <div className="inference-flow">
            <div className="flow-step">
              <h4>Match</h4>
              <p>Find rules whose conditions match the current facts</p>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <h4>Conflict Resolution</h4>
              <p>Determine which rule to execute when multiple rules match</p>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <h4>Execute</h4>
              <p>Run the selected rule's actions and update working memory</p>
            </div>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Rule Execution Strategies</h2>
        
        <div className="strategy-section">
          <h3>Forward Chaining</h3>
          <p>Starts with facts and works forward to conclusions. This is a data-driven approach where rules are triggered by the presence of matching facts.</p>
          
          <div className="code-block">
            <pre><code>{`// Forward chaining example
Facts: { temperature: 85, humidity: 70 }

Rule 1: IF temperature > 80 THEN hot = true
Rule 2: IF hot = true AND humidity > 60 THEN uncomfortable = true
Rule 3: IF uncomfortable = true THEN turnOnAC = true

Execution:
1. Rule 1 fires → hot = true
2. Rule 2 fires → uncomfortable = true  
3. Rule 3 fires → turnOnAC = true`}</code></pre>
          </div>
        </div>

        <div className="strategy-section">
          <h3>Backward Chaining</h3>
          <p>Starts with a goal and works backward to find supporting facts. This is a goal-driven approach useful for diagnostic and planning systems.</p>
          
          <div className="code-block">
            <pre><code>{`// Backward chaining example
Goal: Determine if customer is eligible for loan

Rule: IF creditScore > 700 AND income > 50000 THEN eligible = true

Backward chaining:
1. Need: creditScore > 700
2. Query: What is creditScore? → 750 ✓
3. Need: income > 50000  
4. Query: What is income? → 75000 ✓
5. Conclusion: eligible = true`}</code></pre>
          </div>
        </div>

        <div className="strategy-section">
          <h3>KRule's Hybrid Approach</h3>
          <p>KRule uses a hybrid approach that combines the best of both strategies, optimizing for performance and flexibility.</p>
          
          <ul>
            <li><strong>Forward chaining</strong> for reactive rules that respond to data changes</li>
            <li><strong>Backward chaining</strong> for query-based rules that seek specific outcomes</li>
            <li><strong>Priority-based execution</strong> for critical rules that must run first</li>
            <li><strong>Parallel execution</strong> for independent rules that can run concurrently</li>
          </ul>
        </div>
      </div>

      <div className="docs-section">
        <h2>Condition Types</h2>
        
        <div className="condition-types">
          <div className="condition-type">
            <h3>Simple Conditions</h3>
            <p>Basic comparisons between a field and a value.</p>
            <div className="code-block">
              <pre><code>{`{
  "field": "user.age",
  "operator": "greaterThan",
  "value": 18
}`}</code></pre>
            </div>
          </div>

          <div className="condition-type">
            <h3>Compound Conditions</h3>
            <p>Combinations of multiple conditions using logical operators.</p>
            <div className="code-block">
              <pre><code>{`{
  "operator": "AND",
  "conditions": [
    {
      "field": "user.tier",
      "operator": "equals",
      "value": "premium"
    },
    {
      "operator": "OR",
      "conditions": [
        { "field": "order.total", "operator": ">", "value": 100 },
        { "field": "user.loyaltyPoints", "operator": ">", "value": 1000 }
      ]
    }
  ]
}`}</code></pre>
            </div>
          </div>

          <div className="condition-type">
            <h3>Function-Based Conditions</h3>
            <p>Conditions that use custom functions for complex logic.</p>
            <div className="code-block">
              <pre><code>{`{
  "function": "isValidEmailDomain",
  "field": "user.email",
  "parameters": {
    "allowedDomains": ["company.com", "partner.com"]
  }
}`}</code></pre>
            </div>
          </div>

          <div className="condition-type">
            <h3>Temporal Conditions</h3>
            <p>Time-based conditions for scheduling and temporal logic.</p>
            <div className="code-block">
              <pre><code>{`{
  "field": "order.createdAt",
  "operator": "isWithinLast",
  "value": "24h"
},
{
  "field": "user.lastLogin",
  "operator": "isBefore",
  "value": "2024-01-01"
}`}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Action Types</h2>
        
        <div className="action-types">
          <div className="action-type">
            <h3>Set Actions</h3>
            <p>Assign values to fields in the working memory.</p>
            <div className="code-block">
              <pre><code>{`{
  "type": "set",
  "field": "user.status",
  "value": "premium"
}`}</code></pre>
            </div>
          </div>

          <div className="action-type">
            <h3>Calculate Actions</h3>
            <p>Perform mathematical calculations and store results.</p>
            <div className="code-block">
              <pre><code>{`{
  "type": "calculate",
  "field": "shipping.cost",
  "formula": "(order.weight * 0.5) + (order.distance * 0.1)"
}`}</code></pre>
            </div>
          </div>

          <div className="action-type">
            <h3>Invoke Actions</h3>
            <p>Call external functions or services.</p>
            <div className="code-block">
              <pre><code>{`{
  "type": "invoke",
  "function": "sendNotification",
  "parameters": {
    "recipient": "user.email",
    "template": "welcome",
    "data": {
      "userName": "user.name"
    }
  }
}`}</code></pre>
            </div>
          </div>

          <div className="action-type">
            <h3>Transform Actions</h3>
            <p>Transform data using built-in or custom functions.</p>
            <div className="code-block">
              <pre><code>{`{
  "type": "transform",
  "field": "user.name",
  "function": "capitalize",
  "target": "user.displayName"
}`}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Conflict Resolution</h2>
        <p>When multiple rules match the same facts, the engine must decide which rule to execute first. KRule supports several conflict resolution strategies:</p>
        
        <div className="conflict-strategies">
          <div className="strategy">
            <h3>Priority-Based</h3>
            <p>Rules with higher priority values are executed first.</p>
            <div className="code-block">
              <pre><code>{`{
  "id": "critical-rule",
  "priority": 100,
  "conditions": [...],
  "actions": [...]
}`}</code></pre>
            </div>
          </div>

          <div className="strategy">
            <h3>Specificity-Based</h3>
            <p>Rules with more specific conditions (more conditions) are executed first.</p>
          </div>

          <div className="strategy">
            <h3>Recency-Based</h3>
            <p>Rules that match more recently added facts are executed first.</p>
          </div>

          <div className="strategy">
            <h3>Custom Ordering</h3>
            <p>Define custom ordering logic based on your business requirements.</p>
            <div className="code-block">
              <pre><code>{`const engine = new RuleEngine({
  conflictResolution: {
    strategy: 'custom',
    compareFn: (rule1, rule2) => {
      // Custom comparison logic
      if (rule1.category !== rule2.category) {
        return categoryPriority[rule1.category] - categoryPriority[rule2.category];
      }
      return rule2.priority - rule1.priority;
    }
  }
});`}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Performance Optimization</h2>
        
        <div className="optimization-section">
          <h3>Rule Indexing</h3>
          <p>KRule automatically indexes rules based on their conditions for faster matching.</p>
          
          <div className="code-block">
            <pre><code>{`// Engine automatically creates indexes like:
// fieldIndex: { "user.tier": [rule1, rule3, rule7] }
// operatorIndex: { "greaterThan": [rule2, rule4, rule9] }
// valueIndex: { "premium": [rule1, rule3] }`}</code></pre>
          </div>
        </div>

        <div className="optimization-section">
          <h3>Condition Ordering</h3>
          <p>Order conditions from most selective to least selective for optimal performance.</p>
          
          <div className="code-block">
            <pre><code>{`// Good: Most selective condition first
{
  "conditions": [
    { "field": "user.vipStatus", "operator": "equals", "value": "diamond" }, // 0.1% match
    { "field": "order.total", "operator": ">", "value": 100 },              // 30% match
    { "field": "user.isActive", "operator": "equals", "value": true }       // 80% match
  ]
}`}</code></pre>
          </div>
        </div>

        <div className="optimization-section">
          <h3>Caching</h3>
          <p>Enable caching for frequently accessed rules and facts.</p>
          
          <div className="code-block">
            <pre><code>{`const engine = new RuleEngine({
  cache: {
    enabled: true,
    size: 1000,
    ttl: 300000, // 5 minutes
    strategy: 'lru'
  }
});`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Error Handling</h2>
        
        <div className="error-handling-section">
          <h3>Graceful Degradation</h3>
          <p>Handle errors in individual rules without stopping the entire execution.</p>
          
          <div className="code-block">
            <pre><code>{`const engine = new RuleEngine({
  errorHandling: {
    strategy: 'continue',      // continue, stop, collect
    logErrors: true,
    maxErrors: 10,
    onError: (error, rule, facts) => {
      console.error('Rule execution failed:', {
        ruleId: rule.id,
        error: error.message,
        facts: facts
      });
    }
  }
});`}</code></pre>
          </div>
        </div>

        <div className="error-handling-section">
          <h3>Validation</h3>
          <p>Validate rules before execution to catch errors early.</p>
          
          <div className="code-block">
            <pre><code>{`// Automatic validation checks:
// - Required fields are present
// - Operators are valid for field types
// - Function names exist
// - Circular dependencies
// - Syntax errors in formulas

const validationResult = engine.validateRule(rule);
if (!validationResult.isValid) {
  console.error('Rule validation failed:', validationResult.errors);
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-navigation">
        <div className="nav-item prev">
          <a href="/docs/what-is-krule">
            <span className="nav-label">Previous</span>
            <span className="nav-title">← What is KRule?</span>
          </a>
        </div>
        <div className="nav-item next">
          <a href="/docs/rule-builder">
            <span className="nav-label">Next</span>
            <span className="nav-title">Rule Builder Interface →</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export { RuleEngineBasicsPage };