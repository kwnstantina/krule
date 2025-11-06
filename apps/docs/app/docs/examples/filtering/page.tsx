import React from 'react';
import '../../docs.css';

export const metadata = {
  title: 'Filtering Rules Examples - KRule Documentation',
  description: 'Real-world filtering rule examples including data filtering, search refinement, and content moderation',
};

export default function FilteringExamplesPage() {
  return (
    <div className="docs-content">
      <div className="docs-header">
        <h1>Filtering Rules Examples</h1>
        <p className="lead">Master data filtering techniques for search refinement, content moderation, and dynamic list filtering.</p>
      </div>

      <div className="docs-section">
        <h2>Product Search Filters</h2>
        <p>Implement sophisticated product filtering that responds to multiple criteria and user preferences.</p>

        <div className="example-card">
          <h3>Multi-Criteria Product Filter</h3>
          <p>Filter products based on price, category, ratings, and availability.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Advanced Product Filter",
  "description": "Filter products with multiple criteria and sorting",
  "conditions": [
    {
      "field": "filter.enabled",
      "operator": "equals",
      "value": true
    }
  ],
  "actions": [
    {
      "type": "filter",
      "field": "products",
      "conditions": [
        {
          "operator": "AND",
          "conditions": [
            {
              "field": "product.price",
              "operator": "between",
              "value": {
                "min": "filter.priceRange.min",
                "max": "filter.priceRange.max"
              }
            },
            {
              "field": "product.category",
              "operator": "in",
              "value": "filter.selectedCategories"
            },
            {
              "field": "product.rating",
              "operator": "greaterThanOrEqual",
              "value": "filter.minRating"
            },
            {
              "field": "product.inStock",
              "operator": "equals",
              "value": true
            }
          ]
        }
      ],
      "target": "results.filteredProducts"
    },
    {
      "type": "set",
      "field": "results.count",
      "value": "results.filteredProducts.length"
    }
  ]
}`}</code></pre>
          </div>

          <h4>Test Data</h4>
          <div className="code-block">
            <pre><code>{`{
  "filter": {
    "enabled": true,
    "priceRange": { "min": 50, "max": 500 },
    "selectedCategories": ["electronics", "accessories"],
    "minRating": 4.0
  },
  "products": [
    {
      "id": "P001",
      "name": "Wireless Headphones",
      "price": 199.99,
      "category": "electronics",
      "rating": 4.5,
      "inStock": true
    },
    {
      "id": "P002",
      "name": "Phone Case",
      "price": 29.99,
      "category": "accessories",
      "rating": 3.8,
      "inStock": true
    },
    {
      "id": "P003",
      "name": "Laptop Stand",
      "price": 89.99,
      "category": "accessories",
      "rating": 4.7,
      "inStock": true
    }
  ]
}

// Expected Result:
{
  "results": {
    "filteredProducts": [
      {
        "id": "P001",
        "name": "Wireless Headphones",
        "price": 199.99,
        "category": "electronics",
        "rating": 4.5,
        "inStock": true
      },
      {
        "id": "P003",
        "name": "Laptop Stand",
        "price": 89.99,
        "category": "accessories",
        "rating": 4.7,
        "inStock": true
      }
    ],
    "count": 2
  }
}`}</code></pre>
          </div>
        </div>

        <div className="example-card">
          <h3>Dynamic Faceted Search</h3>
          <p>Create dynamic search facets based on available products and user selections.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Faceted Search Filter",
  "description": "Generate dynamic facets based on filtered results",
  "actions": [
    {
      "type": "aggregate",
      "field": "products",
      "groupBy": "category",
      "target": "facets.categories"
    },
    {
      "type": "aggregate",
      "field": "products",
      "groupBy": "brand",
      "target": "facets.brands"
    },
    {
      "type": "calculate",
      "field": "facets.priceRanges",
      "formula": "[
        { range: '0-50', count: products.filter(p => p.price < 50).length },
        { range: '50-100', count: products.filter(p => p.price >= 50 && p.price < 100).length },
        { range: '100-500', count: products.filter(p => p.price >= 100 && p.price < 500).length },
        { range: '500+', count: products.filter(p => p.price >= 500).length }
      ]"
    },
    {
      "type": "calculate",
      "field": "facets.ratings",
      "formula": "[
        { stars: 5, count: products.filter(p => p.rating >= 4.5).length },
        { stars: 4, count: products.filter(p => p.rating >= 4 && p.rating < 4.5).length },
        { stars: 3, count: products.filter(p => p.rating >= 3 && p.rating < 4).length },
        { stars: 2, count: products.filter(p => p.rating < 3).length }
      ]"
    }
  ]
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Content Moderation Filters</h2>
        <p>Implement content filtering rules for user-generated content, comments, and reviews.</p>

        <div className="example-card">
          <h3>Profanity and Spam Filter</h3>
          <p>Detect and filter inappropriate content automatically.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Content Moderation Filter",
  "description": "Filter inappropriate content using keyword detection and pattern matching",
  "conditions": [
    {
      "field": "content.text",
      "operator": "exists",
      "value": true
    }
  ],
  "actions": [
    {
      "type": "invoke",
      "function": "checkProfanity",
      "parameters": {
        "text": "content.text",
        "threshold": 0.7
      },
      "target": "moderation.profanityCheck"
    },
    {
      "type": "invoke",
      "function": "detectSpam",
      "parameters": {
        "text": "content.text",
        "links": "content.links"
      },
      "target": "moderation.spamCheck"
    },
    {
      "type": "conditional",
      "condition": {
        "operator": "OR",
        "conditions": [
          { "field": "moderation.profanityCheck.score", "operator": "greaterThan", "value": 0.7 },
          { "field": "moderation.spamCheck.isSpam", "operator": "equals", "value": true }
        ]
      },
      "then": [
        { "type": "set", "field": "content.status", "value": "rejected" },
        { "type": "set", "field": "content.moderationRequired", "value": false },
        {
          "type": "set",
          "field": "content.rejectionReason",
          "value": "moderation.profanityCheck.score > 0.7 ? 'Inappropriate language detected' : 'Spam detected'"
        }
      ],
      "else": [
        {
          "type": "conditional",
          "condition": {
            "operator": "OR",
            "conditions": [
              { "field": "moderation.profanityCheck.score", "operator": "greaterThan", "value": 0.3 },
              { "field": "content.links.length", "operator": "greaterThan", "value": 3 }
            ]
          },
          "then": [
            { "type": "set", "field": "content.status", "value": "pending" },
            { "type": "set", "field": "content.moderationRequired", "value": true }
          ],
          "else": [
            { "type": "set", "field": "content.status", "value": "approved" },
            { "type": "set", "field": "content.moderationRequired", "value": false }
          ]
        }
      ]
    }
  ]
}`}</code></pre>
          </div>

          <h4>Test Scenario</h4>
          <div className="code-block">
            <pre><code>{`{
  "content": {
    "text": "Great product! Really helpful for my work. Check out my blog at example.com",
    "links": ["example.com"],
    "author": {
      "id": "user123",
      "reputation": 85
    }
  }
}

// Expected Result:
{
  "content": {
    "status": "approved",
    "moderationRequired": false
  },
  "moderation": {
    "profanityCheck": {
      "score": 0.05,
      "flaggedWords": []
    },
    "spamCheck": {
      "isSpam": false,
      "confidence": 0.1
    }
  }
}`}</code></pre>
          </div>
        </div>

        <div className="example-card">
          <h3>User Reputation Filter</h3>
          <p>Filter content based on user reputation and history.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Reputation-Based Content Filter",
  "description": "Apply different moderation rules based on user reputation",
  "actions": [
    {
      "type": "calculate",
      "field": "user.trustScore",
      "formula": "(user.reputation * 0.4) + (user.verifiedAccount ? 30 : 0) + (user.accountAge > 365 ? 30 : 0)"
    },
    {
      "type": "conditional",
      "condition": { "field": "user.trustScore", "operator": "greaterThan", "value": 80 },
      "then": [
        { "type": "set", "field": "content.autoApprove", "value": true },
        { "type": "set", "field": "content.status", "value": "approved" }
      ],
      "else": [
        {
          "type": "conditional",
          "condition": { "field": "user.trustScore", "operator": "greaterThan", "value": 50 },
          "then": [
            { "type": "set", "field": "content.quickReview", "value": true },
            { "type": "set", "field": "content.status", "value": "pending" }
          ],
          "else": [
            { "type": "set", "field": "content.fullReview", "value": true },
            { "type": "set", "field": "content.status", "value": "pending" },
            { "type": "set", "field": "content.priority", "value": "high" }
          ]
        }
      ]
    }
  ]
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Data Quality Filters</h2>
        <p>Filter and validate data based on quality criteria and completeness.</p>

        <div className="example-card">
          <h3>Complete Profile Filter</h3>
          <p>Filter users based on profile completeness and data quality.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Profile Completeness Filter",
  "description": "Filter users with complete and high-quality profiles",
  "actions": [
    {
      "type": "calculate",
      "field": "profile.completeness",
      "formula": "[
        user.firstName ? 10 : 0,
        user.lastName ? 10 : 0,
        user.email ? 15 : 0,
        user.phone ? 10 : 0,
        user.avatar ? 15 : 0,
        user.bio ? 20 : 0,
        user.location ? 10 : 0,
        user.website ? 10 : 0
      ].reduce((sum, val) => sum + val, 0)"
    },
    {
      "type": "calculate",
      "field": "profile.quality",
      "formula": "[
        user.bio && user.bio.length > 50 ? 20 : 0,
        user.avatar && user.avatar.includes('uploaded') ? 20 : 0,
        user.verifiedEmail ? 30 : 0,
        user.verifiedPhone ? 30 : 0
      ].reduce((sum, val) => sum + val, 0)"
    },
    {
      "type": "calculate",
      "field": "profile.score",
      "formula": "(profile.completeness * 0.5) + (profile.quality * 0.5)"
    },
    {
      "type": "conditional",
      "condition": { "field": "profile.score", "operator": "greaterThanOrEqual", "value": 70 },
      "then": [
        { "type": "set", "field": "profile.badge", "value": "verified" },
        { "type": "set", "field": "profile.featured", "value": true }
      ],
      "else": [
        {
          "type": "conditional",
          "condition": { "field": "profile.score", "operator": "greaterThanOrEqual", "value": 40 },
          "then": [
            { "type": "set", "field": "profile.badge", "value": "active" }
          ],
          "else": [
            { "type": "set", "field": "profile.badge", "value": "basic" },
            { "type": "set", "field": "profile.suggestions", "value": "['Complete your bio', 'Upload a profile picture', 'Verify your email']" }
          ]
        }
      ]
    }
  ]
}`}</code></pre>
          </div>
        </div>

        <div className="example-card">
          <h3>Duplicate Detection Filter</h3>
          <p>Identify and filter duplicate or similar entries.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Duplicate Entry Filter",
  "description": "Detect and handle duplicate entries based on similarity",
  "actions": [
    {
      "type": "invoke",
      "function": "calculateSimilarity",
      "parameters": {
        "entries": "dataset.entries",
        "fields": ["name", "email", "phone"],
        "threshold": 0.8
      },
      "target": "duplicates.analysis"
    },
    {
      "type": "filter",
      "field": "dataset.entries",
      "conditions": [
        {
          "function": "isNotDuplicate",
          "parameters": {
            "entry": "item",
            "duplicateGroups": "duplicates.analysis.groups"
          },
          "operator": "equals",
          "value": true
        }
      ],
      "target": "dataset.unique"
    },
    {
      "type": "set",
      "field": "dataset.duplicatesFound",
      "value": "duplicates.analysis.duplicateCount"
    },
    {
      "type": "set",
      "field": "dataset.uniqueCount",
      "value": "dataset.unique.length"
    }
  ]
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Time-Based Filters</h2>
        <p>Filter data based on time ranges, dates, and temporal patterns.</p>

        <div className="example-card">
          <h3>Activity Period Filter</h3>
          <p>Filter events and activities within specific time periods.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Recent Activity Filter",
  "description": "Filter activities within specified time periods",
  "actions": [
    {
      "type": "calculate",
      "field": "timeRanges.last24h",
      "formula": "new Date(Date.now() - 86400000)"
    },
    {
      "type": "calculate",
      "field": "timeRanges.last7d",
      "formula": "new Date(Date.now() - 604800000)"
    },
    {
      "type": "calculate",
      "field": "timeRanges.last30d",
      "formula": "new Date(Date.now() - 2592000000)"
    },
    {
      "type": "filter",
      "field": "activities",
      "conditions": [
        {
          "field": "activity.timestamp",
          "operator": "greaterThan",
          "value": "filter.timeRange === '24h' ? timeRanges.last24h : filter.timeRange === '7d' ? timeRanges.last7d : timeRanges.last30d"
        },
        {
          "field": "activity.type",
          "operator": "in",
          "value": "filter.activityTypes"
        }
      ],
      "target": "results.filteredActivities"
    },
    {
      "type": "set",
      "field": "results.summary",
      "value": {
        "total": "results.filteredActivities.length",
        "timeRange": "filter.timeRange",
        "types": "filter.activityTypes"
      }
    }
  ]
}`}</code></pre>
          </div>
        </div>

        <div className="example-card">
          <h3>Business Hours Filter</h3>
          <p>Filter requests and activities based on business hours and time zones.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Business Hours Filter",
  "description": "Filter and route based on business hours in user timezone",
  "actions": [
    {
      "type": "invoke",
      "function": "convertToTimezone",
      "parameters": {
        "timestamp": "request.timestamp",
        "timezone": "user.timezone"
      },
      "target": "time.local"
    },
    {
      "type": "calculate",
      "field": "time.isBusinessHours",
      "formula": "time.local.hour >= 9 && time.local.hour < 17 && time.local.dayOfWeek >= 1 && time.local.dayOfWeek <= 5"
    },
    {
      "type": "conditional",
      "condition": { "field": "time.isBusinessHours", "operator": "equals", "value": true },
      "then": [
        { "type": "set", "field": "request.priority", "value": "high" },
        { "type": "set", "field": "request.expectedResponse", "value": "2 hours" },
        { "type": "set", "field": "request.route", "value": "live-support" }
      ],
      "else": [
        { "type": "set", "field": "request.priority", "value": "normal" },
        { "type": "set", "field": "request.expectedResponse", "value": "next business day" },
        { "type": "set", "field": "request.route", "value": "queue" }
      ]
    }
  ]
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Integration Example</h2>
        <p>Complete filtering system combining multiple filter types:</p>

        <div className="code-block">
          <pre><code>{`// Advanced filtering system
const filterEngine = new RuleEngine();

// Load all filter rules
const filterRules = [
  productSearchFilter,
  contentModerationFilter,
  dataQualityFilter,
  timeBasedFilter
];

// Apply filters
const data = {
  products: [ /* product data */ ],
  content: [ /* user content */ ],
  activities: [ /* activity data */ ],
  filter: { /* filter criteria */ }
};

const result = await filterEngine.executeRules(filterRules, data);

// Result contains:
// - Filtered product lists
// - Moderated content
// - Quality-checked data
// - Time-filtered activities
// - Dynamic facets and aggregations`}</code></pre>
        </div>
      </div>

      <div className="docs-navigation">
        <div className="nav-item prev">
          <a href="/docs/examples/ecommerce">
            <span className="nav-label">Previous</span>
            <span className="nav-title">← E-commerce Examples</span>
          </a>
        </div>
        <div className="nav-item next">
          <a href="/docs/examples/validation">
            <span className="nav-label">Next</span>
            <span className="nav-title">Validation Examples →</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export { FilteringExamplesPage };
