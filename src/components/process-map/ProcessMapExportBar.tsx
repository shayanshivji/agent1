"use client";

import { Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { useProcessMapStore } from "@/store/process-map-store";
import {
  downloadProcessMapCsv,
  downloadProcessMapJson,
  downloadProcessMapMarkdown,
} from "@/lib/export/process-map";

export function ProcessMapExportBar() {
  const { document } = useProcessMapStore();
  if (!document) return null;

  return (
    <div className="section-card p-3 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-[var(--text-muted)] mr-2">Export</span>
      <button
        type="button"
        onClick={() => downloadProcessMapMarkdown(document)}
        className="btn-secondary text-xs"
      >
        <FileText className="h-3.5 w-3.5" />
        Markdown
      </button>
      <button
        type="button"
        onClick={() => downloadProcessMapCsv(document)}
        className="btn-secondary text-xs"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        CSV
      </button>
      <button
        type="button"
        onClick={() => downloadProcessMapJson(document)}
        className="btn-primary text-xs"
      >
        <FileJson className="h-3.5 w-3.5" />
        Pipeline JSON (Agent 4)
      </button>
      <a
        href="/agents/improvement-initiatives/workspace"
        className="btn-secondary text-xs ml-auto"
      >
        <Download className="h-3.5 w-3.5" />
        Open Initiatives Agent
      </a>
    </div>
  );
}
