# KRule Product Roadmap

> **Vision**: Become the industry-standard rule engine platform that bridges the gap between business logic and code, enabling organizations to manage decisions as first-class citizens.

---

## Executive Summary

This roadmap outlines a 4-phase approach to transform KRule from a promising MVP into a market-leading rule engine platform. Each phase builds upon the previous, with clear technical deliverables and business outcomes.

| Phase | Timeline | Focus | Key Outcome |
|-------|----------|-------|-------------|
| Phase 1 | Foundation | Core stability & developer adoption | 1,000 GitHub stars, 100 active users |
| Phase 2 | Growth | Enterprise features & monetization | First paying customers, $10K MRR |
| Phase 3 | Scale | Platform & ecosystem | 10+ integrations, partner program |
| Phase 4 | Leadership | Market dominance | Industry recognition, acquisition-ready |

---

## Phase 1: Foundation (Weeks 1-8)

### Objective
Solidify the core product, establish developer credibility, and create adoption momentum.

### Technical Milestones

#### 1.1 Core Engine Hardening
- [ ] **Performance benchmarking suite**
  - Create benchmark comparing KRule vs json-rules-engine, Drools
  - Target: 10,000 rule evaluations/second
  - Publish results in README

- [ ] **Rule validation improvements**
  - Circular dependency detection
  - Type inference for fact properties
  - Schema-based validation (JSON Schema support)

- [ ] **Error handling & debugging**
  - Detailed error messages with suggestions
  - Rule execution trace logging
  - Debug mode with step-by-step evaluation

```typescript
// Example: Enhanced error output
{
  success: false,
  error: {
    code: "CONDITION_TYPE_MISMATCH",
    message: "Cannot compare string 'premium' with number operator '>'",
    location: { ruleId: "discount-rule", conditionIndex: 2 },
    suggestion: "Use '==' operator for string comparison or convert to number"
  }
}
```

#### 1.2 Developer Experience
- [ ] **CLI Tool** (`@krule/cli`)
  ```bash
  npx krule init           # Initialize project with KRule
  npx krule validate       # Validate all rules in project
  npx krule test           # Run rule test suites
  npx krule export --json  # Export rules to JSON
  ```

- [ ] **VS Code Extension**
  - Syntax highlighting for .krule files
  - IntelliSense for rule conditions
  - Inline validation and error highlighting

- [ ] **Playground improvements**
  - Shareable rule links (like CodeSandbox)
  - Embedded examples in documentation
  - Pre-loaded templates by use case

#### 1.3 Testing Infrastructure
- [ ] **Comprehensive test coverage**
  - Unit tests: 90%+ coverage on core package
  - Integration tests: All AI endpoints
  - E2E tests: Critical user flows

- [ ] **CI/CD pipeline**
  - Automated testing on PRs
  - Semantic versioning
  - NPM publishing workflow
  - Changelog generation

### Business Milestones

#### 1.1 Open Source Strategy
- [ ] **GitHub optimization**
  - Compelling README with animated GIFs
  - CONTRIBUTING.md with clear guidelines
  - Issue templates (bug, feature, question)
  - Discussion forums enabled

- [ ] **Community building**
  - Discord server for community support
  - Weekly "Rule of the Week" examples
  - Monthly virtual meetups

#### 1.2 Content Marketing
- [ ] **Launch blog posts**
  - "Why We Built KRule" - origin story
  - "Rules Engine vs Hardcoded Logic" - educational
  - "Building a Pricing Engine in 5 Minutes" - tutorial

- [ ] **Developer outreach**
  - Post on Hacker News, Reddit r/programming
  - Dev.to and Hashnode articles
  - YouTube tutorial series

#### 1.3 Metrics & Analytics
- [ ] **Tracking setup**
  - NPM download tracking
  - GitHub star history
  - Documentation page views
  - Playground usage analytics

### Phase 1 Deliverables

| Deliverable | Success Metric |
|-------------|----------------|
| Stable v1.0 release | Zero critical bugs for 2 weeks |
| CLI tool published | 500+ NPM downloads |
| 10 tutorial articles | 10K total page views |
| Discord community | 200+ members |
| Template library | 25 pre-built rule templates |

---

## Phase 2: Growth (Weeks 9-20)

### Objective
Add enterprise-grade features, establish monetization, and acquire first paying customers.

