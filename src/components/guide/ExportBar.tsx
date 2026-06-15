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
      {exportError && (
        <p className="text-xs text-red-600 mb-3">{exportError}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleExport("md", () => downloadMarkdown(guide))}
          disabled={!!exporting}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[var(--mck-navy)] text-white rounded-md hover:opacity-90 disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          Markdown
        </button>

        <button
          type="button"
          onClick={() => handleExport("docx", () => downloadDocx(guide))}
          disabled={!!exporting}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-[var(--border-strong)] rounded-md hover:bg-[var(--bg)] disabled:opacity-60"
        >
          <FileType className="h-4 w-4" />
          {exporting === "docx" ? "Exporting…" : "Word (.docx)"}
        </button>

        <button
          type="button"
          onClick={() => handleExport("pdf", () => downloadPdf(guide))}
          disabled={!!exporting}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-[var(--border-strong)] rounded-md hover:bg-[var(--bg)] disabled:opacity-60"
        >
          <FileText className="h-4 w-4" />
          PDF (print)
        </button>

        <button
          type="button"
          onClick={() => saveVersion()}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-[var(--border-strong)] rounded-md hover:bg-[var(--bg)] ml-auto"
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
            className="text-sm border border-[var(--border)] rounded-md px-2 py-1.5 bg-white"
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
        PDF opens a print dialog — choose &quot;Save as PDF&quot; in your browser.
      </p>
    </div>
  );
}
