import type { Role, Workflow } from "@/types/guide";

export const BSN_WORKFLOWS: Workflow[] = [
  {
    id: "nsp-handling",
    name: "NSP (Non-Standard Product) Handling",
    description: "Known SKU projects, vendor setup, cost validation, and PO alignment for non-standard products.",
    typicalSystems: ["SAP", "ME57", "ME58", "Engage", "QOE"],
    seedContext:
      "NSP involves Purchasing validating vendor numbers, attachments, cost sheets, and invoice alignment. Pain points include ME57/ME58 rework and feedback loops between Purchasing and TM/FSP.",
  },
  {
    id: "order-visibility",
    name: "Order Visibility & Tracking",
    description: "End-to-end order status from placement through decorator, vendor, and customer delivery.",
    typicalSystems: ["Engage", "SAP", "Vendor portals", "QOE", "Decorator dashboards"],
    seedContext:
      "SSRs and Customer Care field WISMO requests. Follow-up cadence across Engage, SAP, vendor portals, decorator status, PWO updates, and proactive backorder management.",
  },
  {
    id: "mts-shop-build",
    name: "MTS Shop Build & Launch",
    description: "My Team Shop intake, build in TAL/QOE, artwork, inventory selection, and shop go-live.",
    typicalSystems: ["TAL", "QOE", "VOE", "Engage", "MTS Build Pod queue"],
    seedContext:
      "~25% incomplete intake forms; 20-25% shops never go live. Time split across item selection, inventory filtering, artwork. Shops rebuilt as Traditional when MTS+ requirements emerge late.",
  },
  {
    id: "tm-quotes-carts",
    name: "TM Quote & Cart Creation",
    description: "Territory Manager hard goods quotes, stock checks, and QOE/VOE cart builds for FSP handoff.",
    typicalSystems: ["QOE", "VOE", "BSN Vault", "Engage"],
    seedContext:
      "TM creates carts when FSP provides SKUs/sizes; incomplete front-end info drives rework and 48-hour ticket closures.",
  },
  {
    id: "ssr-order-management",
    name: "SSR Order Management",
    description: "Holds, PO corrections, MTS changes, open order follow-up, and vendor coordination.",
    typicalSystems: ["Engage", "SAP", "QOE", "Wizard"],
    seedContext:
      "SSRs spend significant time on reactive status tracking, MTS consolidations, and live order changes.",
  },
  {
    id: "returns-replacements",
    name: "Returns & Replacements",
    description: "R&R case intake, vendor RA, replacement orders, credit memos, and customer communication.",
    typicalSystems: ["Engage", "CRM", "Returns queue email"],
    seedContext:
      "Incomplete email intake slows cases. R&R works directly with customers and coordinates with SSR on credits.",
  },
  {
    id: "comp-promo",
    name: "Comp & Promo Orders",
    description: "Nike coupon, UA promo/CTU, and 4R rewards order processing.",
    typicalSystems: ["QOE", "Engage", "Comp Pod queue"],
    seedContext:
      "Promo inventory differs from retail stock. Separate queue from standard order flow.",
  },
  {
    id: "fin-ar-credit",
    name: "AR, Credit & Order Release",
    description: "Cash application, credit holds, quick release, and order release workflows.",
    typicalSystems: ["Engage", "SAP", "Billing", "Credit dept queue"],
    seedContext:
      "Multiple Fin Serv queues with strict routing rules. Order release vs credit apps vs quick release.",
  },
  {
    id: "customer-care",
    name: "Customer Care Issue Resolution",
    description: "Sizing, cancellations, website support, refunds, and general customer inquiries.",
    typicalSystems: ["Engage", "Website", "Customer Care queue"],
    seedContext:
      "Issue resolution dominates Customer Care time, order status, sizing, missed deadlines.",
  },
];

export const BSN_ROLES: Role[] = [
  { id: "fsp", name: "FSP (Field Sales Professional)", pod: "Sales", description: "Frontline seller; initiates quotes, orders, and MTS requests." },
  { id: "tm", name: "TM (Territory Manager)", pod: "TM", description: "Hard goods expert; quotes, carts, stock checks." },
  { id: "ssr", name: "SSR (Sales Support Rep)", pod: "SSR", description: "Order backbone; holds, tracking, MTS changes." },
  { id: "purchasing", name: "Purchasing", pod: "Purchasing", description: "NSP vendor setup, ME57/ME58, cost validation." },
  { id: "mts-pod", name: "MTS Pod", pod: "MTS Pod", description: "Shop builds, intake validation, TAL/QOE configuration." },
  { id: "rnr", name: "R&R Pod", pod: "R+R Pod", description: "Returns, replacements, vendor RA, case management." },
  { id: "customer-care", name: "Customer Care", pod: "Customer Care", description: "Customer-facing issue resolution." },
  { id: "ar", name: "AR / Billing", pod: "Fin Serv", description: "Cash application, invoicing, payment issues." },
  { id: "collections", name: "Collections", pod: "Fin Serv", description: "Past due, dunning, payment plans." },
  { id: "credit", name: "Credit", pod: "Fin Serv", description: "Credit terms, applications, holds, quick release." },
  { id: "comp-pod", name: "Comp Pod", pod: "Comp Pod", description: "Nike/UA comp and 4R rewards orders." },
];

/** Role-specific probe hints when paired with a workflow */
export const WORKFLOW_ROLE_HINTS: Record<string, Record<string, string[]>> = {
  "nsp-handling": {
    purchasing: [
      "Walk through ME57 / ME58 creation and changes",
      "How are vendor numbers validated and attached?",
      "Where do invoice mismatches surface and who resolves them?",
      "Feedback loop when Purchasing rejects an NSP request",
    ],
    tm: ["How FSP requests reach Purchasing", "What info must be complete before NSP handoff"],
    fsp: ["What you send vs what comes back incomplete", "Typical turnaround and escalation"],
  },
  "order-visibility": {
    ssr: [
      "Engage vs SAP vs vendor portal lookup order",
      "Decorator status checks and PWO updates",
      "WISMO handling cadence and proactive follow-up",
      "When do you escalate vs self-serve in Engage?",
    ],
    "customer-care": ["Customer-facing status scripts", "When cases route to SSR vs stay in Care"],
    fsp: ["What visibility FSP has vs what they ask SSR for"],
  },
  "mts-shop-build": {
    "mts-pod": [
      "TAL vs QOE, when each is used",
      "Intake completeness checklist",
      "Shop rebuild as Traditional, triggers and rework",
      "Inventory filtering and artwork change process",
      "Shop launch blockers you've seen recently",
    ],
    ssr: ["MTS changes after build", "Live MTS help patterns"],
    fsp: ["When FSP completes build vs MTS Pod", "Coordinator communication"],
  },
};

export function getWorkflow(id: string): Workflow | undefined {
  return BSN_WORKFLOWS.find((w) => w.id === id);
}

export function getRole(id: string): Role | undefined {
  return BSN_ROLES.find((r) => r.id === id);
}

export function getRoleHints(workflowId: string, roleId: string): string[] {
  return WORKFLOW_ROLE_HINTS[workflowId]?.[roleId] ?? [];
}
