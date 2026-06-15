import type {
  Contradiction,
  EvidenceRecord,
  InterviewCoverage,
  InterviewHandoff,
  InterviewOpportunity,
  InterviewPainPoint,
  InterviewSystem,
  InterviewWorkflowStep,
  OpenQuestion,
  ProcessActivity,
} from "@/types/interview-execution";

export interface InterviewSeedBundle {
  workflowId: string;
  roleId: string;
  executiveSummary: string;
  processActivities: Omit<ProcessActivity, "id" | "evidenceIds">[];
  workflowSteps: Omit<InterviewWorkflowStep, "id" | "evidenceIds">[];
  systems: Omit<InterviewSystem, "id" | "evidenceIds">[];
  painPoints: Omit<InterviewPainPoint, "id" | "processStepIds" | "evidenceIds">[];
  opportunities: Omit<InterviewOpportunity, "id" | "evidenceIds">[];
  handoffs: Omit<InterviewHandoff, "id" | "evidenceIds">[];
  openQuestions: Omit<OpenQuestion, "id">[];
  contradictions: Omit<Contradiction, "id">[];
  evidence: Omit<EvidenceRecord, "id" | "linkedFindingType" | "linkedFindingId">[];
  coverage: Omit<InterviewCoverage, "questionsAsked">;
}

