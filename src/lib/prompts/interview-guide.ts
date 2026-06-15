import type { GuideSectionId, InterviewLevel } from "@/types/guide";
import { getRole, getRoleHints, getWorkflow } from "@/data/catalog";
import type { SourceDocument } from "@/types/guide";
import { MCKINSEY_INTERVIEW_PRINCIPLES } from "@/lib/prompts/mckinsey-frameworks";
import {
  getEngagementLabel,
  getFunction,
  getIndustry,
  type EngagementContext,
} from "@/data/engagement-context";

function resolveWorkflowIdList(workflowIds: string[] | undefined, workflowId: string): string[] {
  if (workflowIds?.length) return workflowIds;
  return workflowId ? [workflowId] : [];
}

function formatWorkflowsBlock(ids: string[], engagement: EngagementContext): string {
  const workflows = ids
    .map((id) => getWorkflow(id, engagement))
    .filter((w): w is NonNullable<typeof w> => Boolean(w));

  if (workflows.length <= 1) {
    const w = workflows[0];
    return `WORKFLOW: ${w?.name ?? ids[0]}
${w?.description ?? ""}
Systems: ${w?.typicalSystems.join(", ") ?? "N/A"}
Background: ${w?.seedContext ?? ""}`;
  }

  return `SELECTED WORKFLOWS (${workflows.length}) — cover ALL in one integrated guide:

${workflows
  .map(
    (w, i) => `WORKFLOW ${i + 1}: ${w.name}
${w.description}
Systems: ${w.typicalSystems.join(", ")}
Background: ${w.seedContext}`,
  )
  .join("\n\n")}`;
}

function collectRoleHints(ids: string[], roleId: string): string[] {
  const seen = new Set<string>();
  const hints: string[] = [];
  for (const id of ids) {
    for (const hint of getRoleHints(id, roleId)) {
      if (!seen.has(hint)) {
        seen.add(hint);
        hints.push(hint);
      }
    }
  }
  return hints;
}

export const SYSTEM_PROMPT = `You are a McKinsey engagement team member creating SME interview guides for a BSN Sports sales support diagnostic (Varsity Brands / KKR portco).

${MCKINSEY_INTERVIEW_PRINCIPLES}

RULES:
- Output structured, consulting-grade content, no generic filler
- Questions must be open-ended and probe for specific recent examples
- Use BSN terminology: FSP, TM, SSR, MTS Pod, TAL, QOE, VOE, Engage, WISMO, R&R, etc.
- Ground everything in the selected workflow AND role
- If source materials are provided, cite specific terms and pain points from them
- Do not invent facts, distinguish "known" from "to confirm"
- Be concrete: systems, handoffs, queues, metrics, cycle times

Return valid JSON only.`;

export function buildUserPrompt(input: {
  workflowId: string;
  workflowIds?: string[];
  roleId: string;
  level: InterviewLevel;
  customNotes?: string;
  interviewObjective?: string;
  sources: SourceDocument[];
  engagement: EngagementContext;
}): string {
  const ids = resolveWorkflowIdList(input.workflowIds, input.workflowId);
  const role = getRole(input.roleId, input.engagement);
  const hints = collectRoleHints(ids, input.roleId);
  const industry = getIndustry(input.engagement.industryId);
  const fn = getFunction(input.engagement.functionId);
  const workflowBlock = formatWorkflowsBlock(ids, input.engagement);

  const sourceBlock =
    input.sources.length > 0
      ? input.sources
          .map(
            (s) =>
              `--- ${s.name} ---\n${s.extractedText.slice(0, 8000)}${s.extractedText.length > 8000 ? "\n[truncated]" : ""}`,
          )
          .join("\n\n")
      : "No uploaded sources.";

  const levelGuide = {
    intro: "30-min introductory session, breadth over depth, map the landscape",
    deep_dive: "60-min deep dive, step through process with recent examples",
    validation: "45-min validation, confirm hypotheses and fill fact gaps",
  }[input.level];

  return `Create an interview guide for:

ENGAGEMENT: ${getEngagementLabel(input.engagement)}
Industry context: ${industry?.description ?? input.engagement.industryId}
Function context: ${fn?.description ?? input.engagement.functionId}

${workflowBlock}

ROLE: ${role?.name ?? input.roleId}
${role?.description ?? ""}

INTERVIEW LEVEL: ${input.level}, ${levelGuide}

INTERVIEW OBJECTIVE (must shape the entire guide):
${input.interviewObjective?.trim() || "Not specified — infer from workflow and role, but flag gaps in need_to_confirm."}

ROLE-SPECIFIC PROBES TO INCORPORATE:
${hints.length ? hints.map((h) => `- ${h}`).join("\n") : "- Use workflow + role to infer specific probes"}

CUSTOM NOTES:
${input.customNotes || "None"}

SOURCE MATERIALS:
${sourceBlock}

Return JSON:
{
  "sections": [
    {
      "id": "<section_id>",
      "title": "<title>",
      "content": "<paragraph or empty if bullets-only>",
      "bullets": ["<item>", ...]
    }
  ]
}

Required section ids (all must be present):
objective, role_snapshot, known_facts, need_to_confirm, primary_questions, follow_up_probes, pain_points_to_test, systems_references, evidence_to_capture, fact_base_sizing, likely_outputs, dependencies_handoffs, red_flags, closeout

Section format rules:
- objective, role_snapshot: narrative "content" only — do NOT use bullets for these sections
- primary_questions, follow_up_probes, pain_points_to_test, closeout: use bullets as individual interview questions (6-10 each where applicable)
- known_facts, need_to_confirm: bullets as concise fact or hypothesis items

fact_base_sizing must list specific quantifiable fields to collect for value modeling: % time on workflow, volume/week, cycle time, rework rate, FTE allocation, cost per transaction where applicable.

primary_questions and follow_up_probes should have 6-10 bullets each.
pain_points_to_test should reference compendium-style hypotheses where relevant.`;
}

