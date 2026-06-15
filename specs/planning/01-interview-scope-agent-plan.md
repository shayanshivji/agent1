# Agent 01 — Interview Scope Agent · Detailed Build Plan

**Spec:** `specs/agents/01-interview-scope-agent.yaml`  
**Status:** Planned — **paused until Emanuele + Khalid aligned** (see `call-notes-2026-06-11.md`)  
**Build priority:** 1 (Week 2, not this week)  
**Strategy:** Connect to compendium + Jan/Feb subsections + v6 fact-base — build approval UI + gap detection only

---

## Executive summary

Agent 01 replaces the first 2–3 days of manual discovery scoping. It ingests Varsity Brands / BSN reference materials, proposes an in-scope workflow list by support pod, gates ED approval, then generates tailored interview guides and a **fact-base requirements list** that Agent 05 uses for value sizing.

For the BC sprint, this agent can run **immediately** against files in `reference/` without live client access.

---

## Success criteria (all stakeholders)

| Stakeholder | "Ship it" means |
|-------------|-----------------|
| **AP (Emmanuel)** | Workflow list covers MTS, TM, SSR, R+R at minimum; questions test compendium hypotheses; approves in one session |
| **BA** | Exports to usable Word doc; fact-base checklist ≥90% complete for v6 model inputs |
| **Partner** | Methodology defensible; not a generic ChatGPT question bank |
| **Client SME** | Pod names and tasks match support teams PDF; 30-min validation feels accurate |
| **EM** | Day 1–2 deliverable hit; clear status on pending ED approval |
| **Data Engineer** | Every workflow has `source_citations[]`; materials versioned |
| **Software Engineer** | Approval gate enforced in API; prompts versioned; eval on VB fixture |
| **UX/UI** | ED approves workflows in ≤3 clicks; citations visible per workflow |
| **CTO** | Workflows tagged with systems (Engage, QOE, TAL, SAP) |
| **COO** | Fin Serv / order-release workflows included if in scope |
| **Senior Partner** | Reusable config for next portco (company + function_types swap) |

---

## Functional design

### Step 1 — Ingest context

**Inputs:**
- `company_name`: "Varsity Brands — BSN Sports"
- `function_types`: `["sales_support"]` (+ sub-functions per pod)
- `client_materials`: all files in `reference/client-materials/`, `reference/decks/`, optionally `reference/models/`

**Processing:**
- Parse PDF, PPTX, XLSX into chunked text with metadata (`doc_id`, `page`, `section`)
- Extract entities: pod names, systems, pain point phrases, metrics (e.g., "25% incomplete intake")

**VB seed extraction (known from reference):**

| Pod | Key workflows to surface | Primary source |
|-----|-------------------------|----------------|
| TM | Quotes/carts, stock checks, hard goods research, VOE/QOE | support teams PDF |
| SSR | Order mgmt, MTS changes, tracking, holds, PO corrections | support teams PDF |
| MTS Pod | Shop build, intake, artwork, inventory filter | compendium + process maps |
| R+R Pod | Returns, replacements, case mgmt | support teams PDF |
| Comp Pod | Nike/UA comp, 4R rewards | support teams PDF |
| Fin Serv | AR, credit, collections, quick release | support teams PDF |

### Step 2 — Pull workflows

**Logic:**
1. Match extracted entities against workflow pattern library (McKinsey KB when available; interim: rules from support teams PDF boundaries)
2. De-duplicate and cluster by E2E process (e.g., "MTS shop launch" spans MTS Pod + SSR + FSP)
3. Score relevance to stated hypotheses (MTS go-live rate, intake completeness, manual build time)
4. Output ranked list with confidence + citations

**Output schema (draft):**
```yaml
workflow:
  id: mts-shop-build
  name: MTS Shop Build & Launch
  pod: MTS Pod
  e2e: true
  related_pods: [MTS Pod, SSR, FSP]
  systems: [TAL, QOE, VOE, Engage]
  confidence: 0.92
  source_citations:
    - doc: reference/decks/20260410_BSN_Phase-1-compendium.pptx
      excerpt: "25% intake forms incomplete"
  preliminary_pain_points: [...]
```

### Step 3 — Human approval gate ⚠️

**UI requirements (UX/UI lens):**
- Table: workflow name | pod | confidence | sources | include/exclude checkbox
- Inline edit name/description
- Add workflow manually
- "Approve & continue" disabled until ED explicitly confirms
- Audit log: who approved, when, what changed

**AP lens:** ED sees hypothesis tag per workflow (e.g., `#lead-readiness`, `#manual-rework`)

### Step 4 — Build interview guide

**Per approved workflow, generate:**
- Opening context script (2 min)
- 15–25 questions organized by: process steps, handoffs, pain, volume/timing, exceptions, systems, workarounds
- Probe bank for vague answers (feeds Agent 02)
- "Do not ask" list (leading questions on unvalidated assumptions)

**Question quality rules:**
- Reference BSN terminology (FSP, MTS+, TAL, Engage queue emails)
- Include quantification prompts aligned with fact-base ("What % of intake forms come back incomplete?")
- SME seniority adaptation (frontline vs manager)

