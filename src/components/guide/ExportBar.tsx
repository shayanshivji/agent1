"use client";

import { useState } from "react";
import { Download, FileJson, FileText, FileType, Save } from "lucide-react";
import { useGuideStore } from "@/store/guide-store";
import { guideToHandoffPayload } from "@/lib/pipeline/guide-handoff";
import { downloadMarkdown } from "@/lib/export/markdown";
import { downloadDocx } from "@/lib/export/docx";
import { downloadPdf } from "@/lib/export/pdf";
import { downloadFile } from "@/lib/export/initiatives";

export function ExportBar() {
  const { guide, versions, saveVersion, loadVersion } = useGuideStore();
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [loadedVersionId, setLoadedVersionId] = useState("");

  if (!guide) return null;

  async function handleExport(
    type: string,
    fn: () => void | Promise<void>,
  ) {
    setExporting(type);
    setExportError(null);
    try {
      await fn();
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="border-t border-[var(--border)] pt-4 mt-6">
      {exportError && <p className="error-banner text-xs mb-3">{exportError}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleExport("md", () => downloadMarkdown(guide))}
          disabled={!!exporting}
          className="btn-primary text-sm py-2"
        >
          <Download className="h-4 w-4" />
          Markdown
        </button>

        <button
          type="button"
          onClick={() => handleExport("docx", () => downloadDocx(guide))}
          disabled={!!exporting}
          className="btn-secondary"
        >
          <FileType className="h-4 w-4" />
          {exporting === "docx" ? "Exporting…" : "Word (.docx)"}
        </button>

        <button
          type="button"
          onClick={() => handleExport("pdf", () => downloadPdf(guide))}
          disabled={!!exporting}
          className="btn-secondary"
        >
          <FileText className="h-4 w-4" />
          PDF (print)
        </button>

        <button
          type="button"
          onClick={() =>
            handleExport("json", () =>
              downloadFile(
                guideToHandoffPayload(guide),
                `guide-handoff-${guide.workflowId}-${guide.roleId}.json`,
                "application/json",
              ),
            )
          }
          disabled={!!exporting}
          className="btn-secondary"
        >
          <FileJson className="h-4 w-4" />
          JSON handoff
        </button>

        <button type="button" onClick={() => saveVersion()} className="btn-secondary ml-auto">
          <Save className="h-4 w-4" />
          Save version
        </button>

        {versions.length > 0 && (
          <select
            value={loadedVersionId}
            onChange={(e) => {
              const id = e.target.value;
              setLoadedVersionId(id);
              if (id) loadVersion(id);
            }}
            className="field-input text-sm w-auto"
          >
            <option value="">Load version…</option>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        )}
      </div>
      <p className="text-[10px] text-[var(--text-muted)] mt-2">
        PDF opens a print dialog — choose &quot;Save as PDF&quot; in your browser. JSON handoff is for
        Agent 2 (Walter) pipeline paste.
      </p>
    </div>
  );
}
