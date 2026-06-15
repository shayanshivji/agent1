import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";
import type { InterviewGuide } from "@/types/guide";
import { getEngagementLabel } from "@/data/engagement-context";

export async function downloadDocx(guide: InterviewGuide) {
  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: `Interview Guide — ${guide.workflowName}`, bold: true })],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Role: ${guide.roleName}`, break: 1 }),
        new TextRun({ text: `Level: ${guide.level.replace("_", " ")}`, break: 1 }),
        new TextRun({ text: `Status: ${guide.reviewStatus} (validate before field use)`, break: 1 }),
      ],
    }),
  ];

  if (guide.companyName || guide.industryId) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: getEngagementLabel({
              companyName: guide.companyName ?? "Engagement",
              industryId: guide.industryId ?? "other",
              functionId: guide.functionId ?? "general_ops",
            }),
            italics: true,
            break: 1,
          }),
        ],
      }),
    );
  }

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated: ${new Date(guide.updatedAt).toLocaleString()}`,
          size: 20,
          break: 1,
        }),
      ],
    }),
    new Paragraph({ text: "" }),
  );

  for (const section of guide.sections) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: section.title, bold: true })],
      }),
    );

    if (section.content?.trim()) {
      children.push(new Paragraph({ children: [new TextRun(section.content.trim())] }));
    }

    if (section.bullets?.length) {
      for (const bullet of section.bullets) {
        children.push(
          new Paragraph({
            text: bullet,
            bullet: { level: 0 },
          }),
        );
      }
    }

    children.push(new Paragraph({ text: "" }));
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `interview-guide-${guide.workflowId}-${guide.roleId}.docx`);
}