### Step 5 — Output fact base

**For each workflow, list required facts for Agent 05:**

| Field type | Examples |
|------------|----------|
| Volume | Shops built/week, orders/day, cases/day |
| Time | Minutes per shop build, cycle time order-to-ship |
| FTE | Pod headcount, offshore split |
| Rate | Error/rework rate, go-live rate, incomplete intake rate |
| Cost | Loaded salary, offshore discount |
| System | Tools used per step |

Cross-reference `reference/models/survey-data-analysis-v6.xlsx` Inputs tab — flag fields already known vs gaps for interview.

---

## Technical architecture (pre-build)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Reference docs  │────▶│ Ingestion + RAG  │────▶│ Workflow ranker │
│ (reference/)    │     │ (chunk + embed)  │     │ (LLM + rules)   │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                           │
                        ┌──────────────────┐               ▼
                        │ ED Approval UI   │◀──── Draft workflow list
                        └────────┬─────────┘
                                 │ approved
                                 ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │ Guide generator  │────▶│ Fact-base gen   │
                        │ (LLM + templates)│     │ (structured)    │
                        └──────────────────┘     └────────┬────────┘
                                                           │
                                                           ▼
                                                  Export DOCX + JSON
                                                  → Agent 02, Agent 05
```

**Data Engineer notes:**
- Store runs in `engagements/{id}/agent-01/{run_id}/`
- Immutable approved snapshot after gate
- JSON is source of truth; DOCX is export

**Software Engineer notes:**
- v1: Next.js API routes on Vercel, no agent runtime until approved
- Prompts in `prompts/agent-01/`
- Golden eval: compare workflow list to compendium workstreams (recall ≥95%)

---

## Evaluation plan (before production)

| Test | Method | Pass threshold |
|------|--------|----------------|
| Workflow recall | Compare output to compendium + support PDF pods | ≥95% pods covered |
| Citation accuracy | Manual BA review of 10 workflows | 100% valid citations |
| Guide quality | AP blind review vs manual guide | 80%+ no major rework |
| Fact-base completeness | Compare to v6 Inputs tab fields | ≥90% mapped |
| Approval gate | Attempt API skip | Must fail |

---

## Risks & mitigations

| Risk | Stakeholder | Mitigation |
|------|-------------|------------|
| Generic questions | AP, Client | Ground in citations + VB terminology rules |
| Missing Fin Serv workflows | COO | Explicit pod checklist in pull_workflows |
| PPTX parse failures | Data Engineer | Fallback manual seed list in spec |
| ED bottleneck on approval | EM | Pre-read async; 60-min approval session scheduled Day 1 |
| Wrong McKinsey template | BA, Partner | Request firm template before export build |
| Client data on Vercel | Senior Partner, CTO | Reference materials only for BC; no PII |

---

## Open decisions (resolve before build)

| ID | Question | Recommended default | Owner |
|----|----------|---------------------|-------|
| OD-01-001 | Sales support only or adjacent functions? | Sales support pods only for BC | AP |
| OD-01-002 | IndexAI vs custom RAG | Custom RAG on `reference/` for BC; IndexAI for KKR phase | You + EM |
| OD-01-003 | Role-play vs client SMEs | Role-play for BC; same agent config | EM |

---

## Implementation phases (when approved)

### Phase A — Spec validation (0.5 day)
- [ ] AP reviews workflow seed list
- [ ] Receive McKinsey interview guide template
- [ ] Confirm v6 Inputs tab mapping

### Phase B — Core pipeline (2–3 days)
- [ ] Document ingestion for PDF/PPTX/XLSX
- [ ] Workflow ranker with VB rules + RAG
- [ ] Approval UI mock → functional
- [ ] Guide + fact-base generator
- [ ] JSON + basic DOCX export

### Phase C — Eval & hardening (1 day)
- [ ] Golden eval against reference materials
- [ ] ED walkthrough with Emmanuel
- [ ] Prompt iteration from feedback

### Phase D — Handoff (0.5 day)
- [ ] Document Agent 02 input contract
- [ ] Document Agent 05 fact-base contract

**Total estimate:** 4–5 days once McKinsey template + scope confirmed

---

## McKinsey resources needed before Phase B

See `mckinsey-resources-needed.md` Priority 1:
- Workflow / discovery taxonomy
- Interview guide Word template
- IndexAI / ingestion pattern (even if deferred to KKR phase)

**When you have a contact:** e.g. "Colin on ProcessAI" or "GM&S knowledge team for interview guides" — share what they provide and we'll patch this plan.

---

## Approval checklist

- [ ] EM — timeline and staffing OK
- [ ] AP/ED — workflow seed list and hypotheses OK
- [ ] BA — fact-base → v6 mapping OK
- [ ] You — ready to resume scaffold and start Phase B

**Do not start coding until:**
- [ ] Emanuele + Khalid sign `connect-vs-build-matrix.md`
- [ ] Compendium walkthrough done; Jan/Feb folders in `reference/study-corpus/`
- [ ] Agent vs study gap analysis complete
