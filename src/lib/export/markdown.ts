import type { InterviewGuide } from "@/types/guide";
import { getEngagementLabel } from "@/data/engagement-context";

export function guideToMarkdown(guide: InterviewGuide): string {
  const lines: string[] = [
    `# Interview Guide: ${guide.workflowName}`,
    "",
    `**Role:** ${guide.roleName}  `,
    `**Level:** ${guide.level}  `,
    `**Status:** ${guide.reviewStatus} (draft, validate before field use)  `,
  ];

  if (guide.companyName && guide.industryId && guide.functionId) {
    lines.push(
      `**Context:** ${getEngagementLabel({
        companyName: guide.companyName,
        industryId: guide.industryId,
        functionId: guide.functionId,
      })}  `,
    );
  }

  lines.push(
    `**Generated:** ${new Date(guide.updatedAt).toLocaleString()}`,
    "",
    "---",
    "",
  );

  for (const section of guide.sections) {
    lines.push(`## ${section.title}`, "");
    if (section.content?.trim()) {
      lines.push(section.content.trim(), "");
    }
    if (section.bullets?.length) {
      for (const b of section.bullets) {
        lines.push(`- ${b}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

export function downloadMarkdown(guide: InterviewGuide) {
  const md = guideToMarkdown(guide);
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `interview-guide-${guide.workflowId}-${guide.roleId}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