export function buildGuideRefinePrompt(input: {
  workflowId: string;
  workflowIds?: string[];
  roleId: string;
  level: InterviewLevel;
  customNotes?: string;
  interviewObjective?: string;
  sections: { id: GuideSectionId; title: string; content?: string; bullets?: string[] }[];
  feedback: string;
  sources: SourceDocument[];
  engagement: EngagementContext;
}): string {
  const ids = resolveWorkflowIdList(input.workflowIds, input.workflowId);
  const role = getRole(input.roleId, input.engagement);
  const workflowBlock = formatWorkflowsBlock(ids, input.engagement);

  const guideBlock = input.sections
    .map((s) => {
      const bullets = (s.bullets ?? []).map((b) => `  - ${b}`).join("\n");
      return `### ${s.title} (${s.id})\n${s.content?.trim() ?? ""}${bullets ? `\n${bullets}` : ""}`;
    })
    .join("\n\n");

  return `Revise this interview guide based on consultant feedback.

Engagement: ${getEngagementLabel(input.engagement)}
${workflowBlock}
Role: ${role?.name}
Interview level: ${input.level}
Interview objective: ${input.interviewObjective?.trim() || "Not specified"}
Custom notes: ${input.customNotes || "None"}

CURRENT GUIDE:
${guideBlock}

CONSULTANT FEEDBACK:
${input.feedback}

Apply the feedback. Keep sections that work; rewrite or add where requested.
Return JSON with the full updated guide:
{
  "sections": [
    { "id": "<section_id>", "title": "<title>", "content": "...", "bullets": ["..."] }
  ]
}

Include ALL section ids. objective and role_snapshot must use content only (no bullets).`;
}

export function buildSectionRegeneratePrompt(input: {
  sectionId: GuideSectionId;
  sectionTitle: string;
  workflowId: string;
  roleId: string;
  level: InterviewLevel;
  customNotes?: string;
  currentContent: string;
  currentBullets?: string[];
  sources: SourceDocument[];
  engagement: EngagementContext;
}): string {
  const workflow = getWorkflow(input.workflowId, input.engagement);
  const role = getRole(input.roleId, input.engagement);

  return `Regenerate ONLY the "${input.sectionTitle}" section for:
Engagement: ${getEngagementLabel(input.engagement)}
Workflow: ${workflow?.name}
Role: ${role?.name}
Interview level: ${input.level}

Custom notes: ${input.customNotes || "None"}

Current content to improve (keep what works, make more specific):
${input.currentContent}

Current bullets:
${(input.currentBullets ?? []).map((b) => `- ${b}`).join("\n") || "None"}

Sources: ${input.sources.map((s) => s.name).join(", ") || "none"}

Return JSON: { "content": "...", "bullets": ["..."] }`;
}

