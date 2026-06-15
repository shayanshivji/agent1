# Call Notes — Emanuele / Khalid Alignment Session

**Date:** June 11, 2026  
**Status:** Foundation week — **do not build agents until Emanuele + Khalid aligned**  
**Attendees (noted):** Emanuele, Khalid, study team

---

## Purpose of the call

- Walk through **Phase 1 compendium** from the original study
- **Compare agent blueprints vs what the study actually produced** — gap analysis before build
- ~30 min to add color on **where inputs live** (folder structure, source systems)
- Clarify what can be **copied from JK Tech** into agents vs what must be net-new

---

## Revised 3-week timeline (from call)

| Week | Focus | Build? |
|------|-------|--------|
| **This week** | Foundation — alignment, input mapping, connect-vs-build decisions | ❌ No agent build |
| **Next week** | Agent building | ✅ Start after Emanuele + Khalid sign-off |
| **Week 2** | Dedicated output — agents producing deliverables | Run agents |
| **Week 3** | Output + synthesis — package for steerco / client | Refine + syndicate |

> **Previous plan** had Week 1 as "build all agents." Call shifts **build to Week 2**, with this week as foundation only.

---

## Build gates (non-negotiable)

Before any agent code ships:

- [ ] **Emanuele aligned** on scope, workflow list, and quality bar
- [ ] **Khalid aligned** on inputs, JK Tech handoff, and technical approach
- [ ] **Connect-vs-build matrix** reviewed — no rebuilding what firm/client already has
- [ ] **Input inventory complete** — Jan/Feb folders, model folder, survey located and indexed
- [ ] **Agent vs study gap analysis** done — see `agent-vs-study-gap-analysis.md` (to create after compendium walkthrough)

---

## Architecture principles (from call + prior direction)

### 1. Connect, don't rebuild

Prefer integrating existing McKinsey / client / JK Tech solutions:

| Capability | Connect to (candidate) | Don't build |
|------------|------------------------|-------------|
| Process mapping | **ProcessAI** | Custom swim-lane generator |
| Document RAG | **IndexAI** or firm KB | Custom embedding pipeline if firm standard exists |
| Value sizing | **Cleansheet AI** + v6 model | Greenfield Excel engine if Cleansheet applies |
| Interview guides | Firm templates + JK Tech content | Generic prompt-only guides |
| BRD / exports | Firm PPT/Word templates | Custom slide builder |
| JK Tech assets | Copy/adapt JK deliverables | Re-derive what JK already built |
| Hosting (prod) | **McKinsey internal platform** | Permanent Vercel-only architecture |

Vercel = **dev/staging prototype only**. Design for migration to scalable McK hosting (SSO, compliance, multi-engagement).

### 2. Scalable hosting

- Stateless agent API routes; persistent data in managed store (Supabase or firm equivalent)
- Engagement-scoped data isolation (`engagements/{id}/…`)
- Queue-based long runs (interviews, ProcessAI batch) — not synchronous serverless only
- Config-driven agents (YAML specs → runtime) so next portco = config swap not rewrite

---

## Client & study context (terminology)

### BSN Sports business model

- **BSN** = distributor — takes orders from **consumers** or **schools** (middle/high school jersey, sports equipment, etc.)
- Orders are often **customized** (decoration, artwork, team shops)
- Part of **Varsity Brands** (KKR portco)

### Key roles & acronyms

| Term | Meaning | Maps to |
|------|---------|---------|
| **FSP** | Field Sales Professional | Same as **Sales Pro** |
| **MTS** | My Team Shop | **Support pods** (MTS Build Pod) — not the shop itself |
| **NSP** | Non-Standard Product (known SKU projects) | Distinct workstream (Isabella) |
| **TM** | Territory Manager | Support pod — hard goods expert |
| **SSR** | Sales Support Rep | Support pod — order backbone |
| **Coordinator** | School/team side contact | Often interacts with MTS shop build |

### Support pods (in-scope functions)

MTS Pod, TM, SSR, R+R, Comp Pod, Fin Serv, Customer Care — see `reference/client-materials/how-to-utilize-support-teams.pdf`

---

## Where inputs live (study corpus)

*Pending full walkthrough with Emanuele/Khalid — partial map from call:*

