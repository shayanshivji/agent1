"use client";

import { useState } from "react";
import { Download, FileText, Save } from "lucide-react";
import { useGuideStore } from "@/store/guide-store";
import { downloadMarkdown } from "@/lib/export/markdown";

export function ExportBar() {
  const { guide, versions, saveVersion, loadVersion } = useGuideStore();
  const [versionLabel, setVersionLabel] = useState("");

  if (!guide) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4 mt-6">
      <button
        type="button"
        onClick={() => downloadMarkdown(guide)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[var(--mck-navy)] text-white rounded-md hover:opacity-90"
      >
        <Download className="h-4 w-4" />
        Export Markdown
      </button>

      <button
        type="button"
        onClick={() => {
          saveVersion(versionLabel.trim() || undefined);
          setVersionLabel("");
        }}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--border-strong)] rounded-md hover:bg-[var(--bg)]"
      >
        <Save className="h-4 w-4" />
        Save version
      </button>

      {versions.length > 0 && (
        <div className="flex items-center gap-2 ml-auto">
          <FileText className="h-4 w-4 text-[var(--text-muted)]" />
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) loadVersion(e.target.value);
            }}
            className="text-sm border border-[var(--border)] rounded-md px-2 py-1.5 bg-white"
          >
            <option value="">Load saved version…</option>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
