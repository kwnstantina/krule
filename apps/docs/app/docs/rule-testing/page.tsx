import React from 'react';
import '../docs.css';

export const metadata = {
  title: 'Rule Testing - KRule Documentation',
  description: 'Learn how to thoroughly test your rules with KRule\'s comprehensive testing tools',
};

export default function RuleTestingPage() {
  return (
    <div className="docs-content">
      <div className="docs-header">
        <h1>Rule Testing</h1>
        <p className="lead">Ensure your rules work correctly with KRule's comprehensive testing framework and built-in testing tools.</p>
      </div>

      <div className="docs-section">
        <h2>Testing Overview</h2>
        <p>Testing is crucial for ensuring your rules behave correctly across different scenarios. KRule provides multiple testing approaches to validate your business logic thoroughly.</p>
        
        <div className="testing-benefits">
          <div className="benefit-card">
            <h3>🎯 Accuracy</h3>
            <p>Verify rules produce expected results for given inputs</p>
          </div>
          <div className="benefit-card">
            <h3>🛡️ Reliability</h3>
            <p>Catch edge cases and error conditions before production</p>
          </div>
          <div className="benefit-card">
            <h3>📊 Coverage</h3>
            <p>Ensure all rule paths and conditions are tested</p>
          </div>
          <div className="benefit-card">
            <h3>⚡ Performance</h3>
            <p>Identify performance bottlenecks and optimization opportunities</p>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Built-in Rule Tester</h2>
        <p>The integrated rule tester provides an interactive environment for testing rules with sample data.</p>
        
        <div className="tester-features">
          <h3>Key Features</h3>
          <ul>
            <li><strong>Interactive Testing:</strong> Test rules instantly with custom data</li>
            <li><strong>Sample Data Management:</strong> Save and reuse test datasets</li>
            <li><strong>Result Visualization:</strong> See exactly what your rules produce</li>
            <li><strong>Performance Metrics:</strong> Monitor execution time and resource usage</li>
            <li><strong>Error Debugging:</strong> Detailed error messages and stack traces</li>
          </ul>
        </div>

        <h3>Basic Testing Example</h3>
        <div className="code-block">
          <pre><code>{`// Rule: VIP Discount
{
  "name": "VIP Customer Discount",
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
      "formula": "order.total * 0.15"
    },
    {
      "type": "set",
      "field": "freeShipping",
      "value": true
    }
  ]
}

// Test Data
{
  "customer": {
    "id": "12345",
    "name": "Alice Johnson",
    "tier": "VIP"
  },
  "order": {
    "id": "ORD-001",
    "total": 150.00,
    "items": ["laptop", "mouse"]
  }
}

// Expected Result
{
  "customer": { ... },
  "order": { ... },
  "discount": 22.50,
  "freeShipping": true
}`}</code></pre>
        </div>
      </div>

      <div className="docs-section">
        <h2>Test Case Management</h2>
        
        <div className="test-case-section">
          <h3>Creating Test Cases</h3>
          <p>Organize your tests into structured test cases for better maintainability:</p>
          
          <div className="code-block">
            <pre><code>{`{
  "testSuite": "VIP Discount Rules",
  "testCases": [
    {
      "name": "VIP customer with qualifying order",
      "description": "VIP customer should get 15% discount on orders over $100",
      "input": {
        "customer": { "tier": "VIP" },
        "order": { "total": 150 }
      },
      "expected": {
        "discount": 22.50,
        "freeShipping": true
      }
    },
    {
      "name": "VIP customer with small order",
      "description": "VIP customer should not get discount on orders under $100",
      "input": {
        "customer": { "tier": "VIP" },
        "order": { "total": 50 }
      },
      "expected": {
        "discount": undefined,
        "freeShipping": undefined
      }
    },
    {
      "name": "Regular customer with large order",
      "description": "Non-VIP customers should not get VIP discount",
      "input": {
        "customer": { "tier": "regular" },
        "order": { "total": 200 }
      },
      "expected": {
        "discount": undefined,
        "freeShipping": undefined
      }
    }
  ]
}`}</code></pre>
          </div>
        </div>

        <div className="test-case-section">
          <h3>Edge Case Testing</h3>
          <p>Test boundary conditions and edge cases:</p>
          
          <div className="code-block">
            <pre><code>{`{
  "testSuite": "Edge Cases",
  "testCases": [
    {
      "name": "Exact boundary value",
      "input": {
        "customer": { "tier": "VIP" },
        "order": { "total": 100.00 }  // Exactly at threshold
      },
      "expected": {
        "discount": undefined  // Should not trigger (greaterThan, not >=)
      }
    },
    {
      "name": "Missing customer tier",
      "input": {
        "customer": {},  // Missing tier field
        "order": { "total": 150 }
      },
      "expected": {
        "discount": undefined
      }
    },
    {
      "name": "Null order total",
      "input": {
        "customer": { "tier": "VIP" },
        "order": { "total": null }
      },
      "expected": {
        "discount": undefined,
        "error": "Cannot compare null value"
      }
    },
    {
      "name": "Very large order",
      "input": {
        "customer": { "tier": "VIP" },
        "order": { "total": 999999.99 }
      },
      "expected": {
        "discount": 149999.998,
        "freeShipping": true
      }
    }
  ]
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Automated Testing</h2>
        
        <div className="automation-section">
          <h3>Batch Testing</h3>
          <p>Run multiple test cases automatically and get comprehensive results:</p>
          
          <div className="code-block">
            <pre><code>{`const testRunner = new KRuleTestRunner();

// Load test suite
const testSuite = await testRunner.loadTestSuite('vip-discount-tests.json');

// Run all tests
const results = await testRunner.runTestSuite(testSuite);

// Results summary
{
  "totalTests": 10,
  "passed": 8,
  "failed": 2,
  "skipped": 0,
  "duration": 145, // ms
  "coverage": {
    "rules": 85,      // % of rules tested
    "conditions": 92, // % of conditions covered
    "actions": 78     // % of actions executed
  },
  "failures": [
    {
      "testCase": "Edge case: negative order total",
      "expected": { "error": "Invalid order total" },
      "actual": { "discount": -15 },
      "message": "Rule should reject negative values"
    }
  ]
}`}</code></pre>
          </div>
        </div>

        <div className="automation-section">
          <h3>Continuous Integration</h3>
          <p>Integrate rule testing into your CI/CD pipeline:</p>
          
          <div className="code-block">
            <pre><code>{`// GitHub Actions example
name: Rule Tests
on: [push, pull_request]

jobs:
  test-rules:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run rule tests
        run: npm run test:rules
      
      - name: Generate coverage report
        run: npm run coverage:rules
      
      - name: Upload coverage
        uses: codecov/codecov-action@v1
        with:
          file: ./coverage/rules-coverage.xml`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Performance Testing</h2>
        
        <div className="performance-section">
          <h3>Load Testing</h3>
          <p>Test rule performance under various load conditions:</p>
          
          <div className="code-block">
            <pre><code>{`const performanceTest = {
  "name": "VIP Discount Performance Test",
  "rule": "vip-discount-rule",
  "scenarios": [
    {
      "name": "Light load",
      "iterations": 100,
      "concurrency": 1,
      "dataSize": "small"
    },
    {
      "name": "Medium load", 
      "iterations": 1000,
      "concurrency": 10,
      "dataSize": "medium"
    },
    {
      "name": "Heavy load",
      "iterations": 10000,
      "concurrency": 50,
      "dataSize": "large"
    }
  ],
  "thresholds": {
    "averageResponseTime": 10,  // ms
    "p95ResponseTime": 25,      // ms
    "errorRate": 0.1            // %
  }
};

// Run performance test
const perfResults = await testRunner.runPerformanceTest(performanceTest);

// Results
{
  "scenario": "Heavy load",
  "totalRequests": 10000,
  "successfulRequests": 9998,
  "failedRequests": 2,
  "averageResponseTime": 8.5,
  "p50ResponseTime": 7.2,
  "p95ResponseTime": 18.3,
  "p99ResponseTime": 28.9,
  "throughput": 588.2,  // requests/second
  "errorRate": 0.02
}`}</code></pre>
          </div>
        </div>

        <div className="performance-section">
          <h3>Memory and CPU Profiling</h3>
          <p>Monitor resource usage during rule execution:</p>
          
          <div className="code-block">
            <pre><code>{`const engine = new RuleEngine({
  profiling: {
    enabled: true,
    trackMemory: true,
    trackCPU: true,
    sampleInterval: 100  // ms
  }
});

// Execute rule with profiling
const result = await engine.executeWithProfiling(rule, data);

// Profiling results
{
  "execution": {
    "duration": 12.5,        // ms
    "rulesExecuted": 3,
    "conditionsEvaluated": 8,
    "actionsPerformed": 5
  },
  "memory": {
    "heapUsedBefore": 45.2,  // MB
    "heapUsedAfter": 46.1,   // MB
    "memoryDelta": 0.9,      // MB
    "peakMemory": 47.3       // MB
  },
  "cpu": {
    "userTime": 8.2,         // ms
    "systemTime": 1.1,       // ms
    "cpuUsage": 15.3         // %
  }
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Test Data Generation</h2>
        
        <div className="data-generation-section">
          <h3>Random Test Data</h3>
          <p>Generate diverse test data automatically:</p>
          
          <div className="code-block">
            <pre><code>{`const dataGenerator = new KRuleDataGenerator({
  schemas: {
    customer: {
      id: { type: 'uuid' },
      name: { type: 'fullName' },
      email: { type: 'email' },
      age: { type: 'integer', min: 18, max: 80 },
      tier: { type: 'enum', values: ['basic', 'premium', 'VIP'] },
      registrationDate: { type: 'date', min: '2020-01-01', max: '2024-01-01' }
    },
    order: {
      id: { type: 'string', pattern: 'ORD-[0-9]{6}' },
      total: { type: 'decimal', min: 10, max: 1000, precision: 2 },
      itemCount: { type: 'integer', min: 1, max: 20 },
      category: { type: 'enum', values: ['electronics', 'books', 'clothing'] }
    }
  }
});

// Generate test datasets
const testData = dataGenerator.generate(100); // 100 random records

// Generate edge cases
const edgeCases = dataGenerator.generateEdgeCases({
  includeNulls: true,
  includeBoundaryValues: true,
  includeInvalidTypes: true
});`}</code></pre>
          </div>
        </div>

        <div className="data-generation-section">
          <h3>Data-Driven Testing</h3>
          <p>Use external data sources for comprehensive testing:</p>
          
          <div className="code-block">
            <pre><code>{`// CSV test data
// customer_tier,order_total,expected_discount,expected_free_shipping
// VIP,150,22.50,true
// VIP,50,0,false
// premium,200,0,false
// basic,1000,0,false

const csvTestRunner = new CSVTestRunner();
await csvTestRunner.runTests('vip-discount-tests.csv', rule);

// Database test data
const dbTestRunner = new DatabaseTestRunner({
  connection: 'postgresql://localhost/test_data'
});

await dbTestRunner.runTests(
  "SELECT customer_data, order_data, expected_result FROM rule_test_cases WHERE rule_name = 'vip-discount'",
  rule
);`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Debugging and Troubleshooting</h2>
        
        <div className="debugging-section">
          <h3>Step-by-Step Execution</h3>
          <p>Debug rules by examining each execution step:</p>
          
          <div className="code-block">
            <pre><code>{`const engine = new RuleEngine({
  debug: {
    enabled: true,
    logLevel: 'trace',
    includeStackTrace: true
  }
});

// Execute with debugging
const result = await engine.executeWithDebug(rule, data);

// Debug output
{
  "steps": [
    {
      "step": 1,
      "type": "condition",
      "condition": "customer.tier equals 'VIP'",
      "evaluation": {
        "left": "VIP",
        "operator": "equals",
        "right": "VIP",
        "result": true
      },
      "timestamp": "2024-01-15T10:30:00.123Z"
    },
    {
      "step": 2,
      "type": "condition", 
      "condition": "order.total > 100",
      "evaluation": {
        "left": 150,
        "operator": "greaterThan",
        "right": 100,
        "result": true
      },
      "timestamp": "2024-01-15T10:30:00.125Z"
    },
    {
      "step": 3,
      "type": "action",
      "action": "calculate discount",
      "formula": "order.total * 0.15",
      "calculation": "150 * 0.15 = 22.5",
      "result": 22.5,
      "timestamp": "2024-01-15T10:30:00.127Z"
    }
  ]
}`}</code></pre>
          </div>
        </div>

        <div className="debugging-section">
          <h3>Common Testing Issues</h3>
          
          <div className="issue-card">
            <h4>Type Mismatches</h4>
            <p>Ensure test data types match rule expectations:</p>
            <div className="code-block">
              <pre><code>{`// Wrong: String comparison with number
{ "age": "25" }  // String

// Right: Proper type matching
{ "age": 25 }    // Number`}</code></pre>
            </div>
          </div>

          <div className="issue-card">
            <h4>Floating Point Precision</h4>
            <p>Handle decimal precision in calculations:</p>
            <div className="code-block">
              <pre><code>{`// Use precision-aware assertions
expect(result.discount).toBeCloseTo(22.50, 2);

// Or round values for comparison
expect(Math.round(result.discount * 100) / 100).toBe(22.50);`}</code></pre>
            </div>
          </div>

          <div className="issue-card">
            <h4>Null/Undefined Values</h4>
            <p>Test how rules handle missing data:</p>
            <div className="code-block">
              <pre><code>{`// Test missing fields
const testData = {
  customer: {},  // Missing tier
  order: { total: 100 }
};

// Expect graceful handling
expect(result.error).toBeUndefined();
expect(result.discount).toBeUndefined();`}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Best Testing Practices</h2>
        
        <div className="practices-grid">
          <div className="practice-card">
            <h3>📋 Test Categories</h3>
            <ul>
              <li>Happy path scenarios</li>
              <li>Edge cases and boundaries</li>
              <li>Error conditions</li>
              <li>Performance limits</li>
              <li>Integration scenarios</li>
            </ul>
          </div>

          <div className="practice-card">
            <h3>🎯 Coverage Goals</h3>
            <ul>
              <li>100% condition coverage</li>
              <li>100% action coverage</li>
              <li>All logical branches tested</li>
              <li>Error paths verified</li>
              <li>Performance thresholds met</li>
            </ul>
          </div>

          <div className="practice-card">
            <h3>📊 Test Organization</h3>
            <ul>
              <li>Group by business function</li>
              <li>Use descriptive test names</li>
              <li>Maintain test data separately</li>
              <li>Version control test suites</li>
              <li>Document test intentions</li>
            </ul>
          </div>

          <div className="practice-card">
            <h3>🔄 Continuous Testing</h3>
            <ul>
              <li>Run tests on every change</li>
              <li>Automate regression testing</li>
              <li>Monitor performance trends</li>
              <li>Test in production-like environment</li>
              <li>Regular test maintenance</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="docs-navigation">
        <div className="nav-item prev">
          <a href="/docs/rule-builder">
            <span className="nav-label">Previous</span>
            <span className="nav-title">← Rule Builder Interface</span>
          </a>
        </div>
        <div className="nav-item next">
          <a href="/docs/examples/ecommerce">
            <span className="nav-label">Next</span>
            <span className="nav-title">E-commerce Examples →</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export { RuleTestingPage };