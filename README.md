# KRule - Rule Engine Builder

<div align="center">

**A powerful, flexible rule engine with an interactive UI for building, testing, and exporting business rules**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18-green.svg)](https://nodejs.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.4-blueviolet.svg)](https://turbo.build/repo)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Examples](#-examples) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Use Cases](#-use-cases)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Core Package](#-core-package-usage)
- [Development](#-development)
- [Testing](#-testing)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

KRule is a comprehensive rule engine platform that enables developers to create, test, and deploy complex business rules through an intuitive visual interface. Built as a TypeScript monorepo using Turborepo, it provides both the core rule evaluation engine and a complete UI for managing rules without writing code.

### Why KRule?

- **Visual First**: Build complex rules through an intuitive web interface - no coding required
- **Developer Friendly**: Export rules as JSON, TypeScript, or JavaScript for seamless integration
- **Type Safe**: Comprehensive TypeScript support with Zod schema validation
- **Real-time Testing**: Test rules instantly with sample data to validate logic
- **Extensible**: Register custom operators and actions for specific use cases
- **Production Ready**: Priority-based execution, nested conditions, and robust error handling

---

## ✨ Features

### Rule Building
- 🎨 **Visual Rule Builder**: Drag-and-drop interface for creating complex rules
- 🔗 **Nested Conditions**: Support for unlimited nesting of condition groups
- 🎯 **Multiple Operators**: Comparison (`==`, `!=`, `>`, `<`, `>=`, `<=`), array (`in`, `not`), and logical (`AND`, `OR`, `XOR`, `NAND`, `NOR`)
- 🏷️ **Priority System**: Rules execute in priority order for predictable behavior
- 💾 **Export Formats**: Export to JSON, TypeScript, or JavaScript

### Testing & Validation
- ⚡ **Real-time Testing**: Instant feedback with sample data
- 🧪 **Test Cases**: Organize and save test scenarios
- 📊 **Result Visualization**: Clear display of rule evaluation results
- 🐛 **Debug Mode**: Step-through execution for troubleshooting

### Architecture
- 📦 **Monorepo**: Organized Turborepo structure with shared packages
- 🔒 **Type Safety**: Full TypeScript coverage with Zod validation
- 🪝 **React Hooks**: Easy integration with React applications
- 🎨 **Component Library**: Reusable UI components across apps
- 🚀 **Performance**: Optimized evaluation engine for high-throughput scenarios

---

## 🚀 Use Cases

### E-commerce
- Dynamic pricing strategies
- Promotional discount rules
- Customer segmentation
- Inventory management rules
- Shipping calculation logic

### Content Management
- Content moderation policies
- Automated tagging and categorization
- Content approval workflows
- Publishing rules

### Access Control
- Role-based permissions (RBAC)
- Attribute-based access control (ABAC)
- Dynamic security policies
- Feature flags and toggles

### Business Automation
- Workflow orchestration
- Approval processes
- Notification triggers
- SLA enforcement
- Task routing

### Data Processing
- Input validation rules
- Data quality checks
- ETL transformation logic
- Data enrichment rules

---

## 📦 Project Structure

This Turborepo monorepo contains the following packages and applications:

```
krule/
├── apps/
│   ├── docs/                    # Documentation app (Next.js, port 3001)
│   │   ├── app/
│   │   │   ├── docs/           # Documentation pages
│   │   │   │   ├── what-is-krule/
│   │   │   │   ├── installation/
│   │   │   │   ├── quickstart/
│   │   │   │   ├── rule-engine-basics/
│   │   │   │   ├── rule-builder/
│   │   │   │   ├── rule-testing/
│   │   │   │   ├── configuration/
│   │   │   │   ├── api/
│   │   │   │   ├── advanced/
│   │   │   │   └── examples/
│   │   │   ├── components/     # Doc components (Sidebar, Footer)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── public/             # Static assets
│   │
│   └── web/                    # Rule Builder UI (Next.js, port 3000)
│       ├── app/                # Next.js app directory
│       └── public/             # Static assets
│
├── packages/
│   ├── core/                   # Core rule engine
│   │   ├── src/
│   │   │   ├── types.ts       # Zod schemas and TypeScript types
│   │   │   ├── evaluator.ts   # Rule evaluation logic
│   │   │   └── evaluators.ts  # Public exports
│   │   └── dist/              # Compiled JavaScript
│   │
│   ├── hooks/                  # React hooks for rule integration
│   │   ├── src/
│   │   │   └── useRuleEngine.ts
│   │   └── dist/
│   │
│   ├── ui/                     # Shared React components
│   │   └── src/
│   │
│   ├── eslint-config/         # Shared ESLint configurations
│   └── typescript-config/     # Shared TypeScript configurations
│
├── package.json               # Root package configuration
├── pnpm-workspace.yaml       # pnpm workspace configuration
├── turbo.json                # Turborepo configuration
└── README.md                 # This file
```

### Package Descriptions

#### **`@repo/core`**
The heart of KRule - contains the rule evaluation engine, type definitions, and operator implementations. Exports evaluation functions, type definitions, and operator registration utilities.

#### **`@repo/hooks`**
React hooks for seamless integration of the rule engine into React applications. Provides state management and evaluation utilities.

#### **`@repo/ui`**
Shared React component library used across the web and docs applications. Ensures consistent UI/UX.

#### **`docs` app**
Comprehensive documentation site with guides, API references, and examples. Built with Next.js 15 and includes:
- Getting started guides
- API documentation
- Real-world examples
- Best practices
- Testing strategies

#### **`web` app**
Interactive rule builder application where users can visually create, test, and export rules without writing code.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **Package Manager**: pnpm (recommended), npm, or yarn
- **Git**: For cloning the repository

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/krule.git
   cd krule
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

   *Or with npm:*
   ```bash
   npm install
   ```

3. **Build all packages:**
   ```bash
   pnpm build
   ```

### Quick Start

#### Option 1: Run All Applications (Recommended)

Start both the documentation site and rule builder simultaneously:

```bash
pnpm dev
```

- **Documentation**: http://localhost:3001
- **Rule Builder**: http://localhost:3000

#### Option 2: Run Individual Applications

**Documentation site only:**
```bash
pnpm --filter docs dev
```
Visit: http://localhost:3001

**Rule builder only:**
```bash
pnpm --filter web dev
```
Visit: http://localhost:3000

#### Option 3: Build Core Package Only

If you only need the rule engine without the UI:

```bash
pnpm --filter @repo/core build
```

---

## 💻 Usage

### Using the Visual Rule Builder

1. **Access the Interface**: Visit http://localhost:3001 and click "Launch Rule Builder" or go directly to http://localhost:3000

2. **Create a Rule**:
   - Enter a rule name and priority
   - Add conditions using the condition builder
   - Define actions to execute when conditions are met
   - Save your rule

3. **Test Your Rule**:
   - Switch to the "Test Rules" tab
   - Input sample data in JSON format
   - Click "Test" to see results
   - Verify the output matches expectations

4. **Export Your Rule**:
   - Choose export format (JSON, TypeScript, or JavaScript)
   - Copy the generated code
   - Integrate into your application

### Example: Creating a Discount Rule

```typescript
// 1. Define your rule structure
const discountRule = {
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
    {
      type: "discount",
      target: "cart",
      payload: { percentage: 15 }
    }
  ]
};

// 2. Test with sample data
const testData = {
  userType: "premium",
  cartValue: 150
};

// 3. Export and integrate into your app
```

---

## 🧩 Core Package Usage

The `@repo/core` package provides the rule evaluation engine that can be used independently in any JavaScript/TypeScript project.

### Installation in External Projects

```bash
npm install @repo/core
# or
pnpm add @repo/core
```

### Basic Rule Evaluation

```typescript
import { executeRules, Rule } from "@repo/core/evaluators";

// Define your rules
const rules: Rule[] = [
  {
    name: "VIP Customer Rule",
    priority: 10,
    condition: {
      operator: "AND",
      conditions: [
        { field: "customerType", operator: "==", value: "VIP" },
        { field: "orderAmount", operator: ">=", value: 500 }
      ]
    },
    actions: [
      {
        type: "discount",
        target: "order",
        payload: { percentage: 20 }
      },
      {
        type: "upgrade",
        target: "shipping",
        payload: { type: "express" }
      }
    ]
  }
];

// Provide context data
const context = {
  customerType: "VIP",
  orderAmount: 750,
  country: "US"
};

// Execute rules
const results = executeRules(rules, context);

// Access results
console.log(results);
// Map {
//   'order' => { type: 'discount', payload: { percentage: 20 } },
//   'shipping' => { type: 'upgrade', payload: { type: 'express' } }
// }
```

### Nested Conditions

Create complex logic with nested condition groups:

```typescript
const complexRule: Rule = {
  name: "Complex Eligibility Rule",
  priority: 5,
  condition: {
    operator: "AND",
    conditions: [
      {
        operator: "OR",
        conditions: [
          { field: "age", operator: ">=", value: 18 },
          { field: "hasParentalConsent", operator: "==", value: true }
        ]
      },
      {
        operator: "AND",
        conditions: [
          { field: "country", operator: "in", value: ["US", "CA", "UK"] },
          { field: "emailVerified", operator: "==", value: true }
        ]
      }
    ]
  },
  actions: [
    { type: "grant", target: "access", payload: { level: "full" } }
  ]
};
```

### Available Operators

#### Comparison Operators
- `==`: Equal to (strict equality)
- `!=`: Not equal to (strict inequality)
- `>`: Greater than
- `<`: Less than
- `>=`: Greater than or equal to
- `<=`: Less than or equal to

#### Array Operators
- `in`: Value exists in array
- `not`: Value does not exist in array

#### Logical Group Operators
- `AND`: All conditions must be true
- `OR`: At least one condition must be true
- `XOR`: Exactly one condition must be true (exclusive or)
- `NAND`: Not all conditions are true
- `NOR`: None of the conditions are true

### Custom Operators

Extend the rule engine with custom logical operators:

```typescript
import { registerOperator } from "@repo/core/evaluators";

// Register a custom operator
registerOperator({
  name: "MAJORITY",
  evaluate: (conditions: boolean[]) => {
    const trueCount = conditions.filter(Boolean).length;
    return trueCount > conditions.length / 2;
  }
});

// Use in a rule
const rule: Rule = {
  name: "Majority Vote Rule",
  priority: 1,
  condition: {
    operator: "MAJORITY",
    conditions: [
      { field: "vote1", operator: "==", value: true },
      { field: "vote2", operator: "==", value: true },
      { field: "vote3", operator: "==", value: false },
      { field: "vote4", operator: "==", value: true }
    ]
  },
  actions: [
    { type: "approve", target: "decision", payload: {} }
  ]
};
```

### Type Safety with Zod

The core package uses Zod for runtime validation:

```typescript
import { RuleSchema, ConditionSchema } from "@repo/core/evaluators";

// Validate a rule at runtime
const ruleData = {
  name: "My Rule",
  priority: 5,
  condition: {
    operator: "AND",
    conditions: [
      { field: "status", operator: "==", value: "active" }
    ]
  },
  actions: [
    { type: "notify", target: "user", payload: {} }
  ]
};

try {
  const validatedRule = RuleSchema.parse(ruleData);
  console.log("Rule is valid:", validatedRule);
} catch (error) {
  console.error("Validation error:", error);
}
```

---

## 🔧 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode with hot reload |
| `pnpm build` | Build all packages and apps for production |
| `pnpm lint` | Run ESLint across all packages and fix issues |
| `pnpm format` | Format code with Prettier |
| `pnpm check-types` | Run TypeScript type checking across all packages |
| `pnpm clean` | Clean all build artifacts and node_modules |

### Package-Specific Commands

```bash
# Build only the core package
pnpm --filter @repo/core build

# Watch mode for core package during development
pnpm --filter @repo/core dev

# Run docs app only
pnpm --filter docs dev

# Build web app for production
pnpm --filter web build

# Type check hooks package
pnpm --filter @repo/hooks check-types
```

### Project Configuration

#### Turborepo

The project uses Turborepo for efficient builds and caching. Configuration is in [turbo.json](turbo.json).

#### TypeScript

Shared TypeScript configurations are in [packages/typescript-config](packages/typescript-config). Each package extends these base configs.

#### ESLint

Shared ESLint rules are in [packages/eslint-config](packages/eslint-config) for consistent code quality.

### Development Workflow

1. **Create a new branch:**
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make changes** to the relevant package(s)

3. **Run type checking:**
   ```bash
   pnpm check-types
   ```

4. **Run linting:**
   ```bash
   pnpm lint
   ```

5. **Test your changes** in the relevant app(s)

6. **Build to ensure no errors:**
   ```bash
   pnpm build
   ```

7. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/my-new-feature
   ```

---

## 🧪 Testing

### Manual Testing with the Rule Builder

1. Navigate to the rule builder at http://localhost:3000
2. Create test rules with various condition combinations
3. Use the built-in test interface to validate behavior
4. Check edge cases and boundary conditions

### Testing Rules Programmatically

```typescript
import { executeRules, Rule } from "@repo/core/evaluators";

// Test function
function testRule(rule: Rule, testCases: Array<{ context: any, expected: any }>) {
  testCases.forEach(({ context, expected }, index) => {
    const results = executeRules([rule], context);
    console.log(`Test ${index + 1}:`,
      JSON.stringify(results) === JSON.stringify(expected) ? '✅ PASS' : '❌ FAIL'
    );
  });
}

// Example test
const rule: Rule = {
  name: "Age Verification",
  priority: 1,
  condition: {
    operator: "AND",
    conditions: [
      { field: "age", operator: ">=", value: 18 }
    ]
  },
  actions: [
    { type: "grant", target: "access", payload: {} }
  ]
};

testRule(rule, [
  { context: { age: 20 }, expected: new Map([['access', { type: 'grant', payload: {} }]]) },
  { context: { age: 16 }, expected: new Map() },
]);
```

### Best Practices for Testing

- Test all condition paths (positive and negative cases)
- Test edge cases (boundary values, null/undefined, empty arrays)
- Test nested conditions with various operator combinations
- Verify priority-based execution with multiple rules
- Test custom operators thoroughly
- Performance test with large datasets

For comprehensive testing strategies, see the [Rule Testing Documentation](apps/docs/app/docs/rule-testing/page.tsx).

---

## 📚 API Reference

### Core Functions

#### `executeRules(rules: Rule[], context: Record<string, any>): Map<string, any>`

Executes a set of rules against a context object. Rules are evaluated in priority order (highest first).

**Parameters:**
- `rules`: Array of rule objects to evaluate
- `context`: Object containing the data to evaluate against

**Returns:** Map of action targets to action details for all triggered rules

#### `evaluateCondition(condition: Condition | ConditionGroup, context: Record<string, any>): boolean`

Evaluates a single condition or condition group against a context.

**Parameters:**
- `condition`: Condition or condition group to evaluate
- `context`: Object containing the data to evaluate against

**Returns:** Boolean indicating whether the condition is met

#### `registerOperator(operator: CustomOperator): void`

Registers a custom logical operator for use in condition groups.

**Parameters:**
- `operator`: Object with `name` (string) and `evaluate` (function) properties

**Throws:** Error if attempting to override built-in operators

#### `getOperator(name: string): CustomOperator | Function`

Retrieves a registered operator by name.

**Parameters:**
- `name`: Name of the operator to retrieve

**Returns:** The operator's evaluate function or undefined

### Type Definitions

#### `Rule`
```typescript
{
  id?: string;
  name?: string;
  priority: number;
  condition: ConditionGroup;
  actions: Action[];
}
```

#### `Condition`
```typescript
{
  field: string;
  operator: "==" | "!=" | ">" | "<" | ">=" | "<=" | "in" | "not";
  value: any;
}
```

#### `ConditionGroup`
```typescript
{
  operator: "AND" | "OR" | "XOR" | "NAND" | "NOR" | string;
  conditions: Array<Condition | ConditionGroup>;
}
```

#### `Action`
```typescript
{
  type: string;
  target: string;
  payload?: any;
}
```

---

## 📖 Examples

### Example 1: E-commerce Discount System

```typescript
import { executeRules, Rule } from "@repo/core/evaluators";

const discountRules: Rule[] = [
  {
    name: "Black Friday VIP",
    priority: 100,
    condition: {
      operator: "AND",
      conditions: [
        { field: "event", operator: "==", value: "blackfriday" },
        { field: "membershipTier", operator: "==", value: "VIP" },
        { field: "cartTotal", operator: ">=", value: 200 }
      ]
    },
    actions: [
      { type: "discount", target: "cart", payload: { percentage: 30, max: 100 } },
      { type: "freeShipping", target: "shipping", payload: {} }
    ]
  },
  {
    name: "New Customer Welcome",
    priority: 50,
    condition: {
      operator: "AND",
      conditions: [
        { field: "isNewCustomer", operator: "==", value: true },
        { field: "cartTotal", operator: ">=", value: 50 }
      ]
    },
    actions: [
      { type: "discount", target: "cart", payload: { percentage: 15 } }
    ]
  },
  {
    name: "Bulk Order Discount",
    priority: 75,
    condition: {
      operator: "AND",
      conditions: [
        { field: "itemCount", operator: ">=", value: 10 }
      ]
    },
    actions: [
      { type: "discount", target: "cart", payload: { percentage: 10 } }
    ]
  }
];

// Apply rules
const orderContext = {
  event: "blackfriday",
  membershipTier: "VIP",
  cartTotal: 250,
  isNewCustomer: false,
  itemCount: 5
};

const actions = executeRules(discountRules, orderContext);
console.log("Applied discounts:", actions);
// Map { 'cart' => { type: 'discount', payload: { percentage: 30, max: 100 } },
//       'shipping' => { type: 'freeShipping', payload: {} } }
```

### Example 2: Content Moderation

```typescript
const moderationRules: Rule[] = [
  {
    name: "Spam Detection",
    priority: 100,
    condition: {
      operator: "OR",
      conditions: [
        { field: "linkCount", operator: ">=", value: 5 },
        { field: "capsPercentage", operator: ">=", value: 70 },
        { field: "containsSpamKeywords", operator: "==", value: true }
      ]
    },
    actions: [
      { type: "flag", target: "content", payload: { reason: "spam" } },
      { type: "quarantine", target: "content", payload: {} }
    ]
  },
  {
    name: "Offensive Content",
    priority: 95,
    condition: {
      operator: "AND",
      conditions: [
        { field: "sentimentScore", operator: "<", value: -0.8 },
        { field: "containsProfanity", operator: "==", value: true }
      ]
    },
    actions: [
      { type: "remove", target: "content", payload: { reason: "offensive" } },
      { type: "notify", target: "moderators", payload: { priority: "high" } }
    ]
  }
];
```

### Example 3: Access Control

```typescript
const accessRules: Rule[] = [
  {
    name: "Admin Full Access",
    priority: 100,
    condition: {
      operator: "AND",
      conditions: [
        { field: "role", operator: "==", value: "admin" },
        { field: "mfaEnabled", operator: "==", value: true }
      ]
    },
    actions: [
      { type: "grant", target: "access", payload: { level: "full", resources: "*" } }
    ]
  },
  {
    name: "Department Lead Access",
    priority: 75,
    condition: {
      operator: "AND",
      conditions: [
        { field: "role", operator: "==", value: "lead" },
        { field: "department", operator: "in", value: ["engineering", "product", "design"] }
      ]
    },
    actions: [
      { type: "grant", target: "access", payload: { level: "department", resources: ["read", "write"] } }
    ]
  },
  {
    name: "Contractor Limited Access",
    priority: 25,
    condition: {
      operator: "AND",
      conditions: [
        { field: "employmentType", operator: "==", value: "contractor" },
        { field: "contractActive", operator: "==", value: true }
      ]
    },
    actions: [
      { type: "grant", target: "access", payload: { level: "limited", resources: ["read"] } }
    ]
  }
];
```

For more examples, visit the [documentation site](http://localhost:3001/docs/examples) or explore the [examples directory](apps/docs/app/docs/examples).

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/yourusername/krule/issues) with:

- Clear description of the problem or feature
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Environment details (OS, Node version, etc.)

### Contributing Code

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/krule.git
   cd krule
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Make your changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests for new features

5. **Run quality checks**
   ```bash
   pnpm check-types
   pnpm lint
   pnpm build
   ```

6. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/) format:
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation changes
   - `refactor:` Code refactoring
   - `test:` Test additions/changes
   - `chore:` Maintenance tasks

7. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

8. **Open a Pull Request**
   - Provide clear description of changes
   - Link related issues
   - Ensure all checks pass

### Development Guidelines

- **Code Style**: Follow the existing code style and ESLint rules
- **Type Safety**: Maintain 100% TypeScript coverage
- **Documentation**: Update documentation for new features
- **Testing**: Add tests for new functionality
- **Commits**: Use semantic commit messages
- **PR Size**: Keep pull requests focused and reasonably sized

### Areas to Contribute

- 🐛 Bug fixes
- ✨ New features and operators
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Additional tests
- 🌍 Internationalization
- ⚡ Performance optimizations

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Resources

### Documentation
- [Official Documentation](http://localhost:3001)
- [API Reference](http://localhost:3001/docs/api)
- [Examples](http://localhost:3001/docs/examples)

### Technologies
- [Turborepo](https://turbo.build/repo) - High-performance build system
- [Next.js](https://nextjs.org/) - React framework for production
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager
- [React](https://react.dev/) - UI component library

### Community
- [GitHub Issues](https://github.com/yourusername/krule/issues) - Bug reports and feature requests
- [Discussions](https://github.com/yourusername/krule/discussions) - Questions and community chat

---

## 🙏 Acknowledgments

Built with modern tools and inspired by the need for accessible, powerful rule engines that don't require extensive coding knowledge.

---

<div align="center">

**[⬆ Back to Top](#krule---rule-engine-builder)**

Made with ❤️ by the KRule Team

</div>