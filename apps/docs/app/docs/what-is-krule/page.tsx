import React from 'react';

export const metadata = {
  title: 'What is KRule? - KRule Documentation',
  description: 'Learn about KRule, the powerful rule engine that makes business logic management simple and intuitive',
};

export default function WhatIsKRulePage() {
  return (
    <div className="docs-content">
      <div className="docs-header">
        <h1>What is KRule?</h1>
        <p className="lead">KRule is a powerful, intuitive rule engine that enables you to build, test, and manage complex business logic without writing code.</p>
      </div>

      <div className="docs-section">
        <h2>Overview</h2>
        <p>KRule is designed to bridge the gap between business requirements and technical implementation. It provides a visual interface for creating rules while maintaining the flexibility and power needed for complex business scenarios.</p>
        
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Visual Rule Building</h3>
            <p>Create complex rules using an intuitive drag-and-drop interface that business users can understand.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>High Performance</h3>
            <p>Optimized execution engine that can handle thousands of rules with millisecond response times.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔧</div>
            <h3>Developer Friendly</h3>
            <p>Export rules to multiple formats and integrate seamlessly with your existing codebase.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🧪</div>
            <h3>Built-in Testing</h3>
            <p>Test your rules with real data and scenarios before deploying to production.</p>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Core Philosophy</h2>
        <p>KRule is built on three fundamental principles:</p>
        
        <div className="philosophy-section">
          <h3>1. Business Logic Should Be Accessible</h3>
          <p>Rules should be created and modified by the people who understand the business requirements, not just developers. KRule provides a visual interface that makes complex logic understandable to everyone.</p>
          
          <div className="code-block">
            <pre><code>{`// Instead of buried business logic in code:
if (user.tier === 'VIP' && order.total > 100 && user.region === 'US') {
  discount = order.total * 0.15;
  shipping = 0;
  priority = 'high';
}

// KRule makes it visual and maintainable:`}</code></pre>
          </div>
        </div>

        <div className="philosophy-section">
          <h3>2. Rules Should Be Testable</h3>
          <p>Every rule should be thoroughly tested with real data before going live. KRule includes comprehensive testing tools that make it easy to validate rule behavior across different scenarios.</p>
        </div>

        <div className="philosophy-section">
          <h3>3. Integration Should Be Seamless</h3>
          <p>Rules created in KRule should work with any technology stack. Our export system generates code in multiple languages and formats, making integration straightforward.</p>
        </div>
      </div>

      <div className="docs-section">
        <h2>Key Components</h2>
        
        <div className="component-section">
          <h3>Rule Builder</h3>
          <p>The visual interface for creating and editing rules. Features include:</p>
          <ul>
            <li>Drag-and-drop condition builder</li>
            <li>Action configurator with multiple output types</li>
            <li>Real-time validation and syntax checking</li>
            <li>Rule visualization and flow diagrams</li>
            <li>Collaborative editing capabilities</li>
          </ul>
        </div>

        <div className="component-section">
          <h3>Rule Engine</h3>
          <p>The execution engine that processes rules efficiently:</p>
          <ul>
            <li>Optimized condition evaluation</li>
            <li>Parallel rule execution</li>
            <li>Caching and performance optimization</li>
            <li>Comprehensive logging and tracing</li>
            <li>Error handling and recovery</li>
          </ul>
        </div>

        <div className="component-section">
          <h3>Rule Tester</h3>
          <p>Built-in testing environment for validating rules:</p>
          <ul>
            <li>Sample data management</li>
            <li>Batch testing capabilities</li>
            <li>Result comparison and analysis</li>
            <li>Performance benchmarking</li>
            <li>Coverage reporting</li>
          </ul>
        </div>

        <div className="component-section">
          <h3>Export System</h3>
          <p>Flexible export options for integration:</p>
          <ul>
            <li>JSON format for universal compatibility</li>
            <li>JavaScript/TypeScript code generation</li>
            <li>Python function export</li>
            <li>SQL query generation</li>
            <li>Custom format support</li>
          </ul>
        </div>
      </div>

      <div className="docs-section">
        <h2>Use Cases</h2>
        
        <div className="use-case">
          <h3>🛒 E-commerce & Retail</h3>
          <div className="use-case-examples">
            <div className="example">
              <h4>Dynamic Pricing</h4>
              <p>Adjust prices based on inventory, demand, customer tier, and market conditions.</p>
            </div>
            <div className="example">
              <h4>Promotion Management</h4>
              <p>Create complex discount rules with multiple conditions and eligibility criteria.</p>
            </div>
            <div className="example">
              <h4>Shipping Logic</h4>
              <p>Calculate shipping costs based on weight, destination, customer status, and order value.</p>
            </div>
          </div>
        </div>

        <div className="use-case">
          <h3>💰 Financial Services</h3>
          <div className="use-case-examples">
            <div className="example">
              <h4>Risk Assessment</h4>
              <p>Evaluate loan applications and investment risks using multiple criteria.</p>
            </div>
            <div className="example">
              <h4>Fraud Detection</h4>
              <p>Identify suspicious transactions based on patterns and behavioral analysis.</p>
            </div>
            <div className="example">
              <h4>Compliance Checking</h4>
              <p>Ensure transactions meet regulatory requirements and internal policies.</p>
            </div>
          </div>
        </div>

        <div className="use-case">
          <h3>🏥 Healthcare</h3>
          <div className="use-case-examples">
            <div className="example">
              <h4>Treatment Protocols</h4>
              <p>Guide treatment decisions based on patient data and medical guidelines.</p>
            </div>
            <div className="example">
              <h4>Insurance Claims</h4>
              <p>Automate claim processing and approval based on policy rules.</p>
            </div>
            <div className="example">
              <h4>Medication Management</h4>
              <p>Check for drug interactions and dosage recommendations.</p>
            </div>
          </div>
        </div>

        <div className="use-case">
          <h3>🏭 Manufacturing & Logistics</h3>
          <div className="use-case-examples">
            <div className="example">
              <h4>Quality Control</h4>
              <p>Automate quality checks and determine pass/fail criteria.</p>
            </div>
            <div className="example">
              <h4>Inventory Management</h4>
              <p>Optimize stock levels and trigger reorder points.</p>
            </div>
            <div className="example">
              <h4>Route Optimization</h4>
              <p>Determine optimal delivery routes based on multiple factors.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Architecture Overview</h2>
        <p>KRule is built with modern web technologies and follows best practices for scalability and maintainability:</p>
        
        <div className="architecture-diagram">
          <div className="arch-layer">
            <h3>Presentation Layer</h3>
            <div className="arch-components">
              <span className="component">React UI</span>
              <span className="component">Visual Builder</span>
              <span className="component">Rule Tester</span>
              <span className="component">Export Tools</span>
            </div>
          </div>
          
          <div className="arch-layer">
            <h3>Application Layer</h3>
            <div className="arch-components">
              <span className="component">Rule Parser</span>
              <span className="component">Validation Engine</span>
              <span className="component">Export Generator</span>
              <span className="component">Test Runner</span>
            </div>
          </div>
          
          <div className="arch-layer">
            <h3>Core Engine</h3>
            <div className="arch-components">
              <span className="component">Rule Executor</span>
              <span className="component">Condition Evaluator</span>
              <span className="component">Action Processor</span>
              <span className="component">Cache Manager</span>
            </div>
          </div>
          
          <div className="arch-layer">
            <h3>Data Layer</h3>
            <div className="arch-components">
              <span className="component">Rule Storage</span>
              <span className="component">Execution Logs</span>
              <span className="component">User Data</span>
              <span className="component">Configuration</span>
            </div>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Comparison with Alternatives</h2>
        
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>KRule</th>
                <th>Traditional Code</th>
                <th>Other Rule Engines</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Visual Interface</td>
                <td>✅ Intuitive drag-and-drop</td>
                <td>❌ Code only</td>
                <td>⚠️ Limited or complex</td>
              </tr>
              <tr>
                <td>Business User Friendly</td>
                <td>✅ Non-technical users</td>
                <td>❌ Developers only</td>
                <td>⚠️ Requires training</td>
              </tr>
              <tr>
                <td>Testing Tools</td>
                <td>✅ Built-in comprehensive</td>
                <td>⚠️ Manual setup</td>
                <td>⚠️ Basic or separate</td>
              </tr>
              <tr>
                <td>Export Options</td>
                <td>✅ Multiple formats</td>
                <td>❌ Manual conversion</td>
                <td>⚠️ Limited formats</td>
              </tr>
              <tr>
                <td>Performance</td>
                <td>✅ Optimized engine</td>
                <td>✅ Direct execution</td>
                <td>⚠️ Varies</td>
              </tr>
              <tr>
                <td>Maintenance</td>
                <td>✅ Visual updates</td>
                <td>⚠️ Code changes</td>
                <td>⚠️ Engine-specific</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="docs-section">
        <h2>Getting Started</h2>
        <p>Ready to experience the power of KRule? Here's how to get started:</p>
        
        <div className="getting-started-steps">
          <div className="step">
            <h3>1. Try the Demo</h3>
            <p>Explore KRule's capabilities with our interactive demo environment.</p>
            <a href="http://localhost:3000" className="demo-link">Launch Demo →</a>
          </div>
          
          <div className="step">
            <h3>2. Install KRule</h3>
            <p>Add KRule to your project using your preferred package manager.</p>
            <a href="/docs/installation" className="doc-link">Installation Guide →</a>
          </div>
          
          <div className="step">
            <h3>3. Build Your First Rule</h3>
            <p>Follow our quick start guide to create your first rule in minutes.</p>
            <a href="/docs/quickstart" className="doc-link">Quick Start →</a>
          </div>
        </div>
      </div>

      <div className="docs-navigation">
        <div className="nav-item prev">
          <a href="/docs/configuration">
            <span className="nav-label">Previous</span>
            <span className="nav-title">← Configuration</span>
          </a>
        </div>
        <div className="nav-item next">
          <a href="/docs/rule-engine-basics">
            <span className="nav-label">Next</span>
            <span className="nav-title">Rule Engine Basics →</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export { WhatIsKRulePage };