import type {
  AlternateFlow,
  InitiativeReference,
  MapActor,
  MapImprovement,
  MapPainPoint,
  MapPhase,
  MapProcessStep,
} from "@/types/process-map";

export interface WorkflowProcessMapSeed {
  workflowId: string;
  purpose: string;
  phases: MapPhase[];
  actors: MapActor[];
  steps: Omit<MapProcessStep, "painPointIds" | "evidenceRefs">[];
  painPoints: Omit<MapPainPoint, "id">[];
  improvements: Omit<MapImprovement, "id">[];
  alternateFlows?: AlternateFlow[];
  inFlight?: InitiativeReference[];
  openQuestions?: string[];
  narrativeSummary: string;
}

const MTS_SEED: WorkflowProcessMapSeed = {
  workflowId: "mts-shop-build",
  purpose: "Build and launch My Team Shop sites for FSP-managed accounts from intake through go-live.",
  phases: [
    { id: "phase-intake", name: "INTAKE & VALIDATION", order: 0 },
    { id: "phase-build", name: "SHOP BUILD", order: 1 },
    { id: "phase-launch", name: "LAUNCH & CLOSEOUT", order: 2 },
  ],
  actors: [
    { id: "actor-fsp", name: "FSP / Field Sales", shortLabel: "FSP", color: "#2563eb" },
    { id: "actor-mts", name: "MTS Build Pod", shortLabel: "MTS Pod", color: "#0d9488" },
    { id: "actor-ssr", name: "SSR / Sales Support", shortLabel: "SSR", color: "#ea580c" },
  ],
  steps: [
    {
      id: "mts-intake",
      phaseId: "phase-intake",
      name: "Submit MTS intake form",
      description: "FSP completes intake with sizes, SKUs, artwork requirements, and account context.",
      actorId: "actor-fsp",
      systems: ["Engage", "Intake form"],
      input: "Account requirements",
      output: "Validated intake packet",
      nextStepId: "mts-validate",
      frequency: "Per shop request",
      confidence: "confirmed",
      order: 0,
    },
    {
      id: "mts-validate",
      phaseId: "phase-intake",
      name: "Validate intake completeness",
      description: "MTS Pod reviews intake; incomplete forms returned to FSP (~25% rework rate).",
      actorId: "actor-mts",
      systems: ["Engage"],
      handoffTo: "FSP",
      nextStepId: "mts-build",
      confidence: "confirmed",
      order: 1,
    },
    {
      id: "mts-build",
      phaseId: "phase-build",
      name: "Build shop in TAL/QOE",
      description: "Configure shop structure, product assortment, and pricing in build tools.",
      actorId: "actor-mts",
      systems: ["TAL", "QOE"],
      nextStepId: "mts-artwork",
      confidence: "confirmed",
      order: 2,
    },
    {
      id: "mts-artwork",
      phaseId: "phase-build",
      name: "Artwork & inventory selection",
      description: "Finalize artwork assets and inventory selection; revisions cause churn.",
      actorId: "actor-mts",
      systems: ["TAL", "VOE"],
      nextStepId: "mts-launch",
      confidence: "confirmed",
      order: 3,
    },
    {
      id: "mts-launch",
      phaseId: "phase-launch",
      name: "Shop launch & go-live",
      description: "Publish shop; FSP notified. 20-25% of builds never reach go-live.",
      actorId: "actor-mts",
      systems: ["QOE", "Engage"],
      handoffTo: "FSP / SSR",
      confidence: "confirmed",
      order: 4,
    },
  ],
  painPoints: [
    {
      phaseId: "phase-intake",
      processStepIds: ["mts-intake", "mts-validate"],
      title: "Incomplete intake forms (~25%)",
      description: "Missing sizes, SKUs, or artwork forces rework before build can start.",
      severity: "high",
      evidenceSnippet: "Compendium: ~25% of MTS intakes require return to FSP for missing fields.",
      sourceDocument: "BSN compendium",
    },
    {
      phaseId: "phase-build",
      processStepIds: ["mts-build"],
      title: "Late MTS+ requirements trigger rebuild",
      description: "Shops rebuilt as Traditional when requirements emerge after initial build.",
      severity: "medium",
      evidenceSnippet: "Interview: pod rebuilds when FSP adds requirements post-build.",
    },
    {
      phaseId: "phase-build",
      processStepIds: ["mts-artwork"],
      title: "Artwork change churn",
      description: "Repeated artwork revisions consume pod capacity and delay launch.",
      severity: "medium",
      evidenceSnippet: "Multiple SME interviews cite artwork back-and-forth as top capacity drain.",
    },
    {
      phaseId: "phase-launch",
      processStepIds: ["mts-launch"],
      title: "Shops never go live (20-25%)",
      description: "Shops stall after build due to FSP readiness, inventory, or artwork gaps.",
      severity: "high",
      evidenceSnippet: "Compendium sizing: 20-25% of completed builds do not reach go-live.",
    },
  ],
  improvements: [
    {
      processStepIds: ["mts-intake", "mts-validate"],
      painPointIds: [],
      title: "Mandatory intake checklist with auto-validation",
      description: "Engage form blocks submission until required fields complete; reduces FSP rework loops.",
      bucket: "digitize",
      impactRange: "10-20%",
      priority: "high",
    },
    {
      processStepIds: ["mts-artwork"],
      painPointIds: [],
      title: "Standard artwork approval workflow with SLA",
      description: "Single approval path with version control in TAL/VOE.",
      bucket: "simplify",
      impactRange: "5-15%",
      priority: "medium",
    },
    {
      processStepIds: ["mts-launch"],
      painPointIds: [],
      title: "Go-live readiness dashboard for FSP",
      description: "Proactive visibility on blockers before launch date.",
      bucket: "automate",
      impactRange: "15-25%",
      priority: "high",
    },
  ],
  inFlight: [
    {
      id: "if-mts-intake",
      title: "Intake form redesign",
      status: "in_flight",
      processStepIds: ["mts-intake"],
      note: "Engage team updating required fields",
    },
  ],
  openQuestions: [
    "What is peak-season capacity constraint threshold for MTS Pod?",
    "Are Traditional rebuilds counted separately in volume metrics?",
  ],
  narrativeSummary:
    "The MTS shop build workflow spans intake validation, TAL/QOE configuration, artwork finalization, and go-live. FSP submits intake; MTS Pod validates, builds, and launches. Primary value leaks at incomplete intake (~25% rework), artwork churn, and shops that never go live (20-25%). Handoffs between FSP and MTS Pod are manual via Engage with limited proactive status visibility.",
};

export const PROCESS_MAP_SEEDS: WorkflowProcessMapSeed[] = [MTS_SEED];

export function getProcessMapSeed(workflowId: string): WorkflowProcessMapSeed | null {
  return PROCESS_MAP_SEEDS.find((s) => s.workflowId === workflowId) ?? null;
}
