"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import { BSN_PRESET } from "@/data/engagement-context";

export function NewProjectForm() {
  const router = useRouter();
  const createProject = useProjectStore((s) => s.createProject);
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const id = createProject({
      name: name.trim(),
      clientName: clientName.trim() || BSN_PRESET.companyName,
    });
    router.push(`/projects/${id}`);
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to cover
      </Link>

      <h1 className="text-2xl font-semibold text-gradient mb-2">Start new project</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        Create a dedicated workspace for this client study. All agent outputs will be saved to this
        project only.
      </p>

      <form onSubmit={handleSubmit} className="section-card p-6 space-y-5">
        <div>
          <label className="field-label">Project name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. BSN Sports — Sales Support Diagnostic"
            className="field-input"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="field-label">Client name</label>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder={BSN_PRESET.companyName}
            className="field-input"
          />
        </div>
        <button type="submit" disabled={submitting || !name.trim()} className="btn-primary w-full justify-center">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create project & open dashboard"}
        </button>
      </form>
    </div>
  );
}
