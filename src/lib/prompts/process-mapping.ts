import type { InputMode } from "@/types/initiative";
import type { ProcessMapDocument } from "@/types/process-map";

export const PROCESS_MAP_SYSTEM_PROMPT = `You are a McKinsey ProcessAI-style current-state process mapping specialist.

RULES:
- Convert messy interview notes, transcripts, and docs into a structured current-state process map
- Do NOT invent steps unsupported by evidence; use confidence: confirmed | inferred | uncertain
- Preserve BSN terms: TM, SSR, FSP, R&R, MTS, NSP, SAP, Engage, VOE, QOE, TAL, Gladly
- Map pain points to specific process steps with severity: critical | high | medium | low
- Tag improvements with bucket: simplify | automate | digitize | consolidate
- Include what works well where evidence supports it
- Flag in-flight initiatives when mentioned
- Organize steps into logical phases (2-5 phases)
- Assign actors/roles per step with swimlane clarity
- Surface handoffs, rework loops, and system fragmentation
- Output must feed Agent 4 (initiatives) directly

Return valid JSON only.`;

export function buildProcessMapUserPrompt(input: {
  workflowId: string;
  workflowName: string;
  companyName?: string;
  inputMode: InputMode;
  customNotes?: string;
  pipelineNotes?: string;
  sources: { name: string; extractedText: string }[];
}): string {
  const sourceBlock =
    input.sources.length > 0
      ? input.sources.map((s) => `--- ${s.name} ---\n${s.extractedText.slice(0, 8000)}`).join("\n\n")
      : "No uploaded sources.";

  return `Build current-state process map for:

WORKFLOW: ${input.workflowName} (${input.workflowId})
COMPANY: ${input.companyName ?? "Engagement"}
INPUT MODE: ${input.inputMode}

NOTES: ${input.customNotes || "None"}
PIPELINE: ${input.pipelineNotes || "None"}

SOURCES:
${sourceBlock}

Return JSON:
{
  "purpose": "...",
  "narrativeSummary": "2-3 paragraph consulting summary",
  "phases": [{ "id": "...", "name": "PHASE NAME", "order": 0 }],
  "actors": [{ "id": "...", "name": "...", "shortLabel": "...", "color": "#2563eb" }],
  "steps": [{
    "id": "...",
    "phaseId": "...",
    "name": "...",
    "description": "...",
    "actorId": "...",
    "systems": ["..."],
    "input": "...",
    "output": "...",
    "nextStepId": "...",
    "handoffTo": "...",
    "frequency": "...",
    "painPointIds": [],
    "evidenceRefs": ["..."],
    "confidence": "confirmed|inferred|uncertain",
    "worksWell": "...",
    "order": 0
  }],
  "painPoints": [{
    "id": "...",
    "phaseId": "...",
    "processStepIds": ["..."],
    "title": "...",
    "description": "...",
    "severity": "critical|high|medium|low",
    "evidenceSnippet": "...",
    "sourceDocument": "..."
  }],
  "improvements": [{
    "id": "...",
    "processStepIds": ["..."],
    "painPointIds": ["..."],
    "title": "...",
    "description": "...",
    "bucket": "simplify|automate|digitize|consolidate",
    "impactRange": "5-15%",
    "priority": "high|medium|low"
  }],
  "alternateFlows": [{ "id": "...", "name": "...", "description": "...", "stepIds": ["..."] }],
  "inFlightInitiatives": [{ "id": "...", "title": "...", "status": "in_flight|partial|planned", "processStepIds": ["..."], "note": "..." }],
  "openQuestions": ["..."]
}`;
}

export function buildRefinePrompt(
  target: string,
  feedback: string,
  doc: ProcessMapDocument,
): string {
  return `Refine the process map section "${target}" based on feedback.

FEEDBACK: ${feedback}

CURRENT MAP (abbreviated):
${JSON.stringify(
  {
    steps: doc.steps,
    painPoints: doc.painPoints,
    improvements: doc.improvements,
    narrativeSummary: doc.narrativeSummary,
  },
  null,
  2,
).slice(0, 12000)}

Return JSON with only the updated fields for: ${target}. Same schema as generation.`;
}
