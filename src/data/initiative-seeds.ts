import type { PainPoint, ProcessStep } from "@/types/pipeline";

export interface WorkflowInitiativeSeed {
  workflowId: string;
  processSteps: ProcessStep[];
  painPoints: Omit<PainPoint, "workflowId">[];
}

/** BSN example seeds — not hardcoded into core framework logic. */
export const BSN_INITIATIVE_SEEDS: WorkflowInitiativeSeed[] = [
  {
    workflowId: "mts-shop-build",
    processSteps: [
      { id: "mts-intake", name: "MTS intake & validation", ownerRole: "FSP / MTS Pod", systems: ["Engage", "Intake form"] },
      { id: "mts-build", name: "Shop build in TAL/QOE", ownerRole: "MTS Pod", systems: ["TAL", "QOE"] },
      { id: "mts-artwork", name: "Artwork & inventory selection", ownerRole: "MTS Pod", systems: ["TAL", "VOE"] },
      { id: "mts-launch", name: "Shop launch & go-live", ownerRole: "MTS Pod / SSR", systems: ["QOE", "Engage"] },
    ],
    painPoints: [
      { id: "pp-mts-intake", processStepIds: ["mts-intake"], title: "Incomplete intake forms (~25%)", description: "Missing sizes, SKUs, or artwork drives rework before build can start.", severity: "high", evidenceSnippet: "Compendium: ~25% incomplete intake" },
      { id: "pp-mts-nolive", processStepIds: ["mts-launch"], title: "Shops never go live (20–25%)", description: "Shops stall after build due to FSP readiness, inventory, or artwork gaps.", severity: "high" },
      { id: "pp-mts-rebuild", processStepIds: ["mts-build"], title: "Late MTS+ requirements trigger rebuild", description: "Shops rebuilt as Traditional when requirements emerge after initial build.", severity: "medium" },
      { id: "pp-mts-artwork", processStepIds: ["mts-artwork"], title: "Artwork change churn", description: "Repeated artwork revisions consume pod capacity and delay launch.", severity: "medium" },
    ],
  },
  {
    workflowId: "nsp-handling",
    processSteps: [
      { id: "nsp-request", name: "NSP request intake", ownerRole: "FSP / TM", systems: ["Engage", "QOE"] },
      { id: "nsp-purchasing", name: "Purchasing validation (ME57/ME58)", ownerRole: "Purchasing", systems: ["SAP", "ME57", "ME58"] },
      { id: "nsp-po", name: "PO alignment & vendor setup", ownerRole: "Purchasing", systems: ["SAP", "Engage"] },
    ],
    painPoints: [
      { id: "pp-nsp-me57", processStepIds: ["nsp-purchasing"], title: "ME57/ME58 rework loops", description: "Vendor number and attachment errors cause repeated Purchasing rejections.", severity: "high" },
      { id: "pp-nsp-invoice", processStepIds: ["nsp-po"], title: "Invoice mismatch resolution", description: "Cost validation failures surface late and require multi-party coordination.", severity: "medium" },
      { id: "pp-nsp-feedback", processStepIds: ["nsp-request", "nsp-purchasing"], title: "Weak Purchasing ↔ sales feedback loop", description: "FSP/TM lack visibility on why NSP requests were rejected.", severity: "medium" },
    ],
  },
  {
    workflowId: "order-visibility",
    processSteps: [
      { id: "ov-intake", name: "WISMO / status request intake", ownerRole: "Customer Care / SSR", systems: ["Engage"] },
      { id: "ov-lookup", name: "Multi-system status lookup", ownerRole: "SSR", systems: ["Engage", "SAP", "Vendor portals"] },
      { id: "ov-followup", name: "Proactive follow-up & escalation", ownerRole: "SSR", systems: ["Engage", "Decorator dashboards"] },
    ],
    painPoints: [
      { id: "pp-ov-wismo", processStepIds: ["ov-intake"], title: "Reactive WISMO volume", description: "High inbound status requests that could be prevented with proactive updates.", severity: "high" },
      { id: "pp-ov-switching", processStepIds: ["ov-lookup"], title: "System switching tax", description: "SSRs toggle Engage, SAP, and vendor portals for a single answer.", severity: "high" },
      { id: "pp-ov-decorator", processStepIds: ["ov-followup"], title: "Decorator status opacity", description: "PWO and decorator milestones not visible in one place.", severity: "medium" },
    ],
  },
];

export function getSeedForWorkflow(workflowId: string): {
  processSteps: ProcessStep[];
  painPoints: PainPoint[];
} {
  const seed = BSN_INITIATIVE_SEEDS.find((s) => s.workflowId === workflowId);
  if (!seed) {
    return {
      processSteps: [
        { id: "step-intake", name: "Intake & triage", description: "Request received and validated" },
        { id: "step-execute", name: "Core execution", description: "Primary workflow processing" },
        { id: "step-handoff", name: "Handoff & closeout", description: "Downstream routing and completion" },
      ],
      painPoints: [
        {
          id: "pp-generic-intake",
          workflowId,
          processStepIds: ["step-intake"],
          title: "Incomplete intake information",
          description: "Upstream provides insufficient detail, causing rework.",
          severity: "medium",
        },
        {
          id: "pp-generic-handoff",
          workflowId,
          processStepIds: ["step-handoff"],
          title: "Handoff delays between teams",
          description: "Work stalls waiting on another pod or system.",
          severity: "medium",
        },
      ],
    };
  }
  return {
    processSteps: seed.processSteps,
    painPoints: seed.painPoints.map((p) => ({ ...p, workflowId })),
  };
}
