# KRule - Rule Engine Builder

A powerful, flexible rule engine with an interactive UI for building, testing, and exporting business rules for different use case scenarios.

## 🎯 Project Goals

KRule aims to provide developers with:

- **Visual Rule Creation**: Build complex business rules through an intuitive web interface
- **Real-time Testing**: Test rules instantly with sample data to validate logic
- **Multiple Export Formats**: Export rules as JSON, TypeScript, or JavaScript for easy integration
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Flexible Evaluation**: Support for complex condition groups with AND/OR/XOR/NAND/NOR operators
- **Extensible Architecture**: Custom operators and actions for specific use cases

## 🚀 Use Cases

- **E-commerce**: Dynamic pricing, discounts, and promotional rules
- **Content Moderation**: Automated content filtering and flagging
- **Access Control**: Role-based permissions and security rules
- **Workflow Automation**: Business process rules and decision trees
- **Data Validation**: Input validation and data quality rules

## 📦 What's inside?

This monorepo includes the following packages and applications:

### Apps

- **`docs`** (port 3001): Documentation app with project overview and links to the rule builder
- **`web`** (port 3000): Interactive KRule UI for building, testing, and exporting rules

### Packages

- **`@repo/core`**: Core rule engine with evaluation logic and type definitions
- **`@repo/hooks`**: React hooks for rule engine integration
- **`@repo/ui`**: Shared React component library
- **`@repo/eslint-config`**: ESLint configurations
- **`@repo/typescript-config`**: TypeScript configurations

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/) with comprehensive type safety.

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd krule
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Build the core package:**
   ```bash
   pnpm build
   ```

### Development

#### Option 1: Run All Apps (Recommended)

```bash
pnpm dev
```

This starts both apps simultaneously:
- **Docs app**: http://localhost:3001
- **Web app**: http://localhost:3000

#### Option 2: Run Individual Apps

**Start the documentation app:**
```bash
pnpm --filter docs dev
```
Visit: http://localhost:3001

**Start the rule builder UI:**
```bash
pnpm --filter web dev
```
Visit: http://localhost:3000

### Production Build

To build all apps and packages for production:

```bash
pnpm build
```

To build a specific app:

```bash
pnpm --filter web build
pnpm --filter docs build
```

## 🎨 Using the Rule Builder

1. **Access the UI**: Visit http://localhost:3001 and click "Launch Rule Builder"
2. **Create Rules**: Use the visual form to build conditions and actions
3. **Test Rules**: Switch to the "Test Rules" tab to validate with sample data
4. **Export Rules**: Export your rules as JSON, TypeScript, or JavaScript code

### Example Rule Structure

```typescript
import { Rule } from "@repo/core/evaluators";

const rule: Rule = {
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
    { type: "discount", target: "cart", payload: { percentage: 15 } }
  ]
};
```

## 🧩 Core Package Usage

### Basic Rule Evaluation

```typescript
import { executeRules, Rule } from "@repo/core/evaluators";

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
      { type: "discount", target: "order", payload: { percentage: 20 } },
      { type: "upgrade", target: "shipping", payload: { type: "express" } }
    ]
  }
];

const context = {
  customerType: "VIP",
  orderAmount: 750,
  country: "US"
};

const results = executeRules(rules, context);
console.log(results); // Map with triggered actions
```

### Available Operators

- **Comparison**: `==`, `!=`, `>`, `<`, `>=`, `<=`
- **Array**: `in`, `not`
- **Logical Groups**: `AND`, `OR`, `XOR`, `NAND`, `NOR`

### Custom Operators

```typescript
import { registerOperator } from "@repo/core/evaluators";

registerOperator({
  name: "CUSTOM_LOGIC",
  evaluate: (conditions: boolean[]) => {
    // Your custom logic here
    return conditions.some(Boolean) && conditions.length > 2;
  }
});
```

## 🔧 Development Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm clean` | Clean all build artifacts |
| `pnpm type-check` | Run TypeScript type checking |

## 📁 Project Structure

```
krule/
├── apps/
│   ├── docs/          # Documentation app (port 3001)
│   └── web/           # Rule builder UI (port 3000)
├── packages/
│   ├── core/          # Rule engine logic
│   ├── hooks/         # React hooks
│   ├── ui/            # Shared components
│   ├── eslint-config/ # ESLint configurations
│   └── typescript-config/ # TypeScript configurations
├── package.json       # Root package.json
├── turbo.json        # Turborepo configuration
└── README.md         # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the type checker: `pnpm type-check`
5. Run the linter: `pnpm lint`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Useful Links

Learn more about the technologies used:

- [Turborepo](https://turbo.build/repo) - Build system
- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Zod](https://zod.dev/) - Schema validation
