import React from 'react';
import '../../docs.css';

export const metadata = {
  title: 'Workflow Rules Examples - KRule Documentation',
  description: 'Real-world workflow automation examples including approval processes, task routing, and state management',
};

export default function WorkflowExamplesPage() {
  return (
    <div className="docs-content">
      <div className="docs-header">
        <h1>Workflow Rules Examples</h1>
        <p className="lead">Automate complex workflows with approval processes, task routing, state transitions, and orchestration patterns.</p>
      </div>

      <div className="docs-section">
        <h2>Approval Workflow Rules</h2>
        <p>Implement multi-level approval processes with dynamic routing and escalation.</p>

        <div className="example-card">
          <h3>Expense Approval Workflow</h3>
          <p>Multi-tier expense approval based on amount, category, and organizational hierarchy.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Expense Approval Workflow",
  "description": "Route expense approvals based on amount and category",
  "conditions": [
    {
      "field": "expense.status",
      "operator": "equals",
      "value": "submitted"
    }
  ],
  "actions": [
    {
      "type": "conditional",
      "condition": { "field": "expense.amount", "operator": "lessThan", "value": 100 },
      "then": [
        { "type": "set", "field": "approval.required", "value": false },
        { "type": "set", "field": "expense.status", "value": "auto-approved" },
        { "type": "set", "field": "expense.approvedBy", "value": "system" },
        { "type": "set", "field": "expense.approvedAt", "value": "new Date()" }
      ],
      "else": [
        {
          "type": "conditional",
          "condition": { "field": "expense.amount", "operator": "lessThan", "value": 1000 },
          "then": [
            { "type": "set", "field": "approval.level", "value": 1 },
            { "type": "set", "field": "approval.requiredApprovers", "value": ["employee.manager"] },
            { "type": "set", "field": "expense.status", "value": "pending-manager" }
          ],
          "else": [
            {
              "type": "conditional",
              "condition": { "field": "expense.amount", "operator": "lessThan", "value": 5000 },
              "then": [
                { "type": "set", "field": "approval.level", "value": 2 },
                { "type": "set", "field": "approval.requiredApprovers", "value": ["employee.manager", "employee.director"] },
                { "type": "set", "field": "expense.status", "value": "pending-director" }
              ],
              "else": [
                { "type": "set", "field": "approval.level", "value": 3 },
                { "type": "set", "field": "approval.requiredApprovers", "value": ["employee.manager", "employee.director", "finance.head"] },
                { "type": "set", "field": "expense.status", "value": "pending-finance" }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "conditional",
      "condition": {
        "operator": "AND",
        "conditions": [
          { "field": "expense.category", "operator": "in", "value": ["travel", "entertainment"] },
          { "field": "expense.amount", "operator": "greaterThan", "value": 500 }
        ]
      },
      "then": [
        {
          "type": "push",
          "field": "approval.requiredApprovers",
          "value": "compliance.officer"
        },
        {
          "type": "set",
          "field": "approval.requiresCompliance",
          "value": true
        }
      ]
    },
    {
      "type": "invoke",
      "function": "sendApprovalNotifications",
      "parameters": {
        "approvers": "approval.requiredApprovers",
        "expense": "expense"
      }
    },
    {
      "type": "set",
      "field": "approval.deadline",
      "value": "new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)"
    }
  ]
}`}</code></pre>
          </div>

          <h4>Test Data</h4>
          <div className="code-block">
            <pre><code>{`{
  "expense": {
    "id": "EXP-001",
    "amount": 2500,
    "category": "travel",
    "description": "Conference travel",
    "status": "submitted",
    "submittedAt": "2024-01-15T10:00:00Z"
  },
  "employee": {
    "id": "EMP-123",
    "name": "John Doe",
    "manager": "MGR-456",
    "director": "DIR-789"
  },
  "compliance": {
    "officer": "COMP-001"
  }
}

// Expected Result:
{
  "expense": {
    "status": "pending-director"
  },
  "approval": {
    "level": 2,
    "requiredApprovers": ["MGR-456", "DIR-789", "COMP-001"],
    "requiresCompliance": true,
    "deadline": "2024-01-18T10:00:00Z"
  }
}`}</code></pre>
          </div>
        </div>

        <div className="example-card">
          <h3>Document Approval with Escalation</h3>
          <p>Time-based escalation for pending approvals with automated reminders.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Approval Escalation Workflow",
  "description": "Escalate approvals based on time and priority",
  "conditions": [
    {
      "field": "document.status",
      "operator": "equals",
      "value": "pending-approval"
    }
  ],
  "actions": [
    {
      "type": "calculate",
      "field": "workflow.daysPending",
      "formula": "Math.floor((new Date() - new Date(document.submittedAt)) / (1000 * 60 * 60 * 24))"
    },
    {
      "type": "conditional",
      "condition": { "field": "workflow.daysPending", "operator": "greaterThanOrEqual", "value": 5 },
      "then": [
        {
          "type": "conditional",
          "condition": { "field": "document.priority", "operator": "equals", "value": "urgent" },
          "then": [
            { "type": "set", "field": "workflow.escalate", "value": true },
            { "type": "set", "field": "workflow.escalateTo", "value": "approver.manager" },
            {
              "type": "invoke",
              "function": "sendEscalationNotification",
              "parameters": {
                "document": "document",
                "escalateTo": "workflow.escalateTo",
                "reason": "Urgent approval pending for 5+ days"
              }
            }
          ]
        }
      ]
    },
    {
      "type": "conditional",
      "condition": { "field": "workflow.daysPending", "operator": "equals", "value": 3 },
      "then": [
        {
          "type": "invoke",
          "function": "sendReminderNotification",
          "parameters": {
            "approver": "document.currentApprover",
            "document": "document"
          }
        }
      ]
    },
    {
      "type": "conditional",
      "condition": { "field": "workflow.daysPending", "operator": "greaterThanOrEqual", "value": 10 },
      "then": [
        { "type": "set", "field": "document.status", "value": "auto-rejected" },
        { "type": "set", "field": "document.rejectionReason", "value": "Approval timeout" },
        {
          "type": "invoke",
          "function": "notifySubmitter",
          "parameters": {
            "document": "document",
            "message": "Document approval timed out after 10 days"
          }
        }
      ]
    }
  ]
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Task Routing Workflows</h2>
        <p>Intelligently route tasks based on workload, expertise, and availability.</p>

        <div className="example-card">
          <h3>Customer Support Ticket Routing</h3>
          <p>Route support tickets based on priority, category, and agent availability.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Support Ticket Routing",
  "description": "Intelligent routing of support tickets to appropriate agents",
  "conditions": [
    {
      "field": "ticket.status",
      "operator": "equals",
      "value": "new"
    }
  ],
  "actions": [
    {
      "type": "invoke",
      "function": "classifyTicket",
      "parameters": {
        "subject": "ticket.subject",
        "description": "ticket.description"
      },
      "target": "ticket.classification"
    },
    {
      "type": "conditional",
      "condition": {
        "operator": "OR",
        "conditions": [
          { "field": "ticket.priority", "operator": "equals", "value": "critical" },
          { "field": "customer.tier", "operator": "equals", "value": "enterprise" }
        ]
      },
      "then": [
        { "type": "set", "field": "routing.priority", "value": "high" },
        { "type": "set", "field": "routing.sla", "value": 1 }
      ],
      "else": [
        {
          "type": "conditional",
          "condition": { "field": "ticket.priority", "operator": "equals", "value": "high" },
          "then": [
            { "type": "set", "field": "routing.priority", "value": "medium" },
            { "type": "set", "field": "routing.sla", "value": 4 }
          ],
          "else": [
            { "type": "set", "field": "routing.priority", "value": "normal" },
            { "type": "set", "field": "routing.sla", "value": 24 }
          ]
        }
      ]
    },
    {
      "type": "invoke",
      "function": "findAvailableAgents",
      "parameters": {
        "category": "ticket.classification.category",
        "priority": "routing.priority",
        "requiredSkills": "ticket.classification.requiredSkills"
      },
      "target": "routing.availableAgents"
    },
    {
      "type": "conditional",
      "condition": { "field": "routing.availableAgents.length", "operator": "greaterThan", "value": 0 },
      "then": [
        {
          "type": "invoke",
          "function": "selectBestAgent",
          "parameters": {
            "agents": "routing.availableAgents",
            "criteria": {
              "workload": 0.4,
              "expertise": 0.3,
              "responseTime": 0.3
            }
          },
          "target": "ticket.assignedTo"
        },
        { "type": "set", "field": "ticket.status", "value": "assigned" },
        { "type": "set", "field": "ticket.assignedAt", "value": "new Date()" },
        {
          "type": "invoke",
          "function": "notifyAgent",
          "parameters": {
            "agentId": "ticket.assignedTo",
            "ticket": "ticket"
          }
        }
      ],
      "else": [
        { "type": "set", "field": "ticket.status", "value": "queued" },
        { "type": "push", "field": "routing.queue", "value": "ticket" },
        {
          "type": "invoke",
          "function": "notifyManagement",
          "parameters": {
            "message": "No available agents for ticket category",
            "ticket": "ticket"
          }
        }
      ]
    },
    {
      "type": "calculate",
      "field": "ticket.dueDate",
      "formula": "new Date(Date.now() + routing.sla * 60 * 60 * 1000)"
    }
  ]
}`}</code></pre>
          </div>

          <h4>Test Scenario</h4>
          <div className="code-block">
            <pre><code>{`{
  "ticket": {
    "id": "TICKET-001",
    "subject": "Cannot access dashboard",
    "description": "Getting 500 error when trying to log in",
    "priority": "high",
    "status": "new",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "customer": {
    "id": "CUST-123",
    "tier": "business",
    "accountManager": "AM-456"
  }
}

// Expected Result:
{
  "ticket": {
    "status": "assigned",
    "assignedTo": "AGENT-789",
    "assignedAt": "2024-01-15T10:00:15Z",
    "dueDate": "2024-01-15T14:00:00Z",
    "classification": {
      "category": "technical",
      "requiredSkills": ["authentication", "debugging"]
    }
  },
  "routing": {
    "priority": "medium",
    "sla": 4
  }
}`}</code></pre>
          </div>
        </div>

        <div className="example-card">
          <h3>Load Balancing Workflow</h3>
          <p>Distribute work evenly across team members based on capacity.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Work Distribution Workflow",
  "description": "Balance workload across team members",
  "actions": [
    {
      "type": "invoke",
      "function": "getTeamWorkload",
      "parameters": {
        "teamId": "task.teamId"
      },
      "target": "team.workload"
    },
    {
      "type": "map",
      "field": "team.workload",
      "transform": {
        "type": "calculate",
        "formula": "{ ...member, availableCapacity: member.maxCapacity - member.currentLoad }"
      },
      "target": "team.availability"
    },
    {
      "type": "sort",
      "field": "team.availability",
      "by": "availableCapacity",
      "order": "desc",
      "target": "team.sortedByAvailability"
    },
    {
      "type": "filter",
      "field": "team.sortedByAvailability",
      "conditions": [
        { "field": "member.availableCapacity", "operator": "greaterThan", "value": 0 },
        { "field": "member.skills", "operator": "includes", "value": "task.requiredSkill" }
      ],
      "target": "team.eligible"
    },
    {
      "type": "conditional",
      "condition": { "field": "team.eligible.length", "operator": "greaterThan", "value": 0 },
      "then": [
        { "type": "set", "field": "task.assignedTo", "value": "team.eligible[0].id" },
        { "type": "set", "field": "task.status", "value": "assigned" },
        {
          "type": "invoke",
          "function": "updateMemberWorkload",
          "parameters": {
            "memberId": "team.eligible[0].id",
            "increment": "task.estimatedEffort"
          }
        }
      ],
      "else": [
        { "type": "set", "field": "task.status", "value": "waiting" },
        { "type": "set", "field": "task.reason", "value": "No team members available with required skills" }
      ]
    }
  ]
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>State Machine Workflows</h2>
        <p>Define complex state transitions with validation and side effects.</p>

        <div className="example-card">
          <h3>Order Fulfillment State Machine</h3>
          <p>Manage order lifecycle from placement to delivery with state validations.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Order Fulfillment Workflow",
  "description": "Manage order state transitions and fulfillment process",
  "states": {
    "placed": {
      "allowedTransitions": ["confirmed", "cancelled"],
      "onEnter": [
        {
          "type": "invoke",
          "function": "reserveInventory",
          "parameters": { "orderId": "order.id" }
        },
        {
          "type": "invoke",
          "function": "sendOrderConfirmationEmail",
          "parameters": { "order": "order" }
        }
      ]
    },
    "confirmed": {
      "allowedTransitions": ["processing", "cancelled"],
      "conditions": [
        {
          "field": "payment.status",
          "operator": "equals",
          "value": "completed",
          "message": "Payment must be completed before confirming order"
        }
      ],
      "onEnter": [
        {
          "type": "invoke",
          "function": "notifyWarehouse",
          "parameters": { "order": "order" }
        }
      ]
    },
    "processing": {
      "allowedTransitions": ["shipped", "cancelled"],
      "conditions": [
        {
          "function": "inventoryAvailable",
          "parameters": { "items": "order.items" },
          "operator": "equals",
          "value": true,
          "message": "Cannot process order - inventory not available"
        }
      ],
      "onEnter": [
        {
          "type": "invoke",
          "function": "pickAndPackOrder",
          "parameters": { "orderId": "order.id" }
        },
        {
          "type": "set",
          "field": "order.processingStartedAt",
          "value": "new Date()"
        }
      ]
    },
    "shipped": {
      "allowedTransitions": ["delivered", "returned"],
      "conditions": [
        {
          "field": "shipping.trackingNumber",
          "operator": "exists",
          "value": true,
          "message": "Tracking number required before marking as shipped"
        }
      ],
      "onEnter": [
        {
          "type": "invoke",
          "function": "sendShippingNotification",
          "parameters": {
            "order": "order",
            "trackingNumber": "shipping.trackingNumber"
          }
        },
        {
          "type": "set",
          "field": "order.shippedAt",
          "value": "new Date()"
        },
        {
          "type": "calculate",
          "field": "order.estimatedDelivery",
          "formula": "new Date(Date.now() + shipping.estimatedDays * 24 * 60 * 60 * 1000)"
        }
      ]
    },
    "delivered": {
      "allowedTransitions": ["returned", "completed"],
      "onEnter": [
        {
          "type": "invoke",
          "function": "sendDeliveryConfirmation",
          "parameters": { "order": "order" }
        },
        {
          "type": "set",
          "field": "order.deliveredAt",
          "value": "new Date()"
        },
        {
          "type": "invoke",
          "function": "scheduleReviewRequest",
          "parameters": {
            "orderId": "order.id",
            "delayDays": 3
          }
        }
      ],
      "autoTransition": {
        "to": "completed",
        "after": 7,
        "unit": "days",
        "unless": {
          "field": "order.disputeRaised",
          "operator": "equals",
          "value": true
        }
      }
    },
    "completed": {
      "allowedTransitions": ["returned"],
      "onEnter": [
        {
          "type": "invoke",
          "function": "releasePaymentToVendor",
          "parameters": { "orderId": "order.id" }
        },
        {
          "type": "invoke",
          "function": "awardLoyaltyPoints",
          "parameters": {
            "customerId": "order.customerId",
            "orderTotal": "order.total"
          }
        }
      ]
    },
    "cancelled": {
      "allowedTransitions": [],
      "onEnter": [
        {
          "type": "invoke",
          "function": "releaseInventoryReservation",
          "parameters": { "orderId": "order.id" }
        },
        {
          "type": "invoke",
          "function": "processRefund",
          "parameters": {
            "orderId": "order.id",
            "amount": "payment.amount"
          }
        },
        {
          "type": "invoke",
          "function": "sendCancellationEmail",
          "parameters": { "order": "order" }
        }
      ]
    },
    "returned": {
      "allowedTransitions": [],
      "conditions": [
        {
          "function": "isWithinReturnWindow",
          "parameters": {
            "deliveredAt": "order.deliveredAt",
            "returnWindowDays": 30
          },
          "operator": "equals",
          "value": true,
          "message": "Return window has expired"
        }
      ],
      "onEnter": [
        {
          "type": "invoke",
          "function": "processReturn",
          "parameters": { "orderId": "order.id" }
        }
      ]
    }
  }
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Orchestration Workflows</h2>
        <p>Coordinate multiple services and systems in complex business processes.</p>

        <div className="example-card">
          <h3>Employee Onboarding Workflow</h3>
          <p>Orchestrate multi-step onboarding process across different departments.</p>

          <div className="code-block">
            <pre><code>{`{
  "name": "Employee Onboarding Workflow",
  "description": "Coordinate employee onboarding across multiple systems",
  "stages": [
    {
      "name": "pre-onboarding",
      "tasks": [
        {
          "name": "create-employee-record",
          "service": "hrms",
          "action": "createEmployee",
          "input": {
            "firstName": "employee.firstName",
            "lastName": "employee.lastName",
            "email": "employee.email",
            "department": "employee.department",
            "startDate": "employee.startDate"
          },
          "output": "employee.hrmsId"
        },
        {
          "name": "generate-credentials",
          "service": "identity",
          "action": "createUser",
          "input": {
            "email": "employee.email",
            "name": "employee.fullName",
            "role": "employee.role"
          },
          "output": "employee.credentials",
          "dependsOn": ["create-employee-record"]
        },
        {
          "name": "send-welcome-email",
          "service": "email",
          "action": "sendTemplate",
          "input": {
            "to": "employee.email",
            "template": "welcome",
            "data": {
              "name": "employee.firstName",
              "startDate": "employee.startDate",
              "credentials": "employee.credentials"
            }
          },
          "dependsOn": ["generate-credentials"]
        }
      ]
    },
    {
      "name": "first-day-setup",
      "triggerOn": "employee.startDate",
      "tasks": [
        {
          "name": "provision-equipment",
          "service": "it",
          "action": "assignEquipment",
          "input": {
            "employeeId": "employee.hrmsId",
            "equipment": ["laptop", "monitor", "keyboard", "mouse"]
          }
        },
        {
          "name": "setup-workspace",
          "service": "facilities",
          "action": "assignDesk",
          "input": {
            "employeeId": "employee.hrmsId",
            "department": "employee.department",
            "preferences": "employee.workspacePreferences"
          }
        },
        {
          "name": "grant-system-access",
          "service": "identity",
          "action": "grantAccess",
          "input": {
            "userId": "employee.credentials.userId",
            "groups": "employee.requiredGroups",
            "applications": "employee.requiredApplications"
          }
        }
      ]
    },
    {
      "name": "orientation",
      "tasks": [
        {
          "name": "schedule-orientation",
          "service": "calendar",
          "action": "createEvent",
          "input": {
            "attendees": ["employee.email", "employee.manager"],
            "title": "New Employee Orientation",
            "duration": 120,
            "date": "employee.startDate"
          }
        },
        {
          "name": "assign-mentor",
          "service": "hrms",
          "action": "assignMentor",
          "input": {
            "employeeId": "employee.hrmsId",
            "department": "employee.department"
          },
          "output": "employee.mentor"
        },
        {
          "name": "enroll-training",
          "service": "lms",
          "action": "enrollCourses",
          "input": {
            "userId": "employee.credentials.userId",
            "courses": "employee.requiredTraining"
          }
        }
      ]
    },
    {
      "name": "follow-up",
      "triggerAfter": {
        "value": 7,
        "unit": "days",
        "from": "employee.startDate"
      },
      "tasks": [
        {
          "name": "check-completion",
          "service": "hrms",
          "action": "getOnboardingStatus",
          "input": {
            "employeeId": "employee.hrmsId"
          },
          "output": "onboarding.status"
        },
        {
          "name": "send-feedback-survey",
          "service": "survey",
          "action": "sendSurvey",
          "input": {
            "recipient": "employee.email",
            "template": "onboarding-feedback"
          },
          "conditions": [
            {
              "field": "onboarding.status.completionRate",
              "operator": "greaterThan",
              "value": 75
            }
          ]
        }
      ]
    }
  ],
  "errorHandling": {
    "onFailure": {
      "notify": ["hr.team", "it.team"],
      "createTicket": true,
      "rollbackActions": true
    },
    "retry": {
      "maxAttempts": 3,
      "backoff": "exponential"
    }
  }
}`}</code></pre>
          </div>
        </div>
      </div>

      <div className="docs-section">
        <h2>Integration Example</h2>
        <p>Complete workflow orchestration system with monitoring:</p>

        <div className="code-block">
          <pre><code>{`// Workflow orchestration engine
const workflowEngine = new RuleEngine();

// Load workflow definitions
const workflows = [
  expenseApprovalWorkflow,
  ticketRoutingWorkflow,
  orderFulfillmentWorkflow,
  onboardingWorkflow
];

// Execute workflow
const workflowData = {
  type: "expense-approval",
  expense: { /* expense data */ },
  employee: { /* employee data */ }
};

// Start workflow execution
const execution = await workflowEngine.executeWorkflow(
  workflows.find(w => w.name === workflowData.type),
  workflowData
);

// Monitor workflow progress
workflowEngine.on('state-change', (state) => {
  console.log('Workflow state:', state);
});

workflowEngine.on('task-complete', (task) => {
  console.log('Task completed:', task);
});

workflowEngine.on('error', (error) => {
  console.error('Workflow error:', error);
  // Handle error, retry, or rollback
});

// Wait for completion
const result = await execution.wait();
console.log('Workflow completed:', result);`}</code></pre>
        </div>
      </div>

      <div className="docs-navigation">
        <div className="nav-item prev">
          <a href="/docs/examples/validation">
            <span className="nav-label">Previous</span>
            <span className="nav-title">← Validation Examples</span>
          </a>
        </div>
        <div className="nav-item next">
          <a href="/docs/api-reference">
            <span className="nav-label">Next</span>
            <span className="nav-title">API Reference →</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export { WorkflowExamplesPage };