### Technical Milestones

#### 2.1 Enterprise Features

##### Rule Versioning & History
```typescript
// API design for versioning
interface RuleVersion {
  id: string;
  ruleId: string;
  version: number;
  content: Rule;
  createdAt: Date;
  createdBy: string;
  changeMessage: string;
  diff: RuleDiff; // What changed from previous version
}

// Endpoints
POST   /api/rules/:id/versions     // Create new version
GET    /api/rules/:id/versions     // List all versions
GET    /api/rules/:id/versions/:v  // Get specific version
POST   /api/rules/:id/rollback/:v  // Rollback to version
GET    /api/rules/:id/diff/:v1/:v2 // Compare versions
```

##### Audit Trail
```typescript
interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'EXPORT';
  resourceType: 'RULE' | 'RULESET' | 'TEST';
  resourceId: string;
  before?: object;
  after?: object;
  metadata: {
    ipAddress: string;
    userAgent: string;
    executionTimeMs?: number;
  };
}
```

##### Role-Based Access Control
```typescript
// Permission model
type Permission =
  | 'rules:read'
  | 'rules:write'
  | 'rules:delete'
  | 'rules:publish'
  | 'rules:execute'
  | 'audit:read'
  | 'team:manage';

interface Role {
  name: string;
  permissions: Permission[];
}

// Pre-defined roles
const ROLES = {
  viewer: ['rules:read', 'rules:execute'],
  editor: ['rules:read', 'rules:write', 'rules:execute'],
  publisher: ['rules:read', 'rules:write', 'rules:publish', 'rules:execute'],
  admin: ['*'], // All permissions
};
```

#### 2.2 Rule Intelligence

##### Conflict Detection
```typescript
// AI-powered conflict analysis
interface ConflictReport {
  rules: [string, string]; // IDs of conflicting rules
  type: 'OVERLAP' | 'CONTRADICTION' | 'REDUNDANCY' | 'DEAD_CODE';
  severity: 'ERROR' | 'WARNING' | 'INFO';
  description: string;
  example: {
    input: object;
    rule1Result: boolean;
    rule2Result: boolean;
  };
  suggestion: string;
}

// Endpoint
POST /api/ai/analyze-conflicts
Body: { ruleIds: string[] }
Response: { conflicts: ConflictReport[] }
```

##### Impact Analysis
```typescript
// "What-if" analysis for rule changes
interface ImpactAnalysis {
  ruleId: string;
  proposedChange: Rule;
  historicalData: {
    totalEvaluations: number;
    currentMatches: number;
    projectedMatches: number;
    changePercent: number;
  };
  affectedRecords: {
    wouldMatch: string[]; // IDs that would now match
    wouldNotMatch: string[]; // IDs that would no longer match
  };
  businessImpact: {
    metric: string; // e.g., "revenue", "discounts"
    currentValue: number;
    projectedValue: number;
  };
}
```

#### 2.3 Integrations

##### Webhook System
```typescript
// Webhook configuration
interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string; // For HMAC signature
  retryPolicy: {
    maxAttempts: number;
    backoffMs: number;
  };
}

type WebhookEvent =
  | 'rule.created'
  | 'rule.updated'
  | 'rule.deleted'
  | 'rule.published'
  | 'rule.executed'
  | 'test.failed';
```

##### REST API for External Systems
```typescript
// Public API endpoints
POST /api/v1/evaluate
Body: {
  ruleId: string;
  facts: object;
  options?: {
    trace: boolean;
    timeout: number;
  };
}

Response: {
  matched: boolean;
  actions: Action[];
  trace?: EvaluationTrace;
  executionTimeMs: number;
}

// Batch evaluation
POST /api/v1/evaluate/batch
Body: {
  ruleId: string;
  facts: object[];
}

Response: {
  results: EvaluationResult[];
  summary: {
    total: number;
    matched: number;
    failed: number;
  };
}
```

### Business Milestones

#### 2.1 Monetization Model

##### Pricing Tiers
| Tier | Price | Limits | Features |
|------|-------|--------|----------|
| **Free** | $0 | 100 rules, 10K eval/mo | Core features, community support |
| **Pro** | $49/mo | 1,000 rules, 100K eval/mo | + Versioning, API access, email support |
| **Team** | $199/mo | 10,000 rules, 1M eval/mo | + RBAC, audit trail, webhooks, priority support |
| **Enterprise** | Custom | Unlimited | + SSO, SLA, dedicated support, on-premise |