| Source | Location | Used by | Status |
|--------|----------|---------|--------|
| Phase 1 compendium | `reference/decks/` (partial) | Agents 1, 3, 4 | ✅ In repo; need walkthrough for gaps |
| Process maps | `reference/decks/20260324_BSN_Process-Maps.pptx` | Agent 3 validation | ✅ In repo |
| **Jan folder** | TBD — ask Emanuele/Khalid | Interview subsections, study inputs | ⬜ Not yet in repo |
| **Feb folder** | TBD — ask Emanuele/Khalid | Interview subsections, study inputs | ⬜ Not yet in repo |
| **Model folder** | `reference/models/survey-data-analysis-v6.xlsx` (partial) | Agent 5 — dollar opportunity | ✅ Partial; may have more in study SharePoint |
| **Survey** | Same v6 workbook + raw tabs | Agent 5 — time spent by role | ✅ In repo |
| JK Tech deliverables | JK Tech onboarding compendium + internal share | Agents 4, 5, 6 | ⬜ Need copy access |
| JK Tech handwritten notes | Restricted JK access | Agent 3, 1 | ⬜ Need access path from Khalid |
| Interview recordings | **Ideal but not available** | Agent 2, 3 | ❌ Full recordings don't exist |
| Interview **subsections** | Jan/Feb folders? | Agent 2, 3 | ⬜ Partial substitute for recordings |

### Interview data gap

- **Ideal:** Full interview recordings for every SME session
- **Reality:** No full recordings — have **subsections** (likely partial transcripts, notes, or segmented exports in Jan/Feb folders)
- **Implication for Agent 2:** BC may lean on **subsection inputs + role-play** rather than live AI interviews for v1; Agent 3 can ingest subsections directly without Agent 2 in some workflows

---

## JK Tech handoff

- **JK Tech has deliverables that can be copied directly into agents** — reduces build scope
- Separate compendium exists: `reference/decks/20260410_BSN_Diagnostic_Compendium_JK-Tech.pptx`
- **Handwritten notes** require specific JK access — coordinate with Khalid
- Question for alignment: which JK outputs are **source of truth** vs **superseded by BC re-run**?

---

## Agent vs study — initial gap hypotheses

*To validate in compendium walkthrough:*

| Agent blueprint says | Study may already have | Action |
|---------------------|------------------------|--------|
| Agent 1: Discover workflows | Compendium + support teams PDF + process maps | **Connect** — seed from existing, don't rediscover |
| Agent 2: Live AI interviews | Subsections only, no recordings | **Defer / adapt** — ingest subsections; role-play for BC |
| Agent 3: ProcessAI from transcripts | Process maps PPT + compendium pain points | **Connect ProcessAI** + validate against existing maps |
| Agent 4: Generate initiatives | Compendium initiatives + v6 initiative tab | **Connect** — extend, don't regenerate from scratch |
| Agent 5: Value model | v6 survey model (~$9–15M) | **Connect** — agent fills gaps / updates, not new model |
| Agent 6: Roadmap | Compendium phasing / prioritization rubric (TBD) | **Connect** once rubric aligned |

Full gap analysis: create after compendium walkthrough → `agent-vs-study-gap-analysis.md`

---

---

## LLM / API costs (from Recording 189)

| Item | Decision |
|------|----------|
| Provider | OpenAI API (card on file — Emmanuel) |
| BC trial budget | ~$100s–$1000 acceptable |
| Long-term McKinsey billing | TBD — not blocking BC build |
| Front-end LLM | Yes — needed for initiative generation + pressure-test chat |

---

## Action items

| Owner | Action | Due |
|-------|--------|-----|
| Emanuele + Khalid | Compendium walkthrough (~30 min) — where inputs live | This week |
| **Emmanuel** | **Pin final 6-agent list + admin tasks** | ASAP (post-call) |
| **Emmanuel** | **Share sanitized v6 model** for Agent 5 training | This week |
| **Emmanuel** | Consolidate process flows as agent training material | This week |
| Khalid | JK Tech folder access + handwritten notes path | This week |
| Team | Add Jan/Feb folders to `reference/study-corpus/` when shared | This week |
| Team | Complete agent-vs-study gap analysis after walkthrough | Before build |
| Team | Migrate specs to v2 architecture after Emmanuel pin | Before build |
| Shayan | **First pass Agents 1 + 2** after Emmanuel pin | Week 2 start |
| Team | Connect-vs-build matrix sign-off from Emanuele + Khalid | Before build |

---

## Open questions for next Emanuele/Khalid session

1. Exact path to **Jan** and **Feb** folders (SharePoint? Box? McK platform?)
2. Is **model folder** only v6 xlsx or additional files?
3. Which **JK Tech** assets are copy-paste ready for which agent?
4. Can **subsections** replace Agent 2 for workflows where no SME re-interview needed?
5. **NSP** (Isabella) and **Order visibility** (Shreya) — in scope for BC agents or separate track?
6. ProcessAI + IndexAI — who internally owns access for BC team?
