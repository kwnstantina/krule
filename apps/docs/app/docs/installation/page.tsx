import React from 'react';
import '../docs.css';

export const metadata = {
  title: 'Installation - KRule Documentation',
  description: 'Learn how to install and set up KRule in your project',
};

export default function InstallationPage() {
  return (
    <div className="docs-content">
      <div className="docs-header">
        <h1>Installation</h1>
        <p className="lead">Get started with KRule by installing it in your project using your preferred package manager.</p>
      </div>

      <div className="docs-section">
        <h2>Prerequisites</h2>
        <p>Before installing KRule, ensure you have the following prerequisites:</p>
        <ul>
          <li><strong>Node.js</strong> version 16.0 or higher</li>
          <li><strong>npm</strong>, <strong>yarn</strong>, or <strong>pnpm</strong> package manager</li>
          <li><strong>React</strong> version 17.0 or higher (for React integration)</li>
        </ul>
      </div>

      <div className="docs-section">
        <h2>Package Installation</h2>
        
        <h3>Using npm</h3>
        <div className="code-block">
          <pre><code>{`npm install krule-engine krule-builder`}</code></pre>
        </div>

        <h3>Using yarn</h3>
        <div className="code-block">
          <pre><code>{`yarn add krule-engine krule-builder`}</code></pre>
        </div>

        <h3>Using pnpm</h3>
        <div className="code-block">
          <pre><code>{`pnpm add krule-engine krule-builder`}</code></pre>
        </div>
      </div>

      <div className="docs-section">
        <h2>Development Setup</h2>
        <p>For local development and contributing to KRule:</p>
        
        <h3>Clone the Repository</h3>
        <div className="code-block">
          <pre><code>{`git clone https://github.com/your-org/krule.git
cd krule`}</code></pre>
        </div>

        <h3>Install Dependencies</h3>
        <div className="code-block">
          <pre><code>{`pnpm install`}</code></pre>
        </div>

        <h3>Start Development Servers</h3>
        <div className="code-block">
          <pre><code>{`# Start the web application
pnpm --filter web dev

# Start the documentation site
pnpm --filter docs dev`}</code></pre>
        </div>
      </div>

      <div className="docs-section">
        <h2>Docker Installation</h2>
        <p>Run KRule using Docker for containerized deployment:</p>
        
        <h3>Using Docker Compose</h3>
        <div className="code-block">
          <pre><code>{`version: '3.8'
services:
  krule-web:
    build: 
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
  
  krule-docs:
    build:
      context: .
      dockerfile: apps/docs/Dockerfile
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production`}</code></pre>
        </div>

        <h3>Run with Docker Compose</h3>
        <div className="code-block">
          <pre><code>{`docker-compose up -d`}</code></pre>
        </div>
      </div>

      <div className="docs-section">
        <h2>Environment Variables</h2>
        <p>Configure KRule with environment variables:</p>
        
        <div className="code-block">
          <pre><code>{`# .env.local
KRULE_API_ENDPOINT=http://localhost:3000/api
KRULE_ENABLE_ANALYTICS=true
KRULE_LOG_LEVEL=info
KRULE_MAX_RULES_PER_PROJECT=1000`}</code></pre>
        </div>

        <div className="env-table">
          <table>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Description</th>
                <th>Default</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>KRULE_API_ENDPOINT</code></td>
                <td>API endpoint for rule execution</td>
                <td><code>/api</code></td>
              </tr>
              <tr>
                <td><code>KRULE_ENABLE_ANALYTICS</code></td>
                <td>Enable usage analytics</td>
                <td><code>false</code></td>
              </tr>
              <tr>
                <td><code>KRULE_LOG_LEVEL</code></td>
                <td>Logging level (debug, info, warn, error)</td>
                <td><code>info</code></td>
              </tr>
              <tr>
                <td><code>KRULE_MAX_RULES_PER_PROJECT</code></td>
                <td>Maximum rules per project</td>
                <td><code>500</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="docs-section">
        <h2>Verification</h2>
        <p>Verify your installation by checking the version and running a simple test:</p>
        
        <div className="code-block">
          <pre><code>{`import { RuleEngine } from 'krule-engine';

const engine = new RuleEngine();
console.log('KRule version:', engine.version);

// Create a simple rule
const rule = {
  id: 'test-rule',
  name: 'Test Rule',
  conditions: [
    {
      field: 'age',
      operator: 'greaterThan',
      value: 18
    }
  ],
  actions: [
    {
      type: 'set',
      field: 'isAdult',
      value: true
    }
  ]
};

// Test the rule
const result = engine.execute(rule, { age: 25 });
console.log('Rule result:', result); // { age: 25, isAdult: true }`}</code></pre>
        </div>
      </div>

      <div className="docs-section">
        <h2>Troubleshooting</h2>
        
        <h3>Common Issues</h3>
        
        <div className="troubleshooting-item">
          <h4>Node.js Version Compatibility</h4>
          <p>If you encounter version compatibility issues:</p>
          <div className="code-block">
            <pre><code>{`# Check your Node.js version
node --version

# Use nvm to install the correct version
nvm install 18
nvm use 18`}</code></pre>
          </div>
        </div>

        <div className="troubleshooting-item">
          <h4>Package Installation Failures</h4>
          <p>If installation fails, try clearing your package manager cache:</p>
          <div className="code-block">
            <pre><code>{`# npm
npm cache clean --force

# yarn
yarn cache clean

# pnpm
pnpm store prune`}</code></pre>
          </div>
        </div>

        <div className="troubleshooting-item">
          <h4>Port Conflicts</h4>
          <p>If default ports are occupied, you can specify different ports:</p>
          <div className="code-block">
            <pre><code>{`# Start on different port
PORT=3002 pnpm --filter web dev`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-navigation">
        <div className="nav-item next">
          <a href="/docs/quickstart">
            <span className="nav-label">Next</span>
            <span className="nav-title">Quick Start →</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export { InstallationPage };