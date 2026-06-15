import type { InterviewExecutionMode } from "@/types/interview-execution";
import type { InputMode } from "@/types/initiative";
import type { InterviewExecutionDocument } from "@/types/interview-execution";

export const INTERVIEW_SYSTEM_PROMPT = `You are a McKinsey diagnostic interview intelligence system.

RULES:
- You are NOT a chatbot. You extract structured consulting data from interviews.
- Every finding must link to evidence (quotes, line refs, or live turn references).
- Separate evidence from conclusions in the evidenceRegistry.
- Preserve BSN terms: TM, SSR, FSP, R&R, MTS, NSP, SAP, Engage, VOE, QOE, TAL, Gladly, ME57, ME58
- Flag contradictions when statements conflict across sources or roles.
- Track coverage: which guide topics were covered vs missing.
- Assign confidence: high | medium | low per finding.
- Do NOT invent facts unsupported by the transcript or live conversation.
- Output must feed Agent 3 (Process Mapping) directly.

Return valid JSON only.`;

export function buildInterviewUserPrompt(input: {
  mode: InterviewExecutionMode;
  workflowId: string;
  workflowName: string;
  roleId: string;
  roleName: string;
  companyName?: string;
  stakeholderName?: string;
  inputMode: InputMode;
  customNotes?: string;
  guideNotes?: string;
  transcriptText?: string;
  liveTurns?: { speaker: string; content: string }[];
  sources: { name: string; extractedText: string }[];
}): string {
  const sourceBlock =
    input.sources.length > 0
      ? input.sources.map((s) => `--- ${s.name} ---\n${s.extractedText.slice(0, 8000)}`).join("\n\n")
      : "No uploaded sources.";

  const liveBlock =
    input.liveTurns && input.liveTurns.length > 0
      ? input.liveTurns.map((t) => `[${t.speaker}]: ${t.content}`).join("\n")
      : "No live turns.";

  return `Extract structured interview intelligence:

MODE: ${input.mode}
WORKFLOW: ${input.workflowName} (${input.workflowId})
STAKEHOLDER ROLE: ${input.roleName} (${input.roleId})
COMPANY: ${input.companyName ?? "Engagement"}
STAKEHOLDER NAME: ${input.stakeholderName ?? "SME"}
INPUT MODE: ${input.inputMode}

GUIDE CONTEXT:
${input.guideNotes || "None"}

TRANSCRIPT:
${input.transcriptText || "None"}

LIVE CONVERSATION:
${liveBlock}

NOTES: ${input.customNotes || "None"}

SOURCES:
${sourceBlock}

Return JSON matching InterviewExecutionDocument fields (omit id, createdAt, updatedAt, reviewStatus):
{
  "executiveSummary": "...",
  "processActivities": [{ "name", "description", "frequency" }],
  "workflowSteps": [{ "name", "description", "sequence", "actorRole", "systems", "confidence" }],
  "systems": [{ "name", "usage" }],
  "painPoints": [{ "title", "description", "severity", "processStepIds", "confidence" }],
  "opportunities": [{ "title", "description", "confidence" }],
  "handoffs": [{ "fromRole", "toRole", "description", "trigger", "confidence" }],
  "openQuestions": [{ "question", "reason", "priority" }],
  "contradictions": [{ "topic", "statementA", "sourceA", "statementB", "sourceB" }],
  "evidenceRegistry": [{ "quote", "source", "section", "lineRef", "confidence" }],
  "coverage": {
    "score": 0-100,
    "objectivesFromGuide": ["..."],
    "questionsAsked": ["..."],
    "topics": [{ "name", "status": "covered|partial|missing", "notes" }],
    "missingTopics": ["..."],
    "suggestedFollowUps": ["..."]
  },
  "transcriptRaw": "...",
  "liveTurns": []
}`;
}

export function buildLiveSuggestPrompt(input: {
  workflowId: string;
  roleName: string;
  coverageScore: number;
  missingTopics: string[];
  recentTurns: { speaker: string; content: string }[];
  guideQuestions?: string[];
}): string {
  return `Suggest 3-5 follow-up interview questions for a McKinsey diagnostic.

WORKFLOW: ${input.workflowId}
ROLE: ${input.roleName}
COVERAGE: ${input.coverageScore}%
MISSING TOPICS: ${input.missingTopics.join(", ") || "None listed"}
GUIDE QUESTIONS REMAINING: ${input.guideQuestions?.join("; ") || "N/A"}

RECENT CONVERSATION:
${input.recentTurns.map((t) => `[${t.speaker}]: ${t.content}`).join("\n")}

Return JSON: { "followUps": ["question 1", "question 2", ...], "coverageGaps": ["gap 1", ...] }`;
}

export function buildRefineInterviewPrompt(
  section: string,
  feedback: string,
  doc: InterviewExecutionDocument,
): string {
  return `Refine interview extraction section "${section}" based on feedback.

FEEDBACK: ${feedback}

CURRENT DATA:
${JSON.stringify(
  {
    executiveSummary: doc.executiveSummary,
    workflowSteps: doc.workflowSteps,
    painPoints: doc.painPoints,
    evidenceRegistry: doc.evidenceRegistry,
    coverage: doc.coverage,
  },
  null,
  2,
).slice(0, 12000)}

Return JSON with only updated fields for section: ${section}. Same schema.`;
}