##### Revenue Projections
| Month | Free Users | Pro | Team | Enterprise | MRR |
|-------|------------|-----|------|------------|-----|
| M3 | 500 | 5 | 1 | 0 | $444 |
| M6 | 2,000 | 25 | 5 | 1 | $3,220 |
| M9 | 5,000 | 75 | 15 | 3 | $9,660 |
| M12 | 10,000 | 150 | 30 | 5 | $19,320 |

#### 2.2 Sales & Marketing

##### Target Verticals (Priority Order)
1. **E-commerce** - Pricing, discounts, promotions
2. **FinTech** - Fraud detection, credit scoring, compliance
3. **HealthTech** - Eligibility rules, treatment protocols
4. **InsurTech** - Underwriting, claims processing

##### Go-to-Market Strategy
- [ ] **Product Hunt launch** - Target #1 Product of the Day
- [ ] **Case studies** - 3 detailed customer success stories
- [ ] **Comparison pages** - KRule vs Drools, vs json-rules-engine
- [ ] **Integration partnerships** - Zapier, n8n, Retool

#### 2.3 Legal & Compliance
- [ ] Terms of Service
- [ ] Privacy Policy (GDPR compliant)
- [ ] Data Processing Agreement (for enterprise)
- [ ] SOC 2 Type 1 preparation

### Phase 2 Deliverables

| Deliverable | Success Metric |
|-------------|----------------|
| Hosted SaaS platform | 99.9% uptime |
| Enterprise features shipped | 3 paying enterprise trials |
| Public API | 1,000 API calls/day |
| First $10K MRR | 10 paying customers |

---

## Phase 3: Scale (Weeks 21-36)

### Objective
Build platform ecosystem, establish partnerships, and achieve market recognition.

### Technical Milestones

#### 3.1 Platform Capabilities

##### Multi-Language SDK Support
```python
# Python SDK
from krule import RuleEngine, Rule

engine = RuleEngine(api_key="...")
result = engine.evaluate(
    rule_id="discount-rule",
    facts={"customer_tier": "premium", "order_total": 150}
)
print(result.matched)  # True
print(result.actions)  # [{"type": "discount", "value": 20}]
```

```go
// Go SDK
import "github.com/krule/krule-go"

engine := krule.NewEngine("api-key")
result, err := engine.Evaluate("discount-rule", map[string]interface{}{
    "customer_tier": "premium",
    "order_total":   150,
})
```

```java
// Java SDK
KRuleEngine engine = new KRuleEngine("api-key");
EvaluationResult result = engine.evaluate(
    "discount-rule",
    Map.of("customer_tier", "premium", "order_total", 150)
);
```

##### Edge Runtime (WebAssembly)
```typescript
// Compile rules to WASM for edge deployment
const wasmBundle = await krule.compile({
  rules: ['rule-1', 'rule-2'],
  target: 'wasm',
  optimize: true,
});

// Deploy to Cloudflare Workers, Vercel Edge, etc.
// Sub-millisecond evaluation at the edge
```

##### Real-time Collaborative Editing
```typescript
// WebSocket-based collaboration
interface CollaborationSession {
  ruleId: string;
  participants: User[];
  cursors: Map<userId, CursorPosition>;
  changes: ChangeStream; // CRDT-based conflict resolution
}

// Features:
// - See other users' cursors in real-time
// - Conflict-free concurrent editing
// - Change attribution
// - Presence indicators
```

#### 3.2 Advanced AI Features

##### Natural Language Rule Queries
```typescript
// Ask questions about your rules in plain English
POST /api/ai/query
Body: {
  question: "Which rules affect premium customers?",
  scope: ["all"] // or specific rule IDs
}

Response: {
  answer: "3 rules affect premium customers...",
  relevantRules: ["rule-1", "rule-2", "rule-3"],
  explanation: "These rules contain conditions checking for customer_tier == 'premium'..."
}
```

