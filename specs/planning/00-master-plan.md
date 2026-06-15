# Master Plan — 6-Agent BC Pipeline

**Status:** Foundation week · **Build paused until Emanuele + Khalid aligned**  
**Client:** Varsity Brands (KKR portco) — BSN Sports (distributor: schools/consumers, customized team equipment)  
**Target:** 10-week diagnostic + design → 3 weeks via agentic workflow  
**Call notes:** `call-notes-2026-06-11.md` · **Connect vs build:** `connect-vs-build-matrix.md`

---

## 1. Objective

Build and deploy six agents that replicate the BC workplan (see `reference/decks/20260512_Accelerating-Value-Creation-BC-KKR.pptx`) with human-in-the-loop quality gates matching McKinsey standards.

Each agent spec includes **11 stakeholder perspectives** (see `specs/perspectives/stakeholder-lenses.yaml`):

Data Engineer · Software Engineer · UX/UI · CTO · COO · Client · Partner · Senior Partner · EM · AP · BA

---

## 2. Pipeline overview

```
[1 Scope] → [2 Interview] → [3 As-Is Maps] → [4 To-Be + Initiatives] → [5 Value Model] → [6 Roadmap]
                ↓                                    ↑
                └──────── fact-base requirements ──┘
```

**Human gates:** After agents 1, 2 (optional), 3, 4, 5, 6 — see `specs/pipeline.yaml`

---

## 3. Build sequence (spec-approved order)

| Order | Agent | Why this order | Can prototype with reference data? |
|-------|-------|----------------|-----------------------------------|
| 1 | Interview Scope | No upstream deps; unlocks everything | ✅ support teams PDF + compendium |
| 2 | Process Mapping | Parallel to Interview; validate vs existing maps | ✅ process maps PPT + compendium |
| 3 | Live Interview | Needs Agent 1 output + UI | ⏸ needs Agent 1 |
| 4 | Value Modeling | Calibrate against v6 model | ✅ survey-data-analysis-v6.xlsx |
| 5 | Future State | Needs Agent 3 | ⏸ needs Agent 3 |
| 6 | Execution Roadmap | Needs Agents 4 + 5 | ⏸ last |

---

## 3-week sprint mapping (updated from Emanuele/Khalid call)

### Week 1 — Foundation (this week) · NO AGENT BUILD
- Compendium walkthrough (~30 min) — where inputs live
- Agent vs study gap analysis (`agent-vs-study-gap-analysis.md` — after walkthrough)
- Connect-vs-build matrix sign-off (Emanuele + Khalid)
- Index Jan/Feb folders, model folder, survey, JK Tech assets into `reference/study-corpus/`
- Resolve McKinsey integrations (ProcessAI, IndexAI, templates)
- Clarify interview gap: subsections only, no full recordings

### Week 2 — Agent building + dedicated output
- Build orchestration layer + human review gates (not duplicate ProcessAI/v6/JK assets)
- Agent 01: scope from existing compendium + gap fill
- Agent 03: ProcessAI + validate vs existing process maps
- Agent 05: v6 model connection + assumption UI
- Defer Agent 02 live interviews — ingest Jan/Feb subsections where available
- Agents produce first-pass deliverables

### Week 3 — Output + synthesis
- Agent 04 initiatives/BRD (extend compendium + JK Tech)
- Agent 06 roadmap
- ED/partner refinement and syndication
- Retrospective: time/quality vs 10-week baseline
- Stairco: full package + playbook learnings

---

## 4. Cross-cutting decisions (all agents)

| ID | Decision | Owner | Impact |
|----|----------|-------|--------|
| X-001 | BC uses role-play SMEs vs live client SMEs | EM / AP | Agent 02 config |
| X-002 | External LLM during BC vs firm-hosted only | Senior Partner / Compliance | All agents |
| X-003 | Vercel auth approach until McK platform | Software / EM | Deploy |
| X-004 | v6 model as golden calibration for Agent 05 | AP / Emmanuel | Value credibility |
| X-005 | In-flight compendium initiatives — merge baseline | AP / Client | Agents 04, 06 |

---

## 5. Quality bar (what "done" means before client/KKR phase)

| Dimension | Standard | Validated by |
|-----------|----------|--------------|
| Workflow coverage | 95%+ in-scope pods | AP |
| Process map accuracy | <20% BA edit rate | AP + Client SME |
| Value model | ±20% vs approved v6 | BA + AP |
| Initiative traceability | 100% linked to pain point ID | Partner |
| Source traceability | 100% map steps → transcript/doc | BA |
| Roadmap | All trade-offs resolved or accepted | Partner |

---

## 6. Deployment path

1. **Vercel (now):** Team access, fast iteration, reference-data RAG
2. **McKinsey platform (later):** SSO, compliance, client-facing — need migration spec from firm

Do not deploy client PII to Vercel without compliance sign-off (CTO + Senior Partner lens).

---

## 7. Agent plan index

| Agent | Plan doc | Build readiness |
|-------|----------|-----------------|
| 01 Interview Scope | [01-interview-scope-agent-plan.md](./01-interview-scope-agent-plan.md) | **Ready to review** — start build after approval + McK refs |
| 02 Live Interview | [02-live-interview-agent-plan.md](./02-live-interview-agent-plan.md) | Blocked on Agent 01 + AI interview policy |
| 03 Process Mapping | [03-current-state-process-mapping-agent-plan.md](./03-current-state-process-mapping-agent-plan.md) | Blocked on ProcessAI reference |
| 04 Future State | [04-future-state-workflow-agent-plan.md](./04-future-state-workflow-agent-plan.md) | Blocked on Agent 03 |
| 05 Value Modeling | [05-value-modeling-agent-plan.md](./05-value-modeling-agent-plan.md) | Can prototype with v6 now |
| 06 Execution Roadmap | [06-execution-roadmap-agent-plan.md](./06-execution-roadmap-agent-plan.md) | Blocked on 04 + 05 |

---

## 8. What we need before build (Week 2)

1. **Emanuele + Khalid aligned** — sign `connect-vs-build-matrix.md`
2. **Compendium walkthrough complete** — Jan/Feb folders indexed in repo
3. **JK Tech assets** copied to `reference/jk-tech/` (Khalid)
4. **Agent vs study gap analysis** written after walkthrough
5. **McKinsey refs** — ProcessAI, IndexAI, templates (see `mckinsey-resources-needed.md`)

## 9. Terminology (from call)

| Term | Meaning |
|------|---------|
| BSN | Distributor — orders from schools/consumers; customized team sports equipment |
| FSP | Field Sales Professional (= Sales Pro) |
| MTS | My Team Shop support pod (not the shop product itself) |
| NSP | Non-Standard Product / known SKU projects |
| Model folder | Dollar opportunity estimates (`reference/models/`) |
| Survey | BSN employee time-spent survey (v6 workbook) |
