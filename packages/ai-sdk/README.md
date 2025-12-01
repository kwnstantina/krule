# @repo/ai-sdk

KRule AI SDK - Generate business rules from natural language using AI.

## Installation

```bash
# If using in the monorepo
pnpm add @repo/ai-sdk

# For external projects (once published)
npm install @krule/ai-sdk
```

## Quick Start

```typescript
import { KRuleAI } from "@repo/ai-sdk";

// Initialize client
const ai = new KRuleAI({
  baseUrl: "https://your-krule-api.com/api/ai",
  apiKey: "your-api-key", // Optional
});

// Generate a rule
const result = await ai.generateRule({
  prompt: "Give VIP users 20% off when their cart is over $100",
});

if (result.success) {
  console.log("Generated rule:", result.rule);
}
```

## API Reference

### `KRuleAI` Class

#### Constructor

```typescript
const ai = new KRuleAI({
  apiKey?: string;      // Optional API key for authentication
  baseUrl?: string;     // API base URL (default: http://localhost:3000/api/ai)
  timeout?: number;     // Request timeout in ms (default: 30000)
});
```

#### Methods

##### `generateRule(options)`

Generate a rule from natural language.

```typescript
const result = await ai.generateRule({
  prompt: "Block users with more than 5 failed login attempts",
  userId: "optional-user-id",
});

// Returns: GenerateRuleResponse
// {
//   success: boolean;
//   rule?: Rule;
//   error?: string;
//   attempts?: number;
// }
```

##### `explainRule(options)`

Get a plain English explanation of a rule.

```typescript
const result = await ai.explainRule({
  rule: myRule,
  type: "full", // "full" | "conditions" | "actions" | "useCases"
});

// Returns: ExplainRuleResponse
// {
//   success: boolean;
//   explanation?: string;
//   error?: string;
// }
```

##### `validateRule(options)`

Validate a rule with AI-assisted error explanations.

```typescript
const result = await ai.validateRule({
  rule: myRule,
  userId: "optional-user-id",
});

// Returns: ValidateRuleResponse
// {
//   valid: boolean;
//   errors?: any[];
//   aiExplanation?: string;
//   suggestions?: string[];
//   issues?: string[];
//   warnings?: string[];
// }
```

##### `generateTests(options)`

Generate test scenarios for a rule.

```typescript
const result = await ai.generateTests({
  rule: myRule,
  type: "suite", // "all" | "positive" | "negative" | "edge" | "suite"
  count: 3,
});

// Returns: GenerateTestsResponse
// {
//   success: boolean;
//   scenarios?: TestScenario[];
//   error?: string;
// }
```

##### `createConversation(userId?)`

Create a multi-turn conversational session.

```typescript
const conversation = ai.createConversation("user-123");

await conversation.send("Create a content moderation rule");
await conversation.send("Make it more strict");

const rule = conversation.getRule();
const history = conversation.getHistory();
```

---

## Examples

### Basic Rule Generation

```typescript
import { KRuleAI } from "@repo/ai-sdk";

const ai = new KRuleAI();

async function generateDiscountRule() {
  const result = await ai.generateRule({
    prompt: "Give premium users 15% discount when cart value exceeds $100",
  });

  if (result.success && result.rule) {
    console.log("Rule name:", result.rule.name);
    console.log("Priority:", result.rule.priority);
    console.log("Conditions:", result.rule.condition);
    console.log("Actions:", result.rule.actions);
  } else {
    console.error("Error:", result.error);
  }
}

generateDiscountRule();
```

### Conversational Refinement

```typescript
import { KRuleAI } from "@repo/ai-sdk";

const ai = new KRuleAI();

async function refineRule() {
  const conversation = ai.createConversation();

  // Initial request
  await conversation.send("Create a user access control rule");

  // Refine it
  await conversation.send("Add a condition for verified email");
  await conversation.send("Set priority to 90");

  // Get final rule
  const finalRule = conversation.getRule();
  console.log("Final rule:", finalRule);

  // View history
  const history = conversation.getHistory();
  console.log("Conversation:", history);
}

refineRule();
```

