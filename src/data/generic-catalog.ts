import type { Role, Workflow } from "@/types/guide";

export type WorkflowWithFunctions = Workflow & { functions?: string[] };
export type RoleWithFunctions = Role & { functions?: string[] };

/** Industry-agnostic workflow templates for non-BSN engagements. */
export const GENERIC_WORKFLOWS: WorkflowWithFunctions[] = [
  {
    id: "order-to-cash",
    name: "Order-to-Cash",
    description: "Quote through billing, fulfillment, and cash collection.",
    typicalSystems: ["ERP", "CRM", "Billing", "Payment portal"],
    seedContext:
      "End-to-end revenue cycle — order intake, fulfillment, invoicing, and collections handoffs.",
    functions: ["sales_support", "customer_service", "finance", "general_ops"],
  },
  {
    id: "quote-to-order",
    name: "Quote-to-Order",
    description: "Pricing, configuration, approval, and order creation.",
    typicalSystems: ["CPQ", "CRM", "ERP"],
    seedContext:
      "Quote accuracy, approval cycles, and incomplete intake drive rework before order release.",
    functions: ["sales_support", "general_ops"],
  },
  {
    id: "customer-issue-resolution",
    name: "Customer Issue Resolution",
    description: "Inbound issues, triage, resolution, and escalation.",
    typicalSystems: ["CRM", "Ticketing", "Knowledge base"],
    seedContext:
      "Reactive case handling, SLA pressure, and handoffs between frontline and specialists.",
    functions: ["customer_service", "sales_support"],
  },
  {
    id: "procure-to-pay",
    name: "Procure-to-Pay",
    description: "Requisition, PO, receipt, and supplier payment.",
    typicalSystems: ["ERP", "Procurement", "AP"],
    seedContext:
      "Vendor onboarding, PO matching, and exception handling in accounts payable.",
    functions: ["supply_chain", "finance"],
  },
  {
    id: "returns-exceptions",
    name: "Returns & Exceptions",
    description: "Returns, credits, replacements, and dispute resolution.",
    typicalSystems: ["CRM", "ERP", "Returns portal"],
    seedContext:
      "Incomplete intake and cross-team coordination slow case resolution.",
    functions: ["customer_service", "sales_support", "finance"],
  },
  {
    id: "billing-collections",
    name: "Billing & Collections",
    description: "Invoicing, cash application, credit holds, and collections.",
    typicalSystems: ["ERP", "Billing", "Collections"],
    seedContext:
      "Credit policy, hold/release rules, and cash application accuracy affect order flow.",
    functions: ["finance"],
  },
  {
    id: "onboarding-activation",
    name: "Onboarding & Activation",
    description: "New customer or employee onboarding through go-live.",
    typicalSystems: ["CRM", "HRIS", "Project tools"],
    seedContext:
      "Incomplete intake and unclear ownership delay activation and time-to-value.",
    functions: ["hr", "customer_service", "general_ops"],
  },
  {
    id: "cross-functional-handoff",
    name: "Cross-Functional Handoffs",
    description: "Work routing between teams, pods, or functions.",
    typicalSystems: ["Ticketing", "Email queues", "Workflow tools"],
    seedContext:
      "Ambiguous ownership and queue routing create wait time and rework.",
    functions: ["general_ops", "sales_support", "customer_service", "it"],
  },
];

export const GENERIC_ROLES: RoleWithFunctions[] = [
  {
    id: "frontline-operator",
    name: "Frontline Operator",
    pod: "Operations",
    description: "Day-to-day execution of core workflow tasks.",
    functions: ["sales_support", "customer_service", "finance", "supply_chain", "general_ops"],
  },
  {
    id: "team-lead",
    name: "Team Lead / Supervisor",
    pod: "Operations",
    description: "Queue management, escalations, quality, staffing.",
    functions: ["sales_support", "customer_service", "finance", "supply_chain", "general_ops"],
  },
  {
    id: "process-owner",
    name: "Process Owner",
    pod: "Operations",
    description: "Accountable for end-to-end process performance.",
    functions: ["general_ops", "sales_support", "customer_service", "supply_chain"],
  },
  {
    id: "finance-sme",
    name: "Finance SME",
    pod: "Finance",
    description: "Billing, credit, AR/AP subject matter expert.",
    functions: ["finance"],
  },
  {
    id: "customer-facing-rep",
    name: "Customer-Facing Rep",
    pod: "Customer",
    description: "Direct customer communication and issue ownership.",
    functions: ["customer_service", "sales_support"],
  },
  {
    id: "it-systems-sme",
    name: "IT / Systems SME",
    pod: "Technology",
    description: "Systems usage, integrations, and workarounds.",
    functions: ["it", "general_ops"],
  },
  {
    id: "hr-ops-sme",
    name: "HR / People Ops SME",
    pod: "HR",
    description: "People processes, onboarding, workforce policies.",
    functions: ["hr"],
  },
  {
    id: "procurement-sme",
    name: "Procurement SME",
    pod: "Supply Chain",
    description: "Vendor management, sourcing, PO processes.",
    functions: ["supply_chain"],
  },
];

export function filterGenericWorkflows(functionId: string): Workflow[] {
  return GENERIC_WORKFLOWS.filter(
    (w) => !w.functions?.length || w.functions.includes(functionId),
  );
}

export function filterGenericRoles(functionId: string): Role[] {
  return GENERIC_ROLES.filter(
    (r) => !r.functions?.length || r.functions.includes(functionId),
  );
}