##### Auto-Optimization
```typescript
// AI suggests rule optimizations
POST /api/ai/optimize
Body: { ruleId: string }

Response: {
  suggestions: [
    {
      type: "REORDER_CONDITIONS",
      description: "Move 'country == US' check first - it filters 80% of traffic",
      impact: "~40% faster evaluation",
      autoApply: true,
    },
    {
      type: "MERGE_RULES",
      description: "Rules 'discount-10' and 'discount-15' can be combined",
      impact: "Simpler maintenance",
      autoApply: false,
    }
  ]
}
```

##### Reverse Engineering
```typescript
// Convert existing code to KRule rules
POST /api/ai/reverse-engineer
Body: {
  code: `
    function calculateDiscount(customer, order) {
      if (customer.tier === 'premium' && order.total > 100) {
        return 0.2;
      } else if (customer.tier === 'gold') {
        return 0.1;
      }
      return 0;
    }
  `,
  language: "javascript"
}

Response: {
  rules: [
    { name: "premium-discount", conditions: [...], actions: [...] },
    { name: "gold-discount", conditions: [...], actions: [...] }
  ],
  confidence: 0.95,
  notes: ["Default return converted to implicit no-match"]
}
```

#### 3.3 Marketplace

##### Rule Template Marketplace
```typescript
interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'ecommerce' | 'fintech' | 'healthcare' | 'general';
  author: {
    id: string;
    name: string;
    verified: boolean;
  };
  pricing: {
    type: 'free' | 'paid' | 'subscription';
    price?: number;
  };
  stats: {
    downloads: number;
    rating: number;
    reviews: number;
  };
  rules: Rule[];
  documentation: string;
}
```

### Business Milestones

#### 3.1 Partnership Program

##### Integration Partners
| Partner Type | Examples | Value Proposition |
|--------------|----------|-------------------|
| **Low-code Platforms** | Retool, Appsmith, Budibase | Embed KRule as decision component |
| **Automation** | Zapier, n8n, Make | Rule evaluation as workflow step |
| **CRM/ERP** | Salesforce, HubSpot | Business rule management plugin |
| **Cloud Providers** | AWS, GCP, Azure | Marketplace listings |

##### Technology Partners
- Database vendors (rule storage optimization)
- Observability platforms (Datadog, New Relic integration)
- Identity providers (Auth0, Okta SSO)

#### 3.2 Enterprise Sales

##### Sales Process
1. **Discovery call** - Understand use case, current pain
2. **Technical demo** - Tailored to their industry
3. **Proof of Concept** - 2-week guided pilot
4. **Security review** - SOC 2 report, penetration test results
5. **Procurement** - Legal, compliance, procurement alignment
6. **Onboarding** - Dedicated success manager

##### Enterprise Requirements Checklist
- [ ] SOC 2 Type 2 certification
- [ ] GDPR compliance documentation
- [ ] HIPAA BAA (for healthcare)
- [ ] SLA with 99.99% uptime guarantee
- [ ] Dedicated support channels
- [ ] On-premise deployment option
- [ ] Custom contract terms

#### 3.3 Market Expansion

##### Geographic Expansion
- EU data residency (Frankfurt/Dublin regions)
- APAC presence (Singapore/Tokyo)
- Localized documentation (Spanish, German, Japanese)

##### Industry Solutions
Pre-packaged solutions for specific industries:
- **KRule for E-commerce** - Complete pricing/discount rule suite
- **KRule for Finance** - Compliance and fraud detection
- **KRule for Healthcare** - Clinical decision support

### Phase 3 Deliverables

| Deliverable | Success Metric |
|-------------|----------------|
| 3+ language SDKs | 10K+ combined downloads |
| Marketplace launch | 100+ templates available |
| 5+ integration partners | Joint marketing campaigns |
| SOC 2 Type 2 | Audit completed |
| $100K ARR | 50+ paying customers |

---

## Phase 4: Leadership (Weeks 37-52)

### Objective
Establish market leadership, build defensible moats, and position for exit/scale.

### Technical Milestones

#### 4.1 Platform Maturity

##### Decision Intelligence Platform
```
Evolution: Rule Engine → Decision Platform → Decision Intelligence

Features:
- Machine learning model integration
- A/B testing for rules
- Automated rule generation from data
- Decision analytics and insights
- Recommendation engine for rule optimization
```

##### Federated Rule Management
```typescript
// Manage rules across multiple environments/regions
interface FederatedRuleSet {
  globalRules: Rule[]; // Apply everywhere
  regionalOverrides: {
    region: string;
    rules: Rule[];
  }[];
  syncPolicy: {
    propagationDelay: number;
    conflictResolution: 'global-wins' | 'regional-wins' | 'manual';
  };
}
```