### Validation with AI Assistance

```typescript
import { KRuleAI } from "@repo/ai-sdk";

const ai = new KRuleAI();

async function validateMyRule() {
  const myRule = {
    name: "Test Rule",
    priority: "high", // Wrong type - should be number
    condition: {
      operator: "AND",
      conditions: [],
    },
    actions: [],
  };

  const result = await ai.validateRule({ rule: myRule });

  if (!result.valid) {
    console.log("Validation failed!");
    console.log("AI Explanation:", result.aiExplanation);
    console.log("Suggestions:", result.suggestions);
  }
}

validateMyRule();
```

### Test Generation

```typescript
import { KRuleAI } from "@repo/ai-sdk";

const ai = new KRuleAI();

async function generateTestSuite() {
  const rule = {
    name: "VIP Discount",
    priority: 50,
    condition: {
      operator: "AND",
      conditions: [
        { field: "userType", operator: "==", value: "VIP" },
        { field: "cartValue", operator: ">=", value: 100 },
      ],
    },
    actions: [{ type: "discount", target: "cart", payload: { percentage: 20 } }],
  };

  const result = await ai.generateTests({
    rule: rule,
    type: "suite",
  });

  if (result.success && result.scenarios) {
    console.log(`Generated ${result.scenarios.length} test scenarios:`);

    result.scenarios.forEach((scenario) => {
      console.log(`\n${scenario.name}:`);
      console.log("Data:", scenario.data);
      console.log("Should trigger:", scenario.shouldTrigger);
    });
  }
}

generateTestSuite();
```

### Explain Rule

```typescript
import { KRuleAI } from "@repo/ai-sdk";

const ai = new KRuleAI();

async function explainMyRule() {
  const rule = {
    name: "Content Moderation",
    priority: 80,
    condition: {
      operator: "OR",
      conditions: [
        { field: "reportCount", operator: ">=", value: 3 },
        { field: "sentiment", operator: "==", value: "negative" },
      ],
    },
    actions: [{ type: "flag", target: "content", payload: { reason: "review" } }],
  };

  // Full explanation
  const full = await ai.explainRule({ rule, type: "full" });
  console.log("Full explanation:", full.explanation);

  // Just conditions
  const conditions = await ai.explainRule({ rule, type: "conditions" });
  console.log("Conditions:", conditions.explanation);

  // Use cases
  const useCases = await ai.explainRule({ rule, type: "useCases" });
  console.log("Use cases:", useCases.explanation);
}

explainMyRule();
```

---

## Error Handling

```typescript
import { KRuleAI } from "@repo/ai-sdk";

const ai = new KRuleAI({ timeout: 10000 });

async function handleErrors() {
  try {
    const result = await ai.generateRule({
      prompt: "Invalid prompt",
    });

    if (!result.success) {
      // API returned an error
      console.error("API Error:", result.error);
    }
  } catch (error) {
    // Network or timeout error
    if (error instanceof Error) {
      console.error("Network Error:", error.message);
    }
  }
}

handleErrors();
```

---

## TypeScript Support

The SDK is fully typed with TypeScript:

```typescript
import type {
  Rule,
  GenerateRuleResponse,
  TestScenario,
  KRuleAIConfig,
} from "@repo/ai-sdk";

const config: KRuleAIConfig = {
  apiKey: "my-key",
  baseUrl: "https://api.example.com",
};

const ai = new KRuleAI(config);

// Type-safe responses
const result: GenerateRuleResponse = await ai.generateRule({
  prompt: "Create a rule",
});

if (result.rule) {
  const rule: Rule = result.rule;
  // rule is fully typed
}
```

---

## Rate Limiting

The API has rate limits. Handle them gracefully:

```typescript
async function generateWithRetry(prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await ai.generateRule({ prompt });
      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes("rate limit")) {
        // Wait and retry
        await new Promise((resolve) => setTimeout(resolve, 60000));
      } else {
        throw error;
      }
    }
  }
}
```

---

## License

MIT
