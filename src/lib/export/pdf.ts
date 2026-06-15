import type { InterviewGuide } from "@/types/guide";
import { getEngagementLabel } from "@/data/engagement-context";

function guideToPrintHtml(guide: InterviewGuide): string {
  const engagement =
    guide.companyName && guide.industryId && guide.functionId
      ? getEngagementLabel({
          companyName: guide.companyName,
          industryId: guide.industryId,
          functionId: guide.functionId,
        })
      : "";

  const sections = guide.sections
    .map((s) => {
      const bullets = s.bullets?.length
        ? `<ul>${s.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
        : "";
      const content = s.content?.trim()
        ? `<p>${escapeHtml(s.content.trim())}</p>`
        : "";
      return `<section><h2>${escapeHtml(s.title)}</h2>${content}${bullets}</section>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Interview Guide: ${escapeHtml(guide.workflowName)}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; max-width: 720px; margin: 40px auto; color: #0f172a; line-height: 1.5; }
    h1 { font-size: 22px; border-bottom: 2px solid #051c2c; padding-bottom: 8px; }
    h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #1e3a5f; margin-top: 24px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    ul { margin: 8px 0 16px; padding-left: 20px; }
    li { margin-bottom: 6px; font-size: 13px; }
    p { font-size: 13px; margin: 8px 0; }
    @media print { body { margin: 24px; } }
  </style>
</head>
<body>
  <h1>Interview Guide: ${escapeHtml(guide.workflowName)}</h1>
  <div class="meta">
    <div><strong>Role:</strong> ${escapeHtml(guide.roleName)}</div>
    <div><strong>Level:</strong> ${escapeHtml(guide.level.replace("_", " "))}</div>
    <div><strong>Status:</strong> ${escapeHtml(guide.reviewStatus)}, validate before field use</div>
    ${engagement ? `<div><strong>Context:</strong> ${escapeHtml(engagement)}</div>` : ""}
    <div><strong>Generated:</strong> ${escapeHtml(new Date(guide.updatedAt).toLocaleString())}</div>
  </div>
  ${sections}
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function downloadPdf(guide: InterviewGuide) {
  const html = guideToPrintHtml(guide);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    URL.revokeObjectURL(url);
    throw new Error("Pop-up blocked, allow pop-ups to export PDF");
  }
  win.addEventListener("afterprint", () => URL.revokeObjectURL(url));
}