##### Self-Healing Rules
```typescript
// AI monitors rule performance and auto-adjusts
interface SelfHealingConfig {
  ruleId: string;
  monitoring: {
    matchRate: { min: number; max: number };
    executionTime: { max: number };
    errorRate: { max: number };
  };
  actions: {
    onAnomaly: 'alert' | 'disable' | 'rollback' | 'auto-fix';
    notificationChannels: string[];
  };
}
```

#### 4.2 Advanced Analytics

##### Decision Analytics Dashboard
- Rule execution heatmaps
- Performance trends over time
- Business impact attribution
- Anomaly detection alerts
- Cohort analysis by rule outcome

##### Explainability & Compliance
```typescript
// Generate audit-ready decision explanations
interface DecisionExplanation {
  decisionId: string;
  timestamp: Date;
  input: object;
  output: {
    matched: boolean;
    actions: Action[];
  };
  explanation: {
    summary: string; // Human-readable summary
    conditionResults: {
      condition: string;
      result: boolean;
      actualValue: any;
      expectedValue: any;
    }[];
    reasoning: string; // AI-generated reasoning
  };
  compliance: {
    regulations: string[]; // e.g., ["GDPR Art. 22", "FCRA"]
    dataUsed: string[]; // Fields used in decision
    retentionPolicy: string;
  };
}
```

### Business Milestones

#### 4.1 Market Position

##### Thought Leadership
- [ ] Industry conference speaking (QCon, KubeCon)
- [ ] Research paper: "State of Business Rules 2026"
- [ ] Podcast appearances
- [ ] Industry analyst briefings (Gartner, Forrester)

##### Awards & Recognition
- Target: Gartner Cool Vendor
- Target: G2 Leader in Business Rules Management
- Target: TrustRadius Top Rated

#### 4.2 Strategic Options

##### Acquisition Readiness
Potential acquirers by category:
| Category | Companies | Strategic Fit |
|----------|-----------|---------------|
| **Enterprise Software** | Salesforce, ServiceNow, SAP | Add decision management to platform |
| **Cloud Providers** | AWS, Google, Microsoft | Complement serverless offerings |
| **Low-Code** | Appian, OutSystems, Mendix | Enhance automation capabilities |
| **Data Platforms** | Databricks, Snowflake | Decision layer for data |

##### IPO Readiness (Alternative Path)
- Clean cap table
- Audited financials (3 years)
- Predictable revenue growth
- Large TAM narrative

#### 4.3 Team Scaling

##### Organizational Structure (Target: 50 people)
```
CEO
├── CTO (15 engineers)
│   ├── Core Platform Team (5)
│   ├── AI/ML Team (4)
│   ├── Infrastructure Team (3)
│   └── Developer Experience Team (3)
├── VP Sales (10 people)
│   ├── Enterprise Sales (4)
│   ├── Mid-Market Sales (3)
│   └── Sales Engineering (3)
├── VP Marketing (8 people)
│   ├── Product Marketing (2)
│   ├── Content/Community (3)
│   └── Demand Generation (3)
├── VP Customer Success (7 people)
│   ├── Onboarding (2)
│   ├── Support (3)
│   └── Success Managers (2)
└── VP Operations (5 people)
    ├── Finance (2)
    ├── HR (2)
    └── Legal (1)
```

### Phase 4 Deliverables

| Deliverable | Success Metric |
|-------------|----------------|
| Decision Intelligence Platform | 3 enterprise deployments |
| Industry recognition | 1 major analyst mention |
| $1M ARR | 200+ paying customers |
| Strategic options | 2+ acquisition conversations or Series A |

---

## Risk Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI accuracy issues | Medium | High | Human-in-loop validation, confidence scores |
| Performance at scale | Medium | High | Early load testing, horizontal scaling design |
| Security breach | Low | Critical | SOC 2 compliance, regular pentests, bug bounty |
| Dependency on Groq | Medium | Medium | Abstract AI provider, support multiple LLMs |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Competitor catches up | High | Medium | Speed of execution, community moat |
| Enterprise sales cycle too long | Medium | High | Self-serve growth, PLG motion |
| Churn in early customers | Medium | High | Dedicated success, feature feedback loop |
| Funding gap | Medium | High | Bootstrap to profitability, diverse revenue |

