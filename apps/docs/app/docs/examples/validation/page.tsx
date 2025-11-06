import React from 'react';
import '../../docs.css';

export const metadata = {
  title: 'Validation Rules Examples - KRule Documentation',
  description: 'Comprehensive validation rule examples including form validation, data integrity checks, and business rule validation',
};

export default function ValidationExamplesPage() {
  return (
    <div className="docs-content">
      <div className="docs-header">
        <h1>Validation Rules Examples</h1>
        <p className="lead">Implement robust validation logic for forms, data integrity, and business rules with comprehensive examples.</p>
      </div>

      <div className="docs-section">
        <h2>Form Validation Rules</h2>
        <p>Create sophisticated form validation rules that handle complex requirements and provide detailed error messages.</p>

        <div className="example-card">
          <h3>User Registration Validation</h3>
          <p>Comprehensive validation for user registration forms with password strength and email verification.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "User Registration Validation",
  "description": "Validate user registration form with comprehensive checks",
  "validations": [
    {
      "field": "email",
      "rules": [
        {
          "type": "required",
          "message": "Email is required"
        },
        {
          "type": "email",
          "message": "Please enter a valid email address"
        },
        {
          "type": "custom",
          "function": "isEmailAvailable",
          "message": "This email is already registered"
        }
      ]
    },
    {
      "field": "password",
      "rules": [
        {
          "type": "required",
          "message": "Password is required"
        },
        {
          "type": "minLength",
          "value": 8,
          "message": "Password must be at least 8 characters"
        },
        {
          "type": "pattern",
          "value": "(?=.*[a-z])(?=.*[A-Z])(?=.*\\\\d)(?=.*[@$!%*?&])",
          "message": "Password must contain uppercase, lowercase, number, and special character"
        }
      ]
    },
    {
      "field": "confirmPassword",
      "rules": [
        {
          "type": "required",
          "message": "Please confirm your password"
        },
        {
          "type": "matches",
          "field": "password",
          "message": "Passwords do not match"
        }
      ]
    },
    {
      "field": "age",
      "rules": [
        {
          "type": "required",
          "message": "Age is required"
        },
        {
          "type": "number",
          "message": "Age must be a number"
        },
        {
          "type": "min",
          "value": 18,
          "message": "You must be at least 18 years old"
        },
        {
          "type": "max",
          "value": 120,
          "message": "Please enter a valid age"
        }
      ]
    },
    {
      "field": "username",
      "rules": [
        {
          "type": "required",
          "message": "Username is required"
        },
        {
          "type": "minLength",
          "value": 3,
          "message": "Username must be at least 3 characters"
        },
        {
          "type": "maxLength",
          "value": 20,
          "message": "Username must not exceed 20 characters"
        },
        {
          "type": "pattern",
          "value": "^[a-zA-Z0-9_]+$",
          "message": "Username can only contain letters, numbers, and underscores"
        },
        {
          "type": "custom",
          "function": "isUsernameAvailable",
          "message": "This username is already taken"
        }
      ]
    },
    {
      "field": "termsAccepted",
      "rules": [
        {
          "type": "equals",
          "value": true,
          "message": "You must accept the terms and conditions"
        }
      ]
    }
  ]
}`}</code></pre>
          </div>

          <h4>Test Data</h4>
          <div className="code-block">
            <pre><code>{`{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "age": 25,
  "username": "john_doe",
  "termsAccepted": true
}

// Expected Result:
{
  "isValid": true,
  "errors": {}
}

// Invalid Example:
{
  "email": "invalid-email",
  "password": "weak",
  "confirmPassword": "different",
  "age": 15,
  "username": "ab",
  "termsAccepted": false
}

// Expected Result:
{
  "isValid": false,
  "errors": {
    "email": ["Please enter a valid email address"],
    "password": [
      "Password must be at least 8 characters",
      "Password must contain uppercase, lowercase, number, and special character"
    ],
    "confirmPassword": ["Passwords do not match"],
    "age": ["You must be at least 18 years old"],
    "username": ["Username must be at least 3 characters"],
    "termsAccepted": ["You must accept the terms and conditions"]
  }
}`}</code></pre>
          </div>
        </div>

        <div className="example-card">
          <h3>Payment Information Validation</h3>
          <p>Validate credit card and payment information with security checks.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Payment Validation",
  "description": "Validate credit card and payment information",
  "validations": [
    {
      "field": "cardNumber",
      "rules": [
        {
          "type": "required",
          "message": "Card number is required"
        },
        {
          "type": "custom",
          "function": "validateLuhn",
          "message": "Invalid card number"
        },
        {
          "type": "pattern",
          "value": "^[0-9]{13,19}$",
          "message": "Card number must be 13-19 digits"
        }
      ]
    },
    {
      "field": "cardholderName",
      "rules": [
        {
          "type": "required",
          "message": "Cardholder name is required"
        },
        {
          "type": "pattern",
          "value": "^[a-zA-Z ]+$",
          "message": "Name can only contain letters and spaces"
        }
      ]
    },
    {
      "field": "expiryMonth",
      "rules": [
        {
          "type": "required",
          "message": "Expiry month is required"
        },
        {
          "type": "number",
          "message": "Month must be a number"
        },
        {
          "type": "min",
          "value": 1,
          "message": "Invalid month"
        },
        {
          "type": "max",
          "value": 12,
          "message": "Invalid month"
        }
      ]
    },
    {
      "field": "expiryYear",
      "rules": [
        {
          "type": "required",
          "message": "Expiry year is required"
        },
        {
          "type": "custom",
          "function": "validateExpiryDate",
          "parameters": {
            "month": "expiryMonth",
            "year": "expiryYear"
          },
          "message": "Card has expired"
        }
      ]
    },
    {
      "field": "cvv",
      "rules": [
        {
          "type": "required",
          "message": "CVV is required"
        },
        {
          "type": "pattern",
          "value": "^[0-9]{3,4}$",
          "message": "CVV must be 3 or 4 digits"
        }
      ]
    },
    {
      "field": "billingZip",
      "rules": [
        {
          "type": "required",
          "message": "Billing ZIP code is required"
        },
        {
          "type": "pattern",
          "value": "^[0-9]{5}(-[0-9]{4})?$",
          "message": "Invalid ZIP code format"
        }
      ]
    }
  ]
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Business Logic Validation</h2>
        <p>Implement complex business rules and constraints for data validation.</p>

        <div className="example-card">
          <h3>Order Validation Rules</h3>
          <p>Validate orders based on inventory, business rules, and customer eligibility.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Order Validation",
  "description": "Validate order against inventory and business rules",
  "validations": [
    {
      "name": "inventory-check",
      "condition": {
        "field": "order.items",
        "operator": "every",
        "function": "checkInventoryAvailable",
        "parameters": {
          "item": "item",
          "warehouse": "order.warehouse"
        }
      },
      "message": "One or more items are out of stock",
      "severity": "error"
    },
    {
      "name": "minimum-order-value",
      "condition": {
        "field": "order.total",
        "operator": "greaterThanOrEqual",
        "value": 10
      },
      "message": "Minimum order value is $10",
      "severity": "error"
    },
    {
      "name": "maximum-order-value",
      "condition": {
        "operator": "OR",
        "conditions": [
          {
            "field": "customer.verified",
            "operator": "equals",
            "value": true
          },
          {
            "field": "order.total",
            "operator": "lessThanOrEqual",
            "value": 1000
          }
        ]
      },
      "message": "Orders over $1000 require account verification",
      "severity": "error"
    },
    {
      "name": "shipping-address-required",
      "condition": {
        "operator": "OR",
        "conditions": [
          {
            "field": "order.deliveryMethod",
            "operator": "equals",
            "value": "pickup"
          },
          {
            "operator": "AND",
            "conditions": [
              { "field": "shipping.address", "operator": "exists", "value": true },
              { "field": "shipping.city", "operator": "exists", "value": true },
              { "field": "shipping.zip", "operator": "exists", "value": true }
            ]
          }
        ]
      },
      "message": "Complete shipping address is required for delivery",
      "severity": "error"
    },
    {
      "name": "restricted-items-check",
      "condition": {
        "operator": "OR",
        "conditions": [
          {
            "field": "order.items",
            "operator": "none",
            "function": "isRestrictedItem"
          },
          {
            "operator": "AND",
            "conditions": [
              { "field": "customer.age", "operator": "greaterThanOrEqual", "value": 21 },
              { "field": "customer.idVerified", "operator": "equals", "value": true }
            ]
          }
        ]
      },
      "message": "Age verification required for restricted items",
      "severity": "error"
    },
    {
      "name": "quantity-limits",
      "condition": {
        "field": "order.items",
        "operator": "every",
        "function": "checkQuantityLimit",
        "parameters": {
          "item": "item",
          "maxPerOrder": "item.maxQuantityPerOrder"
        }
      },
      "message": "Some items exceed maximum quantity per order",
      "severity": "error"
    }
  ]
}`}</code></pre>
          </div>

          <h4>Test Scenario</h4>
          <div className="code-block">
            <pre><code>{`{
  "order": {
    "id": "ORD-001",
    "total": 150.00,
    "warehouse": "WH-01",
    "deliveryMethod": "shipping",
    "items": [
      {
        "productId": "PROD-001",
        "quantity": 2,
        "price": 75.00,
        "maxQuantityPerOrder": 5
      }
    ]
  },
  "customer": {
    "id": "CUST-123",
    "verified": true,
    "age": 30,
    "idVerified": true
  },
  "shipping": {
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94102"
  }
}

// Expected Result:
{
  "isValid": true,
  "errors": [],
  "warnings": []
}`}</code></pre>
          </div>
        </div>

        <div className="example-card">
          <h3>Appointment Booking Validation</h3>
          <p>Validate appointment bookings with time slot availability and business rules.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Appointment Validation",
  "description": "Validate appointment bookings with availability and constraints",
  "validations": [
    {
      "name": "time-slot-available",
      "condition": {
        "function": "isTimeSlotAvailable",
        "parameters": {
          "date": "appointment.date",
          "time": "appointment.time",
          "providerId": "appointment.providerId",
          "duration": "appointment.duration"
        },
        "operator": "equals",
        "value": true
      },
      "message": "Selected time slot is not available",
      "severity": "error"
    },
    {
      "name": "business-hours",
      "condition": {
        "operator": "AND",
        "conditions": [
          {
            "field": "appointment.time",
            "operator": "greaterThanOrEqual",
            "value": "09:00"
          },
          {
            "field": "appointment.time",
            "operator": "lessThanOrEqual",
            "value": "17:00"
          },
          {
            "function": "isWeekday",
            "parameters": { "date": "appointment.date" },
            "operator": "equals",
            "value": true
          }
        ]
      },
      "message": "Appointments only available Monday-Friday, 9 AM - 5 PM",
      "severity": "error"
    },
    {
      "name": "advance-booking",
      "condition": {
        "function": "getDaysDifference",
        "parameters": {
          "from": "today",
          "to": "appointment.date"
        },
        "operator": "greaterThanOrEqual",
        "value": 1
      },
      "message": "Appointments must be booked at least 1 day in advance",
      "severity": "error"
    },
    {
      "name": "max-advance-booking",
      "condition": {
        "function": "getDaysDifference",
        "parameters": {
          "from": "today",
          "to": "appointment.date"
        },
        "operator": "lessThanOrEqual",
        "value": 90
      },
      "message": "Appointments cannot be booked more than 90 days in advance",
      "severity": "error"
    },
    {
      "name": "patient-eligibility",
      "condition": {
        "operator": "AND",
        "conditions": [
          { "field": "patient.active", "operator": "equals", "value": true },
          { "field": "patient.paymentMethod", "operator": "exists", "value": true }
        ]
      },
      "message": "Patient must have active account and valid payment method",
      "severity": "error"
    },
    {
      "name": "cancellation-policy-accepted",
      "condition": {
        "field": "appointment.cancellationPolicyAccepted",
        "operator": "equals",
        "value": true
      },
      "message": "You must accept the cancellation policy",
      "severity": "error"
    }
  ]
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Data Integrity Validation</h2>
        <p>Ensure data consistency and integrity across related entities and fields.</p>

        <div className="example-card">
          <h3>Relational Data Validation</h3>
          <p>Validate data relationships and referential integrity.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Relational Data Validation",
  "description": "Validate data relationships and foreign key constraints",
  "validations": [
    {
      "name": "user-exists",
      "condition": {
        "function": "recordExists",
        "parameters": {
          "table": "users",
          "id": "data.userId"
        },
        "operator": "equals",
        "value": true
      },
      "message": "Referenced user does not exist",
      "severity": "error"
    },
    {
      "name": "category-valid",
      "condition": {
        "function": "isValidCategory",
        "parameters": {
          "categoryId": "data.categoryId",
          "entityType": "data.entityType"
        },
        "operator": "equals",
        "value": true
      },
      "message": "Invalid category for this entity type",
      "severity": "error"
    },
    {
      "name": "parent-child-consistency",
      "condition": {
        "operator": "OR",
        "conditions": [
          {
            "field": "data.parentId",
            "operator": "notExists",
            "value": true
          },
          {
            "operator": "AND",
            "conditions": [
              {
                "function": "recordExists",
                "parameters": {
                  "table": "data.entityType",
                  "id": "data.parentId"
                },
                "operator": "equals",
                "value": true
              },
              {
                "function": "checkCircularReference",
                "parameters": {
                  "entityId": "data.id",
                  "parentId": "data.parentId"
                },
                "operator": "equals",
                "value": false
              }
            ]
          }
        ]
      },
      "message": "Invalid parent reference or circular dependency detected",
      "severity": "error"
    },
    {
      "name": "unique-constraint",
      "condition": {
        "function": "isUnique",
        "parameters": {
          "table": "data.entityType",
          "field": "name",
          "value": "data.name",
          "excludeId": "data.id"
        },
        "operator": "equals",
        "value": true
      },
      "message": "A record with this name already exists",
      "severity": "error"
    }
  ]
}`}</code></pre>
          </div>
        </div>

        <div className="example-card">
          <h3>Data Format Validation</h3>
          <p>Validate data formats, types, and structure.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Data Format Validation",
  "description": "Validate data formats and structure",
  "validations": [
    {
      "field": "phone",
      "rules": [
        {
          "type": "pattern",
          "value": "^\\\\+?[1-9]\\\\d{1,14}$",
          "message": "Invalid phone number format (E.164)"
        }
      ]
    },
    {
      "field": "url",
      "rules": [
        {
          "type": "url",
          "message": "Invalid URL format"
        },
        {
          "type": "custom",
          "function": "isAccessibleUrl",
          "message": "URL is not accessible"
        }
      ]
    },
    {
      "field": "dateOfBirth",
      "rules": [
        {
          "type": "date",
          "message": "Invalid date format"
        },
        {
          "type": "custom",
          "function": "isPastDate",
          "message": "Date of birth must be in the past"
        }
      ]
    },
    {
      "field": "ipAddress",
      "rules": [
        {
          "type": "pattern",
          "value": "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
          "message": "Invalid IPv4 address"
        }
      ]
    },
    {
      "field": "json",
      "rules": [
        {
          "type": "custom",
          "function": "isValidJSON",
          "message": "Invalid JSON format"
        },
        {
          "type": "custom",
          "function": "validateJSONSchema",
          "parameters": {
            "schema": "expectedSchema"
          },
          "message": "JSON does not match expected schema"
        }
      ]
    },
    {
      "field": "currency",
      "rules": [
        {
          "type": "pattern",
          "value": "^[A-Z]{3}$",
          "message": "Currency must be a 3-letter ISO code"
        },
        {
          "type": "custom",
          "function": "isValidCurrencyCode",
          "message": "Invalid currency code"
        }
      ]
    }
  ]
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Async Validation</h2>
        <p>Handle asynchronous validation scenarios like database lookups and API calls.</p>

        <div className="example-card">
          <h3>Remote Validation Rules</h3>
          <p>Validate data against external services and databases.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Async Remote Validation",
  "description": "Validate data with external API calls",
  "validations": [
    {
      "field": "domain",
      "rules": [
        {
          "type": "required",
          "message": "Domain is required"
        },
        {
          "type": "async",
          "function": "checkDomainAvailability",
          "parameters": {
            "domain": "domain"
          },
          "timeout": 5000,
          "message": "Domain is not available",
          "loadingMessage": "Checking domain availability..."
        }
      ]
    },
    {
      "field": "couponCode",
      "rules": [
        {
          "type": "async",
          "function": "validateCoupon",
          "parameters": {
            "code": "couponCode",
            "userId": "userId",
            "cartTotal": "cartTotal"
          },
          "timeout": 3000,
          "message": "Invalid or expired coupon code",
          "loadingMessage": "Validating coupon..."
        }
      ]
    },
    {
      "field": "taxId",
      "rules": [
        {
          "type": "pattern",
          "value": "^[0-9]{2}-[0-9]{7}$",
          "message": "Invalid tax ID format"
        },
        {
          "type": "async",
          "function": "verifyTaxId",
          "parameters": {
            "taxId": "taxId",
            "country": "billingCountry"
          },
          "timeout": 10000,
          "message": "Tax ID could not be verified",
          "loadingMessage": "Verifying tax ID with authorities..."
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
        <p>Complete validation system with error handling and user feedback:</p>

        <div className="code-block">
          <pre><code>{`// Comprehensive validation engine
const validationEngine = new RuleEngine();

// Load all validation rules
const validationRules = [
  userRegistrationValidation,
  paymentValidation,
  orderValidation,
  dataIntegrityValidation
];

// Validate data
const formData = {
  email: "user@example.com",
  password: "SecurePass123!",
  // ... more fields
};

try {
  const result = await validationEngine.validate(validationRules, formData);

  if (result.isValid) {
    // Proceed with form submission
    await submitForm(formData);
  } else {
    // Display errors to user
    displayErrors(result.errors);
  }
} catch (error) {
  // Handle validation errors
  console.error('Validation failed:', error);
}`}</code></pre>
        </div>
      </div>

      <div className="docs-navigation">
        <div className="nav-item prev">
          <a href="/docs/examples/filtering">
            <span className="nav-label">Previous</span>
            <span className="nav-title">← Filtering Examples</span>
          </a>
        </div>
        <div className="nav-item next">
          <a href="/docs/examples/workflow">
            <span className="nav-label">Next</span>
            <span className="nav-title">Workflow Examples →</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export { ValidationExamplesPage };