export function templateGuide(input: {
  workflowId: string;
  workflowIds?: string[];
  roleId: string;
  level: InterviewLevel;
  engagement: EngagementContext;
}): { sections: { id: GuideSectionId; title: string; content: string; bullets?: string[] }[] } {
  const ids = resolveWorkflowIdList(input.workflowIds, input.workflowId);
  const workflows = ids
    .map((id) => getWorkflow(id, input.engagement))
    .filter((w): w is NonNullable<typeof w> => Boolean(w));
  const workflow = workflows[0];
  const role = getRole(input.roleId, input.engagement);
  if (!workflow || !role) {
    throw new Error("Invalid workflow or role for engagement context");
  }
  const hints = collectRoleHints(ids, input.roleId);
  const workflowLabel =
    workflows.length > 1
      ? workflows.map((w) => w.name).join(", ")
      : workflow.name;
  const allSystems = [...new Set(workflows.flatMap((w) => w.typicalSystems))];

  return {
    sections: [
      {
        id: "objective",
        title: "Interview objective",
        content: `Establish a fact-based view of how ${role.name} executes ${workflows.length > 1 ? "these workflows" : `"${workflow.name}"`}: ${workflowLabel}. Cover specific steps, systems, pain points, and handoffs across all selected processes. ${input.level === "validation" ? "Validate Phase 1 hypotheses." : "Build foundation for process mapping."}`,
      },
      {
        id: "role_snapshot",
        title: "Role snapshot",
        content: `${role.description} In ${workflows.length > 1 ? "these workflows" : "this workflow"}, clarify daily touchpoints with: ${allSystems.join(", ")}.`,
      },
      {
        id: "known_facts",
        title: "What we already know",
        content: "From reference materials and prior diagnostic work:",
        bullets: [
          ...workflows.map((w) => `[${w.name}] ${w.seedContext}`),
          `Typical systems: ${allSystems.join(", ")}`,
          "Add uploaded source context after generation with API key",
        ],
      },
      {
        id: "need_to_confirm",
        title: "What we need to confirm",
        content: "Validate these hypotheses during the interview:",
        bullets: [
          "Actual time allocation on this workflow (% of week)",
          "Volume (transactions/day or week)",
          "Exception/rework rate",
          "Where handoffs break down",
          ...hints.slice(0, 3),
        ],
      },
      {
        id: "primary_questions",
        title: "Primary questions",
        content: "Open with these core questions:",
        bullets: [
          ...workflows.flatMap((w) => [
            `[${w.name}] Walk me through the last time you handled this process, start to finish.`,
          ]),
          "What triggered that work item? Who else was involved?",
          "Which systems did you use at each step?",
          "Where did you wait on someone else?",
          "What would have made that case easy vs hard?",
          ...(hints.length ? hints : []),
        ],
      },
      {
        id: "follow_up_probes",
        title: "Follow-up probes",
        content: "Use STAR-style probes when answers are vague, hypothetical, or use \"we\" instead of \"I\":",
        bullets: [
          "Can you walk me through a specific example from the past 2 weeks?",
          "What was the situation, who was involved and what was the objective?",
          "What did you personally do, and what led you to that decision?",
          "What was the outcome? How did you know it worked or didn't?",
          "Roughly how long did that step take?",
          "What workarounds do you use when the system doesn't support you?",
          "What information was missing when you received the request?",
        ],
      },
      {
        id: "pain_points_to_test",
        title: "Pain points to test",
        content: "Probe for specific friction in this workflow:",
        bullets: hints.length
          ? hints
          : ["Manual rework", "Incomplete intake", "System switching", "Reactive vs proactive work"],
      },
      {
        id: "systems_references",
        title: "Systems & process references",
        content: "Ask about concrete usage in each system:",
        bullets: allSystems.map((s) => `Probe usage and pain points in ${s}`),
      },
      {
        id: "evidence_to_capture",
        title: "Evidence to capture",
        content: "Collect quantifiable evidence where possible:",
        bullets: [
          "Minutes per transaction / case",
          "Weekly volume",
          "Rework rate or % incomplete intake",
          "Screenshots or queue names if offered",
        ],
      },
      {
        id: "fact_base_sizing",
        title: "Fact-base & value sizing",
        content: "Data requirements for downstream value model (survey v6 / initiative sizing):",
        bullets: [
          "% of role time spent on this workflow (self-reported + manager estimate)",
          "Transactions or cases per week",
          "Average handle time per case",
          "Rework / exception rate (%)",
          "Headcount or FTE dedicated to this workflow",
          "Cost drivers: overtime, vendor fees, credit memos, etc.",
          "Seasonality (e.g. Fall peak impact on volume)",
        ],
      },
      {
        id: "likely_outputs",
        title: "Likely outputs",
        content: "This interview should produce:",
        bullets: [
          "Validated swim-lane steps for process map",
          "Pain point list with severity",
          "Fact-base fields for value model",
        ],
      },
      {
        id: "dependencies_handoffs",
        title: "Dependencies & handoffs",
        content: `Map handoffs between ${role.pod} and upstream/downstream pods in this workflow.`,
        bullets: ["Who gives you work?", "Who do you pass work to?", "Where do requests get stuck?"],
      },
      {
        id: "red_flags",
        title: "Red flags & contradictions",
        content: "Listen for inconsistencies with prior materials:",
        bullets: [
          "Process described differently from support teams PDF",
          "Metrics that don't match survey data",
          "Workarounds that suggest system gaps",
        ],
      },
      {
        id: "closeout",
        title: "Closeout & validation",
        content: "Closing block (~5–10 min): answer SME questions, confirm gaps, agree follow-ups.",
        bullets: [
          "Anything we didn't ask that we should know?",
          "Who else should we speak with about this workflow?",
          "Can we follow up on one example you mentioned?",
          "What would success look like if we fixed the top pain point you described?",
          "What can you tell us that no one else on the team would?",
        ],
      },
    ],
  };
}
