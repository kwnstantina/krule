import React from 'react';
import '../docs.css';

export const metadata = {
  title: 'Configuration - KRule Documentation',
  description: 'Complete guide to configuring KRule for your specific needs',
};

export default function ConfigurationPage() {
  return (
    <div className="docs-content">
      <div className="docs-header">
        <h1>Configuration</h1>
        <p className="lead">Customize KRule to fit your project's requirements with comprehensive configuration options.</p>
      </div>

      <div className="docs-section">
        <h2>Engine Configuration</h2>
        <p>Configure the KRule engine with various options to control its behavior:</p>
        
        <div className="code-block">
          <pre><code>{`import { RuleEngine } from 'krule-engine';

const engine = new RuleEngine({
  // Execution settings
  maxExecutionTime: 5000,        // 5 seconds timeout
  maxRulesPerExecution: 100,     // Limit concurrent rules
  enableCache: true,             // Cache rule results
  cacheSize: 1000,              // Maximum cached results
  
  // Logging and debugging
  logLevel: 'info',             // debug, info, warn, error
  enableTracing: true,          // Track rule execution
  
  // Performance settings
  enableParallelExecution: true, // Execute compatible rules in parallel
  maxConcurrency: 4,            // Maximum parallel rule executions
  
  // Validation settings
  strictMode: true,             // Strict type checking
  validateInputs: true,         // Validate input data
  validateRules: true,          // Validate rule structure
  
  // Custom functions
  customFunctions: {
    // Your custom functions here
  }
});`}</code></pre>
        </div>
      </div>

      <div className="docs-section">
        <h2>Environment Configuration</h2>
        <p>Configure KRule using environment variables or configuration files:</p>
        
        <h3>Environment Variables</h3>
        <div className="code-block">
          <pre><code>{`# .env file
KRULE_LOG_LEVEL=debug
KRULE_ENABLE_CACHE=true
KRULE_CACHE_SIZE=2000
KRULE_MAX_EXECUTION_TIME=10000
KRULE_STRICT_MODE=true
KRULE_ENABLE_TRACING=false
KRULE_MAX_CONCURRENCY=8
KRULE_VALIDATE_INPUTS=true

# Database settings (if using persistence)
KRULE_DB_URL=mongodb://localhost:27017/krule
KRULE_DB_NAME=krule_engine
KRULE_COLLECTION_NAME=rules

# API settings
KRULE_API_KEY=your-api-key-here
KRULE_API_ENDPOINT=https://api.krule.com
KRULE_ENABLE_ANALYTICS=true`}</code></pre>
        </div>

        <h3>Configuration File</h3>
        <div className="code-block">
          <pre><code>{`// krule.config.js
module.exports = {
  engine: {
    maxExecutionTime: 5000,
    maxRulesPerExecution: 100,
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    enableCache: true,
    strictMode: true
  },
  
  ui: {
    theme: 'auto',              // light, dark, auto
    showAdvancedOptions: false,
    enableKeyboardShortcuts: true,
    autoSave: true,
    autoSaveInterval: 30000,    // 30 seconds
    maxUndoSteps: 50
  },
  
  export: {
    defaultFormat: 'json',
    includeMetadata: true,
    prettifyOutput: true,
    includeComments: false
  },
  
  validation: {
    enableRealTimeValidation: true,
    showWarnings: true,
    enableTypeChecking: true,
    customValidators: []
  },
  
  performance: {
    enableLazyLoading: true,
    chunkSize: 100,
    enableVirtualization: true,
    debounceTime: 300
  }
};`}</code></pre>
        </div>
      </div>

      <div className="docs-section">
        <h2>Rule Engine Settings</h2>
        
        <h3>Execution Modes</h3>
        <div className="config-table">
          <table>
            <thead>
              <tr>
                <th>Mode</th>
                <th>Description</th>
                <th>Use Case</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>sequential</code></td>
                <td>Execute rules one by one</td>
                <td>Rules have dependencies</td>
              </tr>
              <tr>
                <td><code>parallel</code></td>
                <td>Execute independent rules simultaneously</td>
                <td>High performance requirements</td>
              </tr>
              <tr>
                <td><code>priority</code></td>
                <td>Execute based on rule priority</td>
                <td>Critical rules first</td>
              </tr>
              <tr>
                <td><code>conditional</code></td>
                <td>Execute based on conditions</td>
                <td>Dynamic rule selection</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="code-block">
          <pre><code>{`const engine = new RuleEngine({
  executionMode: 'priority',
  
  // Priority configuration
  priorityLevels: ['critical', 'high', 'medium', 'low'],
  
  // Conditional execution
  conditionalExecution: {
    enabled: true,
    strategy: 'shortCircuit',  // shortCircuit, executeAll
    breakOnFailure: false
  }
});`}</code></pre>
        </div>
      </div>

      <div className="docs-section">
        <h2>UI Configuration</h2>
        <p>Customize the KRule interface to match your workflow:</p>
        
        <h3>Theme Configuration</h3>
        <div className="code-block">
          <pre><code>{`// Custom theme configuration
const uiConfig = {
  theme: {
    mode: 'auto',              // light, dark, auto
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b'
    },
    
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace'
    },
    
    spacing: {
      unit: 8,                 // Base spacing unit in pixels
      containerPadding: 24,
      sectionGap: 32
    }
  },
  
  layout: {
    sidebarWidth: 280,
    headerHeight: 64,
    footerHeight: 48,
    enableSidebarCollapse: true,
    defaultSidebarState: 'expanded'
  }
};`}</code></pre>
        </div>

        <h3>Editor Configuration</h3>
        <div className="code-block">
          <pre><code>{`const editorConfig = {
  // Code editor settings
  editor: {
    theme: 'vs-dark',
    fontSize: 14,
    fontFamily: 'JetBrains Mono',
    lineNumbers: true,
    minimap: false,
    wordWrap: 'on',
    tabSize: 2,
    insertSpaces: true,
    enableSnippets: true,
    enableSuggestions: true
  },
  
  // Visual rule builder
  visualBuilder: {
    snapToGrid: true,
    gridSize: 20,
    showGrid: true,
    enableZoom: true,
    minZoom: 0.5,
    maxZoom: 2.0,
    enablePan: true,
    enableMinimap: true
  },
  
  // Form builder
  formBuilder: {
    enableDragDrop: true,
    showFieldTypes: true,
    enableGrouping: true,
    maxNestingLevel: 5,
    enableValidation: true
  }
};`}</code></pre>
        </div>
      </div>

      <div className="docs-section">
        <h2>Database Integration</h2>
        <p>Configure database persistence for rules and execution history:</p>
        
        <h3>MongoDB Configuration</h3>
        <div className="code-block">
          <pre><code>{`const dbConfig = {
  mongodb: {
    url: process.env.MONGODB_URL,
    database: 'krule_engine',
    collections: {
      rules: 'rules',
      executions: 'rule_executions',
      users: 'users',
      projects: 'projects'
    },
    
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  }
};`}</code></pre>
        </div>

        <h3>PostgreSQL Configuration</h3>
        <div className="code-block">
          <pre><code>{`const dbConfig = {
  postgresql: {
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    database: process.env.PG_DATABASE || 'krule',
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    
    pool: {
      min: 2,
      max: 10,
      idle: 10000
    },
    
    tables: {
      rules: 'rules',
      executions: 'rule_executions',
      users: 'users',
      projects: 'projects'
    }
  }
};`}</code></pre>
        </div>
      </div>

      <div className="docs-section">
        <h2>Security Configuration</h2>
        <p>Configure security settings to protect your rule engine:</p>
        
        <div className="code-block">
          <pre><code>{`const securityConfig = {
  authentication: {
    enabled: true,
    provider: 'jwt',        // jwt, oauth, basic
    secretKey: process.env.JWT_SECRET,
    expiresIn: '24h',
    refreshTokenExpiry: '7d'
  },
  
  authorization: {
    enabled: true,
    roles: ['admin', 'editor', 'viewer'],
    permissions: {
      'rule:create': ['admin', 'editor'],
      'rule:edit': ['admin', 'editor'],
      'rule:delete': ['admin'],
      'rule:execute': ['admin', 'editor', 'viewer'],
      'project:manage': ['admin']
    }
  },
  
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 100,          // Per window
    message: 'Too many requests'
  },
  
  validation: {
    sanitizeInputs: true,
    maxPayloadSize: '10mb',
    allowedOrigins: ['http://localhost:3000'],
    enableCors: true
  }
};`}</code></pre>
        </div>
      </div>

      <div className="docs-section">
        <h2>Logging Configuration</h2>
        <p>Configure comprehensive logging for monitoring and debugging:</p>
        
        <div className="code-block">
          <pre><code>{`const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  
  transports: [
    {
      type: 'console',
      level: 'debug',
      format: 'pretty'
    },
    {
      type: 'file',
      filename: 'logs/krule.log',
      level: 'info',
      maxSize: '10m',
      maxFiles: 5,
      format: 'json'
    },
    {
      type: 'file',
      filename: 'logs/errors.log',
      level: 'error',
      format: 'json'
    }
  ],
  
  // What to log
  logExecution: true,          // Rule execution events
  logPerformance: true,        // Performance metrics
  logErrors: true,             // Error details
  logUserActions: true,        // User interactions
  logApiCalls: true,           // API requests/responses
  
  // Sensitive data handling
  sanitizePasswords: true,
  redactFields: ['password', 'token', 'secret'],
  
  // Performance logging
  slowQueryThreshold: 1000,    // Log queries > 1 second
  enableProfiler: false        // Detailed performance profiling
};`}</code></pre>
        </div>
      </div>

      <div className="docs-section">
        <h2>Advanced Configuration</h2>
        
        <h3>Custom Operators</h3>
        <div className="code-block">
          <pre><code>{`const customOperators = {
  // String operations
  'startsWith': (field, value) => field.startsWith(value),
  'endsWith': (field, value) => field.endsWith(value),
  'matches': (field, pattern) => new RegExp(pattern).test(field),
  
  // Array operations
  'includes': (field, value) => field.includes(value),
  'excludes': (field, value) => !field.includes(value),
  'hasLength': (field, length) => field.length === length,
  
  // Date operations
  'isBefore': (field, date) => new Date(field) < new Date(date),
  'isAfter': (field, date) => new Date(field) > new Date(date),
  'isToday': (field) => {
    const today = new Date();
    const fieldDate = new Date(field);
    return fieldDate.toDateString() === today.toDateString();
  },
  
  // Mathematical operations
  'between': (field, min, max) => field >= min && field <= max,
  'divisibleBy': (field, divisor) => field % divisor === 0
};

const engine = new RuleEngine({
  customOperators
});`}</code></pre>
        </div>

        <h3>Plugin System</h3>
        <div className="code-block">
          <pre><code>{`// Plugin configuration
const plugins = [
  {
    name: 'analytics',
    enabled: true,
    config: {
      provider: 'google-analytics',
      trackingId: 'GA-XXXXX-XX'
    }
  },
  {
    name: 'notifications',
    enabled: true,
    config: {
      slack: {
        webhookUrl: process.env.SLACK_WEBHOOK,
        channel: '#krule-alerts'
      },
      email: {
        provider: 'sendgrid',
        apiKey: process.env.SENDGRID_API_KEY
      }
    }
  },
  {
    name: 'backup',
    enabled: true,
    config: {
      provider: 's3',
      bucket: 'krule-backups',
      interval: '24h',
      retention: '30d'
    }
  }
];

const engine = new RuleEngine({
  plugins
});`}</code></pre>
        </div>
      </div>

      <div className="docs-navigation">
        <div className="nav-item prev">
          <a href="/docs/quickstart">
            <span className="nav-label">Previous</span>
            <span className="nav-title">← Quick Start</span>
          </a>
        </div>
        <div className="nav-item next">
          <a href="/docs/what-is-krule">
            <span className="nav-label">Next</span>
            <span className="nav-title">What is KRule? →</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export { ConfigurationPage };