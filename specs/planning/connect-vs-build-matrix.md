# Connect vs Build Matrix

**Rule:** If an existing McKinsey, client, or JK Tech solution covers ≥80% of an agent step, **integrate it**. Build only the orchestration layer, human review gates, and gaps.

**Gate:** Emanuele + Khalid must sign off on this matrix before Week 2 agent build starts.

> **Architecture update (Recording 189):** Agents reorganized — see `agent-architecture-v2.md`.  
> Key merges: slide 4+5 → Initiative Generator; slide 6+7 → Value & Horizons; slide 8 → Future State (design phase only).

---

## Agent 01 — Interview Scope

| Step | Build from scratch? | Connect to | Notes |
|------|---------------------|------------|-------|
| Ingest client materials | ❌ | IndexAI / firm doc ingestion OR lightweight parser on `reference/` | Ask Khalid which is BC-approved |
| Pull workflows | ❌ | Compendium + support teams PDF + Jan/Feb subsections | Study already scoped workflows |
| Interview guides | ❌ | Firm template + compendium hypotheses + JK Tech content | Agent tailors, not writes from zero |
| Fact-base requirements | ⚠️ Hybrid | v6 model Inputs tab defines required fields | Agent maps gaps only |
| ED approval UI | ✅ Build | Custom review gate | Thin UI — workflow checklist + approve |
| Export | ❌ | Firm Word template | |

**Verdict:** Mostly **connect + orchestrate**. Build = approval UI + gap detection.

---

## Agent 02 — Live Interview

| Step | Build from scratch? | Connect to | Notes |
|------|---------------------|------------|-------|
| Live AI interview | ⚠️ Defer | Firm AI interview policy TBD | **Call: no full recordings; have subsections** |
| Ingest existing subsections | ❌ | Jan/Feb folder corpus | May skip live interview for BC |
| Transcript structuring | ⚠️ Hybrid | LLM summarization on subsections | Only if subsections unstructured |
| Escalation to human | ✅ Build | Notification + queue | Thin |

**Verdict:** **Defer live interview for BC.** Connect subsection inputs → Agent 03 directly. Revisit for KKR client deployment.

---

## Agent 03 — Current-State Process Mapping

| Step | Build from scratch? | Connect to | Notes |
|------|---------------------|------------|-------|
| Process map generation | ❌ | **ProcessAI** | Core engine — do not rebuild |
| Pain point extraction | ❌ | ProcessAI + compendium baseline | Validate against existing |
| Validation baseline | ❌ | `20260324_BSN_Process-Maps.pptx` | Diff, not regenerate blind |
| JK handwritten notes | ❌ | JK Tech access (Khalid) | OCR/ingest if available |
| Source traceability | ✅ Build | Citation layer on ProcessAI output | Thin linking layer |
| Export | ❌ | Firm Visio/PPT templates | |

**Verdict:** **ProcessAI + validation layer.** Build = traceability + ED review UI.

---

## Agent 04 — Future-State Workflow

| Step | Build from scratch? | Connect to | Notes |
|------|---------------------|------------|-------|
| Initiative generation | ❌ | Compendium + v6 initiative tab + JK Tech | Extend, dedupe in-flight |
| Future-state maps | ❌ | ProcessAI redesign + compendium bold vision slides | |
| Delta view | ⚠️ Hybrid | ProcessAI or template-based diff | |
| Build plans / BRD | ❌ | Firm BRD template + JK Tech sections | Agent populates sections |
| H1/H2/H3 classification | ⚠️ Hybrid | Compendium horizon tags | |

**Verdict:** Mostly **connect**. Build = initiative dedup + approval gate + BRD population.

---

## Agent 05 — Value Modeling

| Step | Build from scratch? | Connect to | Notes |
|------|---------------------|------------|-------|
| Productivity sizing | ❌ | **v6 survey model** (ground truth) | Agent updates cells, not new logic |
| Cleansheet | ❌ | Cleansheet AI if applicable | Ask Emanuele — may not apply |
| Benchmarks | ❌ | Firm KB / v6 Inputs tab | |
| Sensitivity / ranges | ⚠️ Hybrid | Excel logic from v6 | Replicate formulas, don't reinvent |
| Assumption log | ✅ Build | Structured UI on top of model | |
| Export | ❌ | v6 xlsx as shell | |

**Verdict:** **v6 model is source of truth.** Build = assumption UI + gap fill from fact-base.

---

## Agent 04 — Initiative Generator *(NEW — merged slide 4+5)*

| Step | Build from scratch? | Connect to | Notes |
|------|---------------------|------------|-------|
| Generate initiatives from pain points | ⚠️ Hybrid | Compendium initiatives + v6 tab + LLM | Not laundry list — horizons structure |
| Map initiative → pain_point_id | ✅ Build | Linking layer on Agent 3 output | Was separate agent 5 on slide |
| In-flight dedup | ⚠️ Hybrid | Compendium "initiatives in progress" | Human validates |
| Pressure-test chat | ✅ Build | LLM interface at review gate | Shayan's prior agent UX pattern |
| Horizon bucketing | ⚠️ TBD | Agent 4 or 5? — ask Emmanuel | |

**Verdict:** **Build linking + review UI.** Connect compendium/v6 as seeds.

---

## Agent 05 — Value & Horizons *(MERGED slide 6+7 — replaces old 05+06)*

| Step | Build from scratch? | Connect to | Notes |
|------|---------------------|------------|-------|
| Productivity sizing | ❌ | **v6 model logic** (sanitized) | Emmanuel sharing sanitized version |
| Survey baseline | ❌ | **Existing v6 survey template** | Human runs — NOT an agent |
| Initiative → activity mapping | ⚠️ Hybrid | LLM suggests, **human confirms** | Emmanuel: critical HITL |
| Feasibility scoring | ⚠️ Hybrid | v6 feasibility labels + compendium | |
| Horizons roadmap HTML | ✅ Build | Match compendium horizons page | Khalid input on format |
| Workflow per horizon | ⚠️ TBD | v1 scope? | Emmanuel to confirm |
| Use-case repository | ❌ | Sanitized v6 + prior engagements | Agent generates new + matches known |

**Verdict:** **Embed v6 math.** Build horizons UI + mapping confirmation workflow.

---

## Agent 06 — Future State *(slide 8 — DESIGN PHASE ONLY)*

| Step | Build from scratch? | Connect to | Notes |
|------|---------------------|------------|-------|
| To-be workflows | ❌ | ProcessAI redesign | Selected initiatives ONLY |
| Delta view | ⚠️ Hybrid | Agent 3 as-is maps | |
| Build plans / BRD | ❌ | Firm BRD template + JK Tech | |
| Run on all initiatives | ❌ N/A | Human selects subset first | Post-diagnostic gate |

**Verdict:** Moved from diagnostic. **Connect ProcessAI + templates.** Build selection gate.

---

## ~~Agent 06 — Execution Roadmap~~ (DEPRECATED)

Merged into **Agent 05 — Value & Horizons**. Do not build standalone roadmap agent.

---

## Platform & hosting

| Layer | Build from scratch? | Connect to | Notes |
|-------|---------------------|------------|-------|
| Dev prototype | ✅ | Vercel | This week/next — team only |
| Production | ❌ | McKinsey internal platform | Design migration from day 1 |
| Auth | ❌ | McK SSO | Placeholder auth on Vercel only |
| Data store | ⚠️ Hybrid | Supabase (dev) → firm store (prod) | Engagement-scoped isolation |
| Agent orchestration | ✅ | Custom state machine | Reads YAML specs; calls connected services |
| Long-running jobs | ✅ | Queue (e.g. Inngest / firm equivalent) | ProcessAI batch, large doc ingest |

---

## Sign-off

| Reviewer | Connect-vs-build OK? | Date | Notes |
|----------|---------------------|------|-------|
| Emanuele | ⬜ | | |
| Khalid | ⬜ | | |
| EM | ⬜ | | |

**No agent implementation until both Emanuele and Khalid rows are checked.**
