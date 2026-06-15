"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { FileUp, Loader2, X } from "lucide-react";
import { useGuideStore } from "@/store/guide-store";
import { extractTextFromFile } from "@/lib/ingest/extract-text";

export function SourcePanel() {
  const { sources, addSource, removeSource } = useGuideStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setUploadError(null);

    for (const file of Array.from(files)) {
      try {
        const text = await extractTextFromFile(file);
        addSource({
          id: uuidv4(),
          name: file.name,
          type: file.type || file.name.split(".").pop() || "file",
          uploadedAt: new Date().toISOString(),
          extractedText: text,
          charCount: text.length,
        });
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : "Upload failed");
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="section-card overflow-hidden">
      <div className="px-4 py-3 section-card-header">
        <h2 className="text-sm font-semibold text-[var(--text)]">
          Source context
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Fed into the LLM prompt at generation time
        </p>
      </div>

      <div className="p-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-[var(--border-strong)] rounded-md py-3 text-sm text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="h-4 w-4" />
          )}
          Upload .txt / .md / .csv
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.md,.csv,.json"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {uploadError && (
          <p className="text-xs text-red-600 mt-2">{uploadError}</p>
        )}

        <div className="mt-4 space-y-3">
          {sources.length === 0 && (
            <p className="text-xs text-[var(--text-muted)] italic leading-relaxed">
              No sources — guide uses BSN catalog + McKinsey frameworks only.
              <Link href="/#how-it-works" className="text-[var(--accent)] ml-1 hover:underline">
                Learn more
              </Link>
            </p>
          )}
          {sources.map((s) => (
            <div
              key={s.id}
              className="border border-[var(--border)] rounded-md p-3 bg-[rgba(6,8,15,0.5)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="source-chip">{s.name}</span>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    {s.charCount.toLocaleString()} chars extracted
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeSource(s.id)}
                  className="text-[var(--text-muted)] hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-3 font-mono leading-relaxed">
                {s.extractedText.slice(0, 300)}
                {s.extractedText.length > 300 ? "…" : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
