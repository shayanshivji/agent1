"use client";

import { useState } from "react";
import { Download, FileText, FileType, Save } from "lucide-react";
import { useGuideStore } from "@/store/guide-store";
import { downloadMarkdown } from "@/lib/export/markdown";
import { downloadDocx } from "@/lib/export/docx";
import { downloadPdf } from "@/lib/export/pdf";

export function ExportBar() {
  const { guide, versions, saveVersion, loadVersion } = useGuideStore();
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!guide) return null;

  async function handleExport(
    type: "md" | "docx" | "pdf",
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
          onClick={() => saveVersion()}
          className="btn-secondary ml-auto"
        >
          <Save className="h-4 w-4" />
          Save version
        </button>

        {versions.length > 0 && (
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) loadVersion(e.target.value);
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
        PDF opens a print dialog, choose &quot;Save as PDF&quot; in your browser.
      </p>
    </div>
  );
}