const NSP_PURCHASING: InterviewSeedBundle = {
  workflowId: "nsp-handling",
  roleId: "purchasing",
  executiveSummary:
    "Purchasing validates NSP requests through ME57/ME58 workflows in SAP. Vendor number attachment errors and incomplete cost sheets drive ~40% rework. Feedback to FSP/TM is email-based and often delayed. Invoice mismatches surface late in the PO lifecycle.",
  processActivities: [
    { name: "NSP request triage", description: "Review incoming NSP from TM/FSP via Engage queue.", frequency: "Daily" },
    { name: "ME57/ME58 validation", description: "Create or update vendor records and validate attachments in SAP.", frequency: "Per request" },
    { name: "Cost sheet review", description: "Validate pricing against vendor quotes and margin rules.", frequency: "Per request" },
    { name: "PO alignment", description: "Ensure PO matches approved cost and vendor setup before release.", frequency: "Per request" },
  ],
  workflowSteps: [
    { name: "Receive NSP request", description: "Request arrives from TM/FSP with SKU, vendor, and cost details.", sequence: 0, actorRole: "Purchasing", systems: ["Engage", "Email"], confidence: "high" },
    { name: "Validate vendor number", description: "Check vendor exists in SAP; attach or create ME57/ME58 records.", sequence: 1, actorRole: "Purchasing", systems: ["SAP", "ME57", "ME58"], confidence: "high" },
    { name: "Review cost sheet", description: "Validate cost against quote; flag mismatches for TM follow-up.", sequence: 2, actorRole: "Purchasing", systems: ["SAP", "Engage"], confidence: "high" },
    { name: "Release or reject PO", description: "Approve PO or return to TM with rejection reason.", sequence: 3, actorRole: "Purchasing", systems: ["SAP", "Engage"], confidence: "high" },
    { name: "Invoice reconciliation", description: "Match vendor invoice to PO; resolve mismatches with AR/vendor.", sequence: 4, actorRole: "Purchasing", systems: ["SAP"], confidence: "medium" },
  ],
  systems: [
    { name: "SAP", usage: "Vendor master, ME57/ME58, PO creation, invoice matching" },
    { name: "ME57", usage: "Vendor number maintenance and attachment" },
    { name: "ME58", usage: "Vendor record changes and validation" },
    { name: "Engage", usage: "NSP queue intake and status updates to sales" },
  ],
  painPoints: [
    { title: "ME57/ME58 rework loops", description: "Vendor number errors cause repeated rejections; ~40% of requests need at least one resubmit.", severity: "high", confidence: "high" },
    { title: "Incomplete NSP intake from TM/FSP", description: "Missing attachments or cost details block validation and extend cycle time.", severity: "high", confidence: "high" },
    { title: "Delayed feedback to sales", description: "Rejection reasons sent via email; FSP/TM lack visibility into queue status.", severity: "medium", confidence: "high" },
    { title: "Late invoice mismatches", description: "Cost validation failures discovered after PO release require multi-party coordination.", severity: "medium", confidence: "medium" },
  ],
  opportunities: [
    { title: "Standardized NSP intake checklist", description: "Require complete attachment set before queue entry.", confidence: "high" },
    { title: "In-app rejection feedback", description: "Surface rejection reasons in Engage instead of email.", confidence: "high" },
    { title: "Automated vendor number validation", description: "Pre-check ME57 before human review.", confidence: "medium" },
  ],
  handoffs: [
    { fromRole: "FSP/TM", toRole: "Purchasing", description: "NSP request with SKU, vendor, cost sheet, and attachments.", trigger: "Non-standard SKU identified", confidence: "high" },
    { fromRole: "Purchasing", toRole: "TM/FSP", description: "Rejection or clarification request with specific missing fields.", trigger: "Validation failure", confidence: "high" },
    { fromRole: "Purchasing", toRole: "AR/Vendor", description: "Invoice mismatch escalation.", trigger: "Invoice ≠ PO", confidence: "medium" },
  ],
  openQuestions: [
    { question: "What is average NSP cycle time from intake to PO release?", reason: "Needed for value sizing", priority: "high" },
    { question: "How are vendor escalations handled outside ME57/ME58?", reason: "Exception path not fully described", priority: "medium" },
    { question: "What percentage of invoice mismatches are caught pre-PO vs post?", reason: "Validates late-stage pain severity", priority: "medium" },
  ],
  contradictions: [
    {
      topic: "Pricing accuracy on NSP requests",
      statementA: "TM says pricing is rarely wrong on initial submission",
      sourceA: "TM interview (prior session)",
      statementB: "Purchasing says ~90% of requests need cost correction",
      sourceB: "Purchasing SME (this interview)",
    },
  ],
  evidence: [
    { quote: "We probably reject or send back four out of ten NSP requests because the vendor number isn't attached right in ME57.", source: "Transcript line 42", lineRef: "L42", confidence: "high" },
    { quote: "FSP has no idea why something is sitting in our queue unless we email them.", source: "Transcript line 78", lineRef: "L78", confidence: "high" },
    { quote: "Invoice mismatches usually show up two weeks after PO, and then we're chasing AR and the vendor.", source: "Transcript line 112", lineRef: "L112", confidence: "medium" },
    { quote: "If the cost sheet is missing, we don't even open the ME57 workflow.", source: "Transcript line 31", lineRef: "L31", confidence: "high" },
  ],
  coverage: {
    score: 85,
    objectivesFromGuide: [
      "Map ME57/ME58 validation workflow",
      "Identify rework drivers and feedback loops",
      "Capture systems and handoffs to TM/FSP",
    ],
    topics: [
      { id: "cov-me57", name: "ME57/ME58 process", status: "covered" },
      { id: "cov-rework", name: "Rework drivers", status: "covered" },
      { id: "cov-feedback", name: "Sales feedback loop", status: "covered" },
      { id: "cov-invoice", name: "Invoice validation", status: "partial", notes: "Post-PO path described; pre-PO checks unclear" },
      { id: "cov-escalation", name: "Vendor escalation", status: "missing" },
      { id: "cov-exception", name: "Exception handling", status: "missing" },
    ],
    missingTopics: ["Vendor escalation process", "Exception handling", "Pre-PO invoice validation"],
    suggestedFollowUps: [
      "Walk through a recent vendor escalation end to end",
      "What happens when ME58 update fails after three attempts?",
      "How do you validate invoice amounts before PO release?",
    ],
  },
};