---

## Success Metrics Dashboard

### North Star Metrics
| Metric | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|--------|---------|---------|---------|---------|
| Monthly Active Users | 500 | 2,000 | 10,000 | 50,000 |
| Rules Created | 1,000 | 10,000 | 100,000 | 1,000,000 |
| API Evaluations/Month | 100K | 1M | 50M | 500M |
| MRR | $0 | $10K | $50K | $100K |
| NPS Score | 30 | 40 | 50 | 60 |

### Leading Indicators
- GitHub stars growth rate
- Documentation page views
- Free → Paid conversion rate
- Time to first rule created
- Support ticket resolution time

---

## Immediate Next Steps (This Week)

### Priority 1: Ship Foundation
1. [ ] Merge current AI features branch
2. [ ] Set up CI/CD pipeline with automated tests
3. [ ] Create 10 template rules for e-commerce use case
4. [ ] Write "Getting Started" tutorial with video

### Priority 2: Community Launch
1. [ ] Create Discord server
2. [ ] Prepare Product Hunt launch materials
3. [ ] Write 3 blog posts for launch week
4. [ ] Set up analytics tracking

### Priority 3: Feedback Loop
1. [ ] Identify 5 beta users for interviews
2. [ ] Create feedback form in app
3. [ ] Set up weekly user interview schedule
4. [ ] Define success metrics for Phase 1

---

## Appendix A: Competitive Analysis

| Feature | KRule | Drools | json-rules-engine | Easy Rules |
|---------|-------|--------|-------------------|------------|
| Visual Builder | Yes | No | No | No |
| AI Generation | Yes | No | No | No |
| TypeScript Native | Yes | No | Yes | No |
| No-Code Friendly | Yes | No | Partial | No |
| Open Source | Yes | Yes | Yes | Yes |
| Enterprise Support | Planned | Yes | No | No |
| Cloud Hosted | Planned | No | No | No |

**KRule's Unfair Advantages:**
1. Only solution with AI-powered rule generation
2. Only solution with both visual builder AND programmatic SDK
3. Modern TypeScript-first architecture
4. Focus on developer experience

---

## Appendix B: Technical Architecture (Target State)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│  Web App    │   CLI       │  VS Code    │   SDKs      │  Edge   │
│  (React)    │   Tool      │  Extension  │  (Py/Go/Js) │  WASM   │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴────┬────┘
       │             │             │             │           │
       └─────────────┴──────┬──────┴─────────────┴───────────┘
                            │
┌───────────────────────────┴───────────────────────────────────┐
│                         API Gateway                            │
│              (Authentication, Rate Limiting, Routing)          │
└───────────────────────────┬───────────────────────────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
┌──────┴──────┐     ┌───────┴───────┐    ┌──────┴──────┐
│   Rule      │     │      AI       │    │   Analytics │
│   Service   │     │   Service     │    │   Service   │
│             │     │               │    │             │
│ - CRUD      │     │ - Generation  │    │ - Tracking  │
│ - Evaluate  │     │ - Explain     │    │ - Reports   │
│ - Version   │     │ - Optimize    │    │ - Alerts    │
└──────┬──────┘     └───────┬───────┘    └──────┬──────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
┌───────────────────────────┴───────────────────────────────────┐
│                      Data Layer                                │
├─────────────────┬─────────────────┬───────────────────────────┤
│   PostgreSQL    │     Redis       │      Object Storage       │
│   (Rules, Users)│   (Cache, Queue)│    (Exports, Backups)     │
└─────────────────┴─────────────────┴───────────────────────────┘
```

---

## Appendix C: Key Decisions Log

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| AI Provider | OpenAI, Anthropic, Groq | Groq | Speed, cost, good quality |
| Database | PostgreSQL, MongoDB | PostgreSQL | Better for structured rules, Prisma support |
| Hosting | Vercel, AWS, GCP | Vercel (start) → AWS (scale) | Fast iteration initially |
| Monorepo | Nx, Turborepo, Lerna | Turborepo | Modern, fast, good DX |
| Pricing Model | Per-seat, Per-rule, Usage | Hybrid (rules + evaluations) | Aligns cost with value |

---

*Last Updated: November 2024*
*Next Review: End of Phase 1*
