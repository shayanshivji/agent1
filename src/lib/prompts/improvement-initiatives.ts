import type { PainPoint, ProcessStep } from "@/types/pipeline";
import type { InitiativeViewFilter, InputMode, LeverType } from "@/types/initiative";
import { MCKINSEY_INITIATIVE_METHODOLOGY } from "@/lib/diagnostics/mckinsey-framework";

export const INITIATIVE_SYSTEM_PROMPT = `You are a McKinsey improvement initiatives specialist for operational diagnostics.

${MCKINSEY_INITIATIVE_METHODOLOGY}

RULES:
- Every initiative MUST map to specific pain point(s) and process step(s)
- Ground initiatives in provided process context and fact base — not industry platitudes
- Tag lever type: process_fix, ai_automation, tech_data, policy_governance, org_design
- Assign horizon H1 (0-6mo quick wins), H2 (6-18mo scale), H3 (18+mo transform)
- Produce 8-15 initiatives for comprehensive set
- Write descriptions in consulting tone: precise, evidence-linked, action-oriented

Return valid JSON only.`;

export function buildInitiativeUserPrompt(input: {
  workflowId: string;
  workflowName: string;
  companyName?: string;
  inputMode: InputMode;
  viewFilter: InitiativeViewFilter;
  customNotes?: string;
  processSteps: ProcessStep[];
  painPoints: PainPoint[];
  sources: { name: string; extractedText: string }[];
  pipelineNotes?: string;
}): string {
  const sourceBlock =
    input.sources.length > 0
      ? input.sources
          .map((s) => `--- ${s.name} ---\n${s.extractedText.slice(0, 6000)}`)
          .join("\n\n")
      : "No uploaded sources.";

  return `Generate improvement initiatives for:

WORKFLOW: ${input.workflowName} (${input.workflowId})
COMPANY: ${input.companyName ?? "Engagement"}
INPUT MODE: ${input.inputMode}
VIEW FILTER: ${input.viewFilter}

PROCESS STEPS:
${input.processSteps.map((s) => `- [${s.id}] ${s.name}${s.systems ? ` (${s.systems.join(", ")})` : ""}`).join("\n")}

PAIN POINTS:
${input.painPoints.map((p) => `- [${p.id}] ${p.title}: ${p.description} (severity: ${p.severity ?? "unknown"}, steps: ${p.processStepIds.join(", ")})`).join("\n")}

CUSTOM NOTES:
${input.customNotes || "None"}

PIPELINE CONTEXT:
${input.pipelineNotes || "None"}

SOURCES:
${sourceBlock}

Return JSON:
{
  "initiatives": [{
    "id": "<uuid-like string>",
    "title": "...",
    "description": "...",
    "processStepIds": ["..."],
    "painPointIds": ["..."],
    "leverType": "process_fix|ai_automation|tech_data|policy_governance|org_design",
    "horizon": "H1|H2|H3",
    "lifecycle": "new|partially_existing|in_flight",
    "findingType": "value_blocker|efficiency_improvement",
    "valueType": "run_rate_savings|operational_value|growth_at_stake|risk_reduction",
    "enablerCategory": "process|capability|technology_data|governance|talent|kpis_reporting",
    "currentMaturity": "reactive|inconsistent|institutionalized",
    "targetMaturity": "reactive|inconsistent|institutionalized",
    "benchmarkGap": "above_peer|at_peer|below_peer|unknown",
    "executionComplexity": "low|medium|high",
    "timingDependency": "optional — renewals, RFPs, seasonality",
    "sequencingRationale": "why this horizon and priority",
    "rootCauseTheme": "e.g. fragmented ownership, late engagement, data handoffs",
    "dependencies": ["..."],
    "risks": ["..."],
    "impactDirection": "high|medium|low",
    "evidenceStrength": "high|medium|low",
    "quickWinType": "quick_win|deeper_redesign",
    "sourceReferences": ["..."],
    "priorityScore": 0-100,
    "isDuplicate": false,
    "order": 0
  }],
  "mappings": [{
    "initiativeId": "...",
    "painPointId": "...",
    "processStepId": "...",
    "rationale": "..."
  }]
}`;
}

export function normalizeLeverType(raw: string): LeverType {
  const valid: LeverType[] = [
    "process_fix",
    "ai_automation",
    "tech_data",
    "policy_governance",
    "org_design",
  ];
  return valid.includes(raw as LeverType) ? (raw as LeverType) : "process_fix";
}