const MTS_POD: InterviewSeedBundle = {
  workflowId: "mts-shop-build",
  roleId: "mts-pod",
  executiveSummary:
    "MTS Pod builds My Team Shop sites from intake through TAL/QOE configuration. ~25% of intake forms arrive incomplete. Artwork revisions and inventory filtering consume significant pod time. 20-25% of built shops never go live.",
  processActivities: [
    { name: "Intake validation", description: "Review FSP intake for sizes, SKUs, artwork, and account context.", frequency: "Per shop" },
    { name: "Shop build", description: "Configure shop structure and assortment in TAL/QOE.", frequency: "Per shop" },
    { name: "Artwork finalization", description: "Process artwork assets and manage revision cycles.", frequency: "Per shop" },
    { name: "Launch coordination", description: "Go-live with FSP and SSR; close out build queue.", frequency: "Per shop" },
  ],
  workflowSteps: [
    { name: "Receive intake", description: "Intake form submitted by FSP via Engage.", sequence: 0, actorRole: "MTS Pod", systems: ["Engage"], confidence: "high" },
    { name: "Validate completeness", description: "Check required fields; return incomplete forms to FSP.", sequence: 1, actorRole: "MTS Pod", systems: ["Engage"], confidence: "high" },
    { name: "Build in TAL/QOE", description: "Configure shop, products, and pricing.", sequence: 2, actorRole: "MTS Pod", systems: ["TAL", "QOE"], confidence: "high" },
    { name: "Artwork & inventory", description: "Finalize artwork and filter inventory by network.", sequence: 3, actorRole: "MTS Pod", systems: ["TAL", "VOE"], confidence: "high" },
    { name: "Launch shop", description: "Go-live and notify FSP/SSR.", sequence: 4, actorRole: "MTS Pod", systems: ["QOE", "Engage"], confidence: "high" },
  ],
  systems: [
    { name: "TAL", usage: "Shop structure and product configuration" },
    { name: "QOE", usage: "Pricing and launch configuration" },
    { name: "VOE", usage: "Inventory and artwork selection" },
    { name: "Engage", usage: "Intake queue and FSP communication" },
  ],
  painPoints: [
    { title: "Incomplete intake forms (~25%)", description: "Missing sizes, SKUs, or artwork drives rework before build starts.", severity: "high", confidence: "high" },
    { title: "Artwork change churn", description: "Multiple revision cycles delay launch and consume pod capacity.", severity: "medium", confidence: "high" },
    { title: "Shops never go live (20-25%)", description: "Shops stall after build due to FSP readiness or inventory gaps.", severity: "high", confidence: "high" },
    { title: "Late MTS+ requirements", description: "Shops rebuilt as Traditional when requirements emerge after initial build.", severity: "medium", confidence: "medium" },
  ],
  opportunities: [
    { title: "Mandatory intake checklist", description: "Block submission until required fields complete.", confidence: "high" },
    { title: "Artwork revision limits", description: "Cap revision rounds with FSP sign-off.", confidence: "medium" },
    { title: "Launch readiness dashboard", description: "Track shops approaching go-live blockers.", confidence: "medium" },
  ],
  handoffs: [
    { fromRole: "FSP", toRole: "MTS Pod", description: "Completed intake form with account context.", trigger: "New MTS shop request", confidence: "high" },
    { fromRole: "MTS Pod", toRole: "FSP", description: "Incomplete intake return or launch notification.", trigger: "Validation fail / go-live", confidence: "high" },
    { fromRole: "MTS Pod", toRole: "SSR", description: "Live shop handoff for order support.", trigger: "Shop go-live", confidence: "medium" },
  ],
  openQuestions: [
    { question: "Average build time from valid intake to go-live?", reason: "Value sizing", priority: "high" },
    { question: "What triggers rebuild as Traditional vs MTS?", reason: "Exception path unclear", priority: "medium" },
  ],
  contradictions: [],
  evidence: [
    { quote: "About a quarter of intakes come back incomplete, mostly missing artwork or size runs.", source: "Transcript line 18", lineRef: "L18", confidence: "high" },
    { quote: "We probably have shops sitting built but not live for months because FSP never finishes artwork.", source: "Transcript line 55", lineRef: "L55", confidence: "high" },
  ],
  coverage: {
    score: 78,
    objectivesFromGuide: [
      "Map intake-to-launch workflow",
      "Quantify rework and non-go-live rates",
      "Identify TAL/QOE/VOE usage patterns",
    ],
    topics: [
      { id: "cov-intake", name: "Intake validation", status: "covered" },
      { id: "cov-build", name: "TAL/QOE build", status: "covered" },
      { id: "cov-artwork", name: "Artwork process", status: "partial" },
      { id: "cov-launch", name: "Launch blockers", status: "covered" },
      { id: "cov-rebuild", name: "Traditional rebuild triggers", status: "missing" },
    ],
    missingTopics: ["Traditional rebuild triggers", "Inventory filtering detail"],
    suggestedFollowUps: [
      "When does a shop get rebuilt as Traditional instead of MTS?",
      "Walk through inventory filtering across networks",
    ],
  },
};

const SEEDS: InterviewSeedBundle[] = [NSP_PURCHASING, MTS_POD];

export function getInterviewSeed(workflowId: string, roleId: string): InterviewSeedBundle | undefined {
  return SEEDS.find((s) => s.workflowId === workflowId && s.roleId === roleId)
    ?? SEEDS.find((s) => s.workflowId === workflowId);
}
