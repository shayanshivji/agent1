import type { InterviewExecutionDocument } from "@/types/interview-execution";
import { CONFIDENCE_LABELS } from "@/types/interview-execution";
import { toAgent3Package } from "@/lib/interview-execution/logic";

export function interviewToMarkdown(doc: InterviewExecutionDocument): string {
  const lines: string[] = [
    `# Interview Intelligence: ${doc.roleName}`,
    "",
    `**Workflow:** ${doc.workflowName}`,
    `**Stakeholder:** ${doc.stakeholderName ?? doc.roleName}`,
    `**Mode:** ${doc.mode}`,
    `**Coverage:** ${doc.coverage.score}%`,
    `**Review status:** ${doc.reviewStatus}`,
    "",
    "## Executive summary",
    doc.executiveSummary,
    "",
    "## Process activities",
    ...doc.processActivities.map((a) => `- **${a.name}:** ${a.description}`),
    "",
    "## Workflow steps",
  ];

  for (const s of doc.workflowSteps.sort((a, b) => a.sequence - b.sequence)) {
    lines.push(
      `### ${s.sequence + 1}. ${s.name}`,
      s.description,
      `- Systems: ${s.systems.join(", ") || "N/A"}`,
      `- Confidence: ${CONFIDENCE_LABELS[s.confidence]}`,
      "",
    );
  }

  lines.push("## Pain points", "");
  for (const p of doc.painPoints) {
    lines.push(`- **${p.title}** (${p.severity}, ${CONFIDENCE_LABELS[p.confidence]}): ${p.description}`, "");
  }

  lines.push("## Handoffs", "");
  for (const h of doc.handoffs) {
    lines.push(`- **${h.fromRole} → ${h.toRole}:** ${h.description}`, "");
  }

  lines.push("## Open questions", "");
  for (const q of doc.openQuestions) {
    lines.push(`- [${q.priority}] ${q.question} — ${q.reason}`, "");
  }

  if (doc.contradictions.length) {
    lines.push("## Contradictions", "");
    for (const c of doc.contradictions) {
      lines.push(`- **${c.topic}**`, `  - A: ${c.statementA} (${c.sourceA})`, `  - B: ${c.statementB} (${c.sourceB})`, "");
    }
  }

  lines.push("## Evidence registry", "");
  for (const e of doc.evidenceRegistry) {
    lines.push(`- "${e.quote}" — ${e.source} (${CONFIDENCE_LABELS[e.confidence]})`, "");
  }

  return lines.join("\n");
}

export function interviewToCsv(doc: InterviewExecutionDocument): string {
  const headers = ["type", "title", "description", "severity", "confidence", "evidence"];
  const rows: string[][] = [];

  doc.workflowSteps.forEach((s) => {
    rows.push([
      "workflow_step",
      s.name,
      s.description,
      "",
      s.confidence,
      doc.evidenceRegistry.filter((e) => s.evidenceIds.includes(e.id)).map((e) => e.quote).join("|"),
    ]);
  });
  doc.painPoints.forEach((p) => {
    rows.push([
      "pain_point",
      p.title,
      p.description,
      p.severity,
      p.confidence,
      doc.evidenceRegistry.filter((e) => p.evidenceIds.includes(e.id)).map((e) => e.quote).join("|"),
    ]);
  });
  doc.handoffs.forEach((h) => {
    rows.push(["handoff", `${h.fromRole} → ${h.toRole}`, h.description, "", h.confidence, ""]);
  });

  return [headers.join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\n");
}

function csvCell(v: string): string {
  return `"${v.replace(/"/g, '""')}"`;
}

export function interviewToJson(doc: InterviewExecutionDocument): string {
  return JSON.stringify(doc, null, 2);
}

export function interviewToAgent3Package(doc: InterviewExecutionDocument): string {
  return JSON.stringify(toAgent3Package(doc), null, 2);
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadInterviewMarkdown(doc: InterviewExecutionDocument) {
  downloadFile(interviewToMarkdown(doc), `interview-${doc.workflowId}-${doc.roleId}.md`, "text/markdown");
}

export function downloadInterviewCsv(doc: InterviewExecutionDocument) {
  downloadFile(interviewToCsv(doc), `interview-${doc.workflowId}-${doc.roleId}.csv`, "text/csv");
}

export function downloadInterviewJson(doc: InterviewExecutionDocument) {
  downloadFile(interviewToJson(doc), `interview-${doc.workflowId}-${doc.roleId}.json`, "application/json");
}

export function downloadAgent3Package(doc: InterviewExecutionDocument) {
  downloadFile(interviewToAgent3Package(doc), `agent3-package-${doc.workflowId}.json`, "application/json");
}
