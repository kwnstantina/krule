import React from 'react';
import '../../docs.css';

export const metadata = {
  title: 'E-commerce Rules Examples - KRule Documentation',
  description: 'Real-world e-commerce rule examples including pricing, discounts, shipping, and inventory management',
};

export default function EcommerceExamplesPage() {
  return (
    <div className="docs-content">
      <div className="docs-header">
        <h1>E-commerce Rules Examples</h1>
        <p className="lead">Discover practical e-commerce rule implementations for pricing, promotions, shipping, and customer management.</p>
      </div>

      <div className="docs-section">
        <h2>Dynamic Pricing Rules</h2>
        <p>Implement sophisticated pricing strategies that respond to market conditions, inventory levels, and customer behavior.</p>
        
        <div className="example-card">
          <h3>Demand-Based Pricing</h3>
          <p>Adjust prices based on demand, inventory levels, and competitor pricing.</p>
          
          <div className="code-block">
            <pre><code>{`{
  "name": "Dynamic Pricing - High Demand",
  "description": "Increase price when demand is high and inventory is low",
  "priority": 100,
  "conditions": [
    {
      "field": "product.viewsLast24h",
      "operator": "greaterThan",
      "value": 1000
    },
    {
      "field": "inventory.available",
      "operator": "lessThan",
      "value": 10
    },
    {
      "field": "competitor.averagePrice",
      "operator": "greaterThan",
      "value": "product.basePrice * 0.9"
    }
  ],
  "actions": [
    {
      "type": "calculate",
      "field": "price.dynamic",
      "formula": "Math.min(product.basePrice * 1.2, competitor.averagePrice * 0.95)"
    },
    {
      "type": "set",
      "field": "price.reason",
      "value": "High demand, low inventory"
    },
    {
      "type": "set",
      "field": "price.validUntil",
      "value": "new Date(Date.now() + 3600000)" // 1 hour
    }
  ]
}`}</code></pre>
          </div>

          <h4>Test Data</h4>
          <div className="code-block">
            <pre><code>{`{
  "product": {
    "id": "LAPTOP-001",
    "name": "Gaming Laptop Pro",
    "basePrice": 1200,
    "viewsLast24h": 1250,
    "category": "electronics"
  },
  "inventory": {
    "available": 8,
    "reserved": 2,
    "incoming": 50
  },
  "competitor": {
    "averagePrice": 1180,
    "lowestPrice": 1150,
    "highestPrice": 1299
  }
}

// Expected Result:
{
  "price": {
    "dynamic": 1121,  // min(1200 * 1.2, 1180 * 0.95)
    "reason": "High demand, low inventory",
    "validUntil": "2024-01-15T11:30:00Z"
  }
}`}</code></pre>
          </div>
        </div>

        <div className="example-card">
          <h3>Customer Tier Pricing</h3>
          <p>Offer different prices based on customer loyalty tier and purchase history.</p>
          
          <div className="code-block">
            <pre><code>{`{
  "name": "Customer Tier Pricing",
  "description": "Apply tiered pricing based on customer status and loyalty",
  "conditions": [
    {
      "operator": "OR",
      "conditions": [
        { "field": "customer.tier", "operator": "equals", "value": "platinum" },
        { "field": "customer.tier", "operator": "equals", "value": "gold" },
        { "field": "customer.tier", "operator": "equals", "value": "silver" }
      ]
    }
  ],
  "actions": [
    {
      "type": "conditional",
      "condition": { "field": "customer.tier", "operator": "equals", "value": "platinum" },
      "then": [
        { "type": "calculate", "field": "price.tier", "formula": "product.basePrice * 0.85" }
      ],
      "else": [
        {
          "type": "conditional",
          "condition": { "field": "customer.tier", "operator": "equals", "value": "gold" },
          "then": [
            { "type": "calculate", "field": "price.tier", "formula": "product.basePrice * 0.90" }
          ],
          "else": [
            { "type": "calculate", "field": "price.tier", "formula": "product.basePrice * 0.95" }
          ]
        }
      ]
    },
    {
      "type": "set",
      "field": "discount.type",
      "value": "tier-pricing"
    }
  ]
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Promotion and Discount Rules</h2>
        <p>Create sophisticated promotion rules that can handle complex eligibility criteria and multiple discount types.</p>
        
        <div className="example-card">
          <h3>Buy X Get Y Free</h3>
          <p>Implement "Buy 2 Get 1 Free" and similar promotional offers.</p>
          
          <div className="code-block">
            <pre><code>{`{
  "name": "Buy 2 Get 1 Free - Electronics",
  "description": "Customer gets the lowest priced item free when buying 3+ electronics",
  "conditions": [
    {
      "field": "cart.items",
      "operator": "hasLength",
      "value": { "min": 3 }
    },
    {
      "function": "countItemsByCategory",
      "field": "cart.items",
      "parameters": { "category": "electronics" },
      "operator": "greaterThanOrEqual",
      "value": 3
    }
  ],
  "actions": [
    {
      "type": "invoke",
      "function": "calculateBuyXGetYDiscount",
      "parameters": {
        "buyQuantity": 2,
        "getQuantity": 1,
        "category": "electronics",
        "applyToLowestPrice": true
      },
      "target": "promotion.discount"
    },
    {
      "type": "set",
      "field": "promotion.type",
      "value": "buy-2-get-1-free"
    },
    {
      "type": "set",
      "field": "promotion.description",
      "value": "Buy 2 electronics, get 1 free!"
    }
  ]
}`}</code></pre>
          </div>
        </div>

        <div className="example-card">
          <h3>Seasonal Sale</h3>
          <p>Time-based promotions with category-specific discounts.</p>
          
          <div className="code-block">
            <pre><code>{`{
  "name": "Black Friday Sale",
  "description": "Black Friday discounts with category-specific rates",
  "conditions": [
    {
      "field": "current.date",
      "operator": "isBetween",
      "value": {
        "start": "2024-11-29T00:00:00Z",
        "end": "2024-12-02T23:59:59Z"
      }
    },
    {
      "field": "cart.total",
      "operator": "greaterThan",
      "value": 50
    }
  ],
  "actions": [
    {
      "type": "iterate",
      "field": "cart.items",
      "actions": [
        {
          "type": "conditional",
          "condition": { "field": "item.category", "operator": "equals", "value": "electronics" },
          "then": [
            { "type": "calculate", "field": "item.discount", "formula": "item.price * 0.30" }
          ]
        },
        {
          "type": "conditional", 
          "condition": { "field": "item.category", "operator": "equals", "value": "clothing" },
          "then": [
            { "type": "calculate", "field": "item.discount", "formula": "item.price * 0.25" }
          ]
        },
        {
          "type": "conditional",
          "condition": { "field": "item.category", "operator": "equals", "value": "books" },
          "then": [
            { "type": "calculate", "field": "item.discount", "formula": "item.price * 0.15" }
          ]
        }
      ]
    },
    {
      "type": "calculate",
      "field": "promotion.totalDiscount",
      "formula": "cart.items.reduce((sum, item) => sum + (item.discount || 0), 0)"
    }
  ]
}`}</code></pre>
          </div>
        </div>

        <div className="example-card">
          <h3>Loyalty Points Multiplier</h3>
          <p>Bonus points for specific purchase patterns.</p>
          
          <div className="code-block">
            <pre><code>{`{
  "name": "Weekend Loyalty Bonus",
  "description": "2x points on weekends for premium members",
  "conditions": [
    {
      "field": "current.dayOfWeek",
      "operator": "in",
      "value": ["saturday", "sunday"]
    },
    {
      "field": "customer.membershipLevel",
      "operator": "in", 
      "value": ["premium", "platinum"]
    }
  ],
  "actions": [
    {
      "type": "calculate",
      "field": "loyalty.basePoints",
      "formula": "Math.floor(cart.total)"
    },
    {
      "type": "calculate",
      "field": "loyalty.bonusPoints", 
      "formula": "loyalty.basePoints"
    },
    {
      "type": "calculate",
      "field": "loyalty.totalPoints",
      "formula": "loyalty.basePoints + loyalty.bonusPoints"
    },
    {
      "type": "set",
      "field": "loyalty.reason",
      "value": "Weekend 2x points promotion"
    }
  ]
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Shipping Rules</h2>
        <p>Implement complex shipping logic based on weight, destination, order value, and customer status.</p>
        
        <div className="example-card">
          <h3>Smart Shipping Calculator</h3>
          <p>Calculate shipping costs with multiple factors and free shipping thresholds.</p>
          
          <div className="code-block">
            <pre><code>{`{
  "name": "Smart Shipping Calculator",
  "description": "Calculate shipping based on weight, distance, and customer tier",
  "conditions": [
    {
      "field": "cart.requiresShipping",
      "operator": "equals",
      "value": true
    }
  ],
  "actions": [
    // Base shipping calculation
    {
      "type": "calculate",
      "field": "shipping.baseRate",
      "formula": "shipping.zones[delivery.zone].baseRate"
    },
    {
      "type": "calculate",
      "field": "shipping.weightCharge",
      "formula": "Math.max(0, (cart.totalWeight - 1) * shipping.perKgRate)"
    },
    
    // Distance modifier
    {
      "type": "conditional",
      "condition": { "field": "delivery.distance", "operator": "greaterThan", "value": 500 },
      "then": [
        { "type": "calculate", "field": "shipping.distanceModifier", "formula": "shipping.baseRate * 0.5" }
      ],
      "else": [
        { "type": "set", "field": "shipping.distanceModifier", "value": 0 }
      ]
    },
    
    // Customer tier discount
    {
      "type": "conditional",
      "condition": { "field": "customer.tier", "operator": "equals", "value": "platinum" },
      "then": [
        { "type": "set", "field": "shipping.tierDiscount", "value": "shipping.baseRate * 0.5" }
      ],
      "else": [
        {
          "type": "conditional",
          "condition": { "field": "customer.tier", "operator": "equals", "value": "gold" },
          "then": [
            { "type": "set", "field": "shipping.tierDiscount", "value": "shipping.baseRate * 0.25" }
          ],
          "else": [
            { "type": "set", "field": "shipping.tierDiscount", "value": 0 }
          ]
        }
      ]
    },
    
    // Free shipping threshold
    {
      "type": "conditional",
      "condition": { "field": "cart.total", "operator": "greaterThanOrEqual", "value": 100 },
      "then": [
        { "type": "set", "field": "shipping.total", "value": 0 },
        { "type": "set", "field": "shipping.reason", "value": "Free shipping on orders over $100" }
      ],
      "else": [
        {
          "type": "calculate",
          "field": "shipping.total",
          "formula": "Math.max(0, shipping.baseRate + shipping.weightCharge + shipping.distanceModifier - shipping.tierDiscount)"
        }
      ]
    }
  ]
}`}</code></pre>
          </div>

          <h4>Test Scenario</h4>
          <div className="code-block">
            <pre><code>{`{
  "cart": {
    "total": 85.00,
    "totalWeight": 2.5,
    "requiresShipping": true
  },
  "delivery": {
    "zone": "domestic",
    "distance": 300,
    "address": {
      "country": "US",
      "state": "CA",
      "city": "San Francisco"
    }
  },
  "customer": {
    "tier": "gold"
  },
  "shipping": {
    "zones": {
      "domestic": { "baseRate": 12.99 }
    },
    "perKgRate": 3.50
  }
}

// Expected Result:
{
  "shipping": {
    "baseRate": 12.99,
    "weightCharge": 5.25,  // (2.5 - 1) * 3.50
    "distanceModifier": 0,
    "tierDiscount": 3.25,  // 12.99 * 0.25
    "total": 15.00,        // 12.99 + 5.25 + 0 - 3.25
    "reason": null
  }
}`}</code></pre>
          </div>
        </div>

        <div className="example-card">
          <h3>Express Shipping Eligibility</h3>
          <p>Determine express shipping availability based on location and inventory.</p>
          
          <div className="code-block">
            <pre><code>{`{
  "name": "Express Shipping Eligibility",
  "description": "Check if express shipping is available for this order",
  "conditions": [
    {
      "field": "current.time",
      "operator": "isBefore",
      "value": "15:00"  // 3 PM cutoff
    },
    {
      "field": "current.dayOfWeek",
      "operator": "notIn",
      "value": ["saturday", "sunday"]
    }
  ],
  "actions": [
    {
      "type": "invoke",
      "function": "checkInventoryAvailability",
      "parameters": {
        "items": "cart.items",
        "warehouse": "delivery.nearestWarehouse"
      },
      "target": "express.inventoryCheck"
    },
    {
      "type": "conditional",
      "condition": { "field": "express.inventoryCheck.allAvailable", "operator": "equals", "value": true },
      "then": [
        {
          "type": "conditional",
          "condition": { "field": "delivery.zone", "operator": "in", "value": ["metro", "urban"] },
          "then": [
            { "type": "set", "field": "express.available", "value": true },
            { "type": "set", "field": "express.deliveryDate", "value": "tomorrow" },
            { "type": "calculate", "field": "express.cost", "formula": "shipping.total * 2.5" }
          ],
          "else": [
            { "type": "set", "field": "express.available", "value": false },
            { "type": "set", "field": "express.reason", "value": "Express shipping not available in this area" }
          ]
        }
      ],
      "else": [
        { "type": "set", "field": "express.available", "value": false },
        { "type": "set", "field": "express.reason", "value": "Some items not available for express delivery" }
      ]
    }
  ]
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Inventory Management Rules</h2>
        <p>Automate inventory decisions including restocking, allocation, and availability checks.</p>
        
        <div className="example-card">
          <h3>Automatic Reorder Point</h3>
          <p>Trigger purchase orders when inventory falls below optimal levels.</p>
          
          <div className="code-block">
            <pre><code>{`{
  "name": "Auto Reorder - High Velocity Items",
  "description": "Automatically reorder high-selling items when stock is low",
  "conditions": [
    {
      "field": "inventory.available",
      "operator": "lessThanOrEqual",
      "value": "inventory.reorderPoint"
    },
    {
      "field": "product.velocityCategory",
      "operator": "in",
      "value": ["fast", "very-fast"]
    },
    {
      "field": "supplier.available",
      "operator": "equals",
      "value": true
    }
  ],
  "actions": [
    {
      "type": "calculate",
      "field": "reorder.leadTimeDemand",
      "formula": "product.averageDailyDemand * supplier.leadTimeDays"
    },
    {
      "type": "calculate",
      "field": "reorder.safetyStock",
      "formula": "reorder.leadTimeDemand * 0.5"
    },
    {
      "type": "calculate",
      "field": "reorder.quantity",
      "formula": "Math.max(product.economicOrderQuantity, reorder.leadTimeDemand + reorder.safetyStock - inventory.available)"
    },
    {
      "type": "invoke",
      "function": "createPurchaseOrder",
      "parameters": {
        "productId": "product.id",
        "quantity": "reorder.quantity",
        "supplierId": "supplier.id",
        "priority": "high"
      },
      "target": "reorder.purchaseOrder"
    },
    {
      "type": "set",
      "field": "inventory.status",
      "value": "reorder-pending"
    }
  ]
}`}</code></pre>
          </div>
        </div>

        <div className="example-card">
          <h3>Stock Allocation Priority</h3>
          <p>Prioritize inventory allocation for different customer tiers and order types.</p>
          
          <div className="code-block">
            <pre><code>{`{
  "name": "VIP Stock Allocation",
  "description": "Reserve inventory for VIP customers and urgent orders",
  "conditions": [
    {
      "field": "inventory.available",
      "operator": "lessThan",
      "value": "order.requestedQuantity"
    },
    {
      "field": "inventory.available",
      "operator": "greaterThan",
      "value": 0
    }
  ],
  "actions": [
    {
      "type": "invoke",
      "function": "calculateAllocationPriority",
      "parameters": {
        "customerTier": "customer.tier",
        "orderType": "order.type",
        "orderValue": "order.total"
      },
      "target": "allocation.priority"
    },
    {
      "type": "conditional",
      "condition": { "field": "allocation.priority", "operator": "greaterThan", "value": 80 },
      "then": [
        {
          "type": "calculate",
          "field": "allocation.quantity",
          "formula": "Math.min(order.requestedQuantity, inventory.available)"
        },
        { "type": "set", "field": "allocation.approved", "value": true }
      ],
      "else": [
        {
          "type": "conditional",
          "condition": { "field": "inventory.available", "operator": "greaterThanOrEqual", "value": "order.requestedQuantity * 0.8" },
          "then": [
            { "type": "calculate", "field": "allocation.quantity", "formula": "inventory.available" },
            { "type": "set", "field": "allocation.partial", "value": true }
          ],
          "else": [
            { "type": "set", "field": "allocation.waitlist", "value": true },
            { "type": "set", "field": "allocation.estimatedAvailability", "value": "inventory.nextDeliveryDate" }
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
        <h2>Customer Segmentation Rules</h2>
        <p>Automatically categorize customers based on behavior, purchase history, and engagement.</p>
        
        <div className="example-card">
          <h3>Customer Lifetime Value Segmentation</h3>
          <p>Segment customers into tiers based on their value and engagement.</p>
          
          <div className="code-block">
            <pre><code>{`{
  "name": "Customer Value Segmentation",
  "description": "Automatically assign customer tiers based on lifetime value and engagement",
  "conditions": [
    {
      "field": "customer.totalPurchases",
      "operator": "greaterThan",
      "value": 0
    }
  ],
  "actions": [
    // Calculate engagement score
    {
      "type": "calculate",
      "field": "metrics.engagementScore",
      "formula": "(customer.loginFrequency * 0.3) + (customer.emailOpenRate * 100 * 0.2) + (customer.reviewCount * 5 * 0.3) + (customer.referralCount * 10 * 0.2)"
    },
    
    // Determine tier based on LTV and engagement
    {
      "type": "conditional",
      "condition": {
        "operator": "AND",
        "conditions": [
          { "field": "customer.lifetimeValue", "operator": "greaterThan", "value": 5000 },
          { "field": "metrics.engagementScore", "operator": "greaterThan", "value": 80 }
        ]
      },
      "then": [
        { "type": "set", "field": "customer.tier", "value": "platinum" },
        { "type": "set", "field": "customer.benefits", "value": ["free-shipping", "priority-support", "exclusive-access", "15%-discount"] }
      ],
      "else": [
        {
          "type": "conditional",
          "condition": {
            "operator": "AND", 
            "conditions": [
              { "field": "customer.lifetimeValue", "operator": "greaterThan", "value": 2000 },
              { "field": "metrics.engagementScore", "operator": "greaterThan", "value": 60 }
            ]
          },
          "then": [
            { "type": "set", "field": "customer.tier", "value": "gold" },
            { "type": "set", "field": "customer.benefits", "value": ["free-shipping", "priority-support", "10%-discount"] }
          ],
          "else": [
            {
              "type": "conditional",
              "condition": {
                "operator": "OR",
                "conditions": [
                  { "field": "customer.lifetimeValue", "operator": "greaterThan", "value": 500 },
                  { "field": "metrics.engagementScore", "operator": "greaterThan", "value": 40 }
                ]
              },
              "then": [
                { "type": "set", "field": "customer.tier", "value": "silver" },
                { "type": "set", "field": "customer.benefits", "value": ["5%-discount"] }
              ],
              "else": [
                { "type": "set", "field": "customer.tier", "value": "bronze" }
              ]
            }
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
        <h2>Integration Example</h2>
        <p>Complete e-commerce checkout flow combining multiple rule types:</p>
        
        <div className="code-block">
          <pre><code>{`// Complete checkout processing
const checkoutEngine = new RuleEngine();

// Load all e-commerce rules
const rules = [
  customerSegmentationRule,
  dynamicPricingRule, 
  promotionRules,
  shippingRules,
  inventoryRules,
  loyaltyPointsRule
];

// Process checkout
const checkoutData = {
  customer: { /* customer data */ },
  cart: { /* cart data */ },
  delivery: { /* delivery preferences */ }
};

const result = await checkoutEngine.executeRules(rules, checkoutData);

// Result contains:
// - Updated pricing
// - Applied promotions  
// - Shipping calculations
// - Inventory allocations
// - Loyalty points
// - Customer tier updates`}</code></pre>
        </div>
      </div>

      <div className="docs-navigation">
        <div className="nav-item prev">
          <a href="/docs/rule-testing">
            <span className="nav-label">Previous</span>
            <span className="nav-title">← Rule Testing</span>
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

export { EcommerceExamplesPage };