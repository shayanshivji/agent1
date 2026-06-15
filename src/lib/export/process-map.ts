import type { ProcessMapDocument } from "@/types/process-map";
import { IMPROVEMENT_BUCKET_LABELS, CONFIDENCE_LABELS } from "@/types/process-map";
import { toPipelineHandoff } from "@/lib/process-map/logic";

export function processMapToMarkdown(doc: ProcessMapDocument): string {
  const lines: string[] = [
    `# Current-State Process Map: ${doc.workflowName}`,
    "",
    `**Company:** ${doc.companyName ?? "N/A"}`,
    `**Purpose:** ${doc.purpose}`,
    "",
    doc.narrativeSummary,
    "",
    "## Actors",
    ...doc.actors.map((a) => `- ${a.name}`),
    "",
    "## Process steps",
  ];

  for (const phase of doc.phases.sort((a, b) => a.order - b.order)) {
    lines.push(`### ${phase.name}`, "");
    const phaseSteps = doc.steps.filter((s) => s.phaseId === phase.id).sort((a, b) => a.order - b.order);
    for (const step of phaseSteps) {
      const actor = doc.actors.find((a) => a.id === step.actorId)?.name ?? step.actorId;
      lines.push(
        `#### ${step.name}`,
        step.description,
        `- **Actor:** ${actor}`,
        `- **Systems:** ${step.systems.join(", ") || "N/A"}`,
        `- **Confidence:** ${CONFIDENCE_LABELS[step.confidence]}`,
        step.handoffTo ? `- **Handoff:** ${step.handoffTo}` : "",
        "",
      );
    }
  }

  lines.push("## Pain points", "");
  for (const p of doc.painPoints) {
    lines.push(`- **${p.title}** (${p.severity}): ${p.description}`, `  - Evidence: ${p.evidenceSnippet}`, "");
  }

  lines.push("## Improvement opportunities", "");
  for (const imp of doc.improvements) {
    lines.push(
      `- **${imp.title}** [${IMPROVEMENT_BUCKET_LABELS[imp.bucket]}] ${imp.impactRange ?? ""}`,
      `  ${imp.description}`,
      "",
    );
  }

  return lines.filter(Boolean).join("\n");
}

export function processMapToCsv(doc: ProcessMapDocument): string {
  const headers = [
    "phase",
    "step_name",
    "description",
    "actor",
    "systems",
    "confidence",
    "handoff",
    "pain_points",
  ];
  const rows = doc.steps.map((s) => {
    const phase = doc.phases.find((p) => p.id === s.phaseId)?.name ?? "";
    const actor = doc.actors.find((a) => a.id === s.actorId)?.name ?? "";
    const pains = doc.painPoints
      .filter((p) => p.processStepIds.includes(s.id))
      .map((p) => p.title)
      .join("|");
    return [
      csvCell(phase),
      csvCell(s.name),
      csvCell(s.description),
      csvCell(actor),
      csvCell(s.systems.join("|")),
      s.confidence,
      csvCell(s.handoffTo ?? ""),
      csvCell(pains),
    ].join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

function csvCell(v: string): string {
  return `"${v.replace(/"/g, '""')}"`;
}

export function processMapToJson(doc: ProcessMapDocument): string {
  return JSON.stringify(
    {
      sourceAgent: "process-mapping" as const,
      ...toPipelineHandoff(doc),
      fullDocument: doc,
    },
    null,
    2,
  );
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

export function downloadProcessMapMarkdown(doc: ProcessMapDocument) {
  downloadFile(processMapToMarkdown(doc), `process-map-${doc.workflowId}.md`, "text/markdown");
}

export function downloadProcessMapCsv(doc: ProcessMapDocument) {
  downloadFile(processMapToCsv(doc), `process-map-${doc.workflowId}.csv`, "text/csv");
}

export function downloadProcessMapJson(doc: ProcessMapDocument) {
  downloadFile(processMapToJson(doc), `process-map-${doc.workflowId}.json`, "application/json");
}
