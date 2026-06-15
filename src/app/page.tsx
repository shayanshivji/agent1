import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Layers,
  Sparkles,
} from "lucide-react";

const AGENTS = [
  {
    id: 1,
    name: "Interview Guide Creation",
    status: "live" as const,
    href: "/guide",
    description:
      "Generate role-specific SME interview guides from workflow context and source materials.",
  },
  {
    id: 2,
    name: "Live Interview",
    status: "planned" as const,
    description: "Conduct structured SME sessions with real-time probing.",
  },
  {
    id: 3,
    name: "Process Mapping",
    status: "planned" as const,
    description: "Map current-state workflows from interview evidence.",
  },
  {
    id: 4,
    name: "Improvement Initiatives",
    status: "planned" as const,
    description: "Identify and size improvement opportunities.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Configure",
    body: "Pick workflow, role, and interview level. Add notes or upload source docs.",
  },
  {
    step: "2",
    title: "Generate",
    body: "The agent synthesizes BSN seed data, McKinsey interview frameworks, and your uploads into 13 structured sections.",
  },
  {
    step: "3",
    title: "Edit & validate",
    body: "Review inline, regenerate individual sections, mark draft status before field use.",
  },
  {
    step: "4",
    title: "Export",
    body: "Download Markdown for the consulting team or SME prep pack.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="consulting-header">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/50">
              Varsity Brands · BSN Sports Diagnostic
            </p>
            <p className="text-sm font-medium text-white/90">
              Agentic PE Growth Diagnostic
            </p>
          </div>
          <Link
            href="/guide"
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            Open Agent 1 →
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-white border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-4">
              Agent 1 · Interview Guide Creation
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold text-[var(--mck-navy)] leading-tight max-w-3xl">
              Structured interview guides for BSN sales support diagnostics
            </h1>
            <p className="mt-5 text-lg text-[var(--text-muted)] max-w-2xl leading-relaxed">
              Prepare consultants before SME sessions. Select a workflow and
              role, optionally upload context, and get a consulting-grade guide
              — not a chatbot answer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--mck-navy)] text-white text-sm font-semibold rounded-md hover:opacity-90 transition-opacity"
              >
                Create interview guide
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--border-strong)] text-sm font-medium rounded-md hover:bg-[var(--bg)] transition-colors"
              >
                How generation works
              </a>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold text-[var(--mck-navy)] mb-2">
            How the guide is created
          </h2>
          <p className="text-[var(--text-muted)] mb-10 max-w-2xl">
            When you click Generate, the app calls{" "}
            <code className="text-xs bg-[var(--bg)] px-1.5 py-0.5 rounded">
              /api/generate-guide
            </code>
            . Two paths produce the output:
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="section-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-[var(--accent)]" />
                <h3 className="font-semibold text-[var(--mck-navy)]">
                  LLM mode
                </h3>
                <span className="text-[10px] uppercase tracking-wide bg-[var(--accent-soft)] text-[var(--accent)] px-2 py-0.5 rounded-full">
                  With API key
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                If <code className="text-xs">OPENAI_API_KEY</code> is set,
                OpenAI receives a structured prompt built from: BSN workflow/role
                catalog, role-specific probes (e.g. ME57/ME58 for NSP/Purchasing),
                McKinsey interview frameworks (STAR probing, IDP-style diagnostic
                questions), your custom notes, and extracted text from uploaded
                sources. The model returns JSON with 13 guide sections.
              </p>
            </div>

            <div className="section-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-5 w-5 text-[var(--text-muted)]" />
                <h3 className="font-semibold text-[var(--mck-navy)]">
                  Template mode
                </h3>
                <span className="text-[10px] uppercase tracking-wide bg-[var(--bg)] text-[var(--text-muted)] px-2 py-0.5 rounded-full border">
                  No API key
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Without an API key, the app uses{" "}
                <code className="text-xs">templateGuide()</code> — a deterministic
                template that merges BSN seed context and role-specific hints
                from{" "}
                <code className="text-xs">src/data/bsn-catalog.ts</code>. Same
                13-section structure, but less tailored to uploaded sources.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <div key={s.step} className="section-card p-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--mck-navy)] text-white text-sm font-semibold mb-3">
                  {s.step}
                </span>
                <h3 className="font-semibold text-[var(--mck-navy)] mb-1">
                  {s.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border-y border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <h2 className="text-2xl font-semibold text-[var(--mck-navy)] mb-2">
              Agent roster
            </h2>
            <p className="text-[var(--text-muted)] mb-8">
              Modular architecture — each agent is a separate module. Only Agent 1
              is live today.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  className={`section-card p-5 ${agent.status === "live" ? "ring-2 ring-[var(--accent)] ring-offset-2" : "opacity-70"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      Agent {agent.id}
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        agent.status === "live"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-[var(--bg)] text-[var(--text-muted)] border"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[var(--mck-navy)]">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {agent.description}
                  </p>
                  {agent.href && (
                    <Link
                      href={agent.href}
                      className="inline-flex items-center gap-1 text-sm text-[var(--accent)] mt-3 hover:underline"
                    >
                      Open <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="section-card p-6 flex flex-col md:flex-row gap-6 items-start">
            <FileText className="h-8 w-8 text-[var(--accent)] shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-[var(--mck-navy)] mb-2">
                Grounded in McKinsey interview frameworks
              </h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Prompts incorporate principles from McKinsey behavioral interview
                training (STAR probing, structured intro/core/close), IDP executive
                diagnostic questions, and competency-based guide logic. Reference
                decks are in{" "}
                <code className="text-xs bg-[var(--bg)] px-1 rounded">
                  reference/mckinsey-interview-guides/
                </code>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>BSN Sports · Sales Support Diagnostic</span>
          <Link href="/guide" className="hover:text-[var(--accent)]">
            Agent 1 →
          </Link>
        </div>
      </footer>
    </div>
  );
}
