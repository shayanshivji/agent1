# Agent Architecture v3 — Emmanuel Proposal + Shane Feedback

**Date:** June 11, 2026  
**Status:** Working architecture — aligns team before YAML migration  
**Sources:** Emmanuel Slack proposal, Shane Rowley feedback, Recording 189, blueprint library

---

## Final agent roster (7 agents)

| # | Agent | Purpose | Phase |
|---|-------|---------|-------|
| **1** | **Scoping** | Create interview guides; define discovery scope | Diagnostic |
| **2** | **Initial Interview** (e.g., Walter) | Conduct SME interviews from approved guides | Diagnostic |
| **3** | **Process Mapping** (ProcessAI) | Current-state workflows + pain points | Diagnostic |
| **4** | **Improvement Initiatives** | Initiatives/levers addressing pain points + **impact estimate** (time / $ saved) | Diagnostic |
| **5** | **Future State Process Map** | To-be workflow reflecting initiatives from Agent 4 | Diagnostic* |
| **6** | **Roadmapping** | Horizon 1–3 roadmap + diagnostic conclusion / next steps | Diagnostic |
| **7** | **BRD Drafting** | Features, business rules, requirements for **client-selected** initiatives | Design |

\*Agent 5 runs in diagnostic pipeline but **requires human scrub of Agent 4 output first** (Shane).

---

## Execution order (Shane: swap 2 ↔ 3)

Logical flow — interview before mapping:

```
1 Scoping
    ↓  ⚑ ED approves workflow list + guides
2 Initial Interview (Walter)
    ↓  ⚑ Human double-click / follow-ups
3 Process Mapping (ProcessAI)
    ↓  ⚑ SME validates maps + pain inventory
4 Improvement Initiatives (+ impact)
    ↓  ⚑ ASC/BA revise, scrub, pressure-test  ← Shane: why 4 ≠ 5
5 Future State Process Map
    ↓  ⚑ Review to-be vs as-is
6 Roadmapping (H1–H3)
    ↓  ⚑ Diagnostic conclusion sign-off
══════ DIAGNOSTIC COMPLETE ══════
    ↓  ⚑ Client selects initiative subset
7 BRD Drafting
```

### Why swap 2 and 3?

| Order | Rationale |
|-------|-----------|
| Scope → **Interview** → **Map** | Maps are built **from** interview outputs; ProcessAI ingests transcripts/subsections |
| Matches blueprint library handoff: Agent 1 → 2 → 3 | |
| Avoids mapping before evidence exists | |

---

## Human-in-the-loop gates (Shane + Recording 189)

| After | Who | Action |
|-------|-----|--------|
| Agent 1 | ED/AP | Approve workflow list + interview guides |
| Agent 2 | BA/AP | Follow-up interviews; escalate thin coverage |
| Agent 3 | SME + AP | Validate current-state maps and pain points |
| **Agent 4** | **ASC/BA** | **Revise, scrub, pressure-test initiatives + impact** before future state |
| Agent 5 | AP/ED | Review to-be workflows incorporate right levers |
| Agent 6 | Partner/ED | Sign off horizons + diagnostic next steps |
| Diagnostic → Design | **Client** | Select initiatives for BRD |
| Agent 7 | AP + SMEs | Rules, edge cases, BRD completeness |

---

## Agent 4 vs 5 — keep separate (Shane)

Emmanuel noted Agent 5 *could* merge with 4. **Shane recommends separate** to force a human gate:

| Agent 4 output | Human gate | Agent 5 output |
|----------------|------------|----------------|
| Initiative list linked to pain points | ASC/BA scrub: remove bad ideas, dedupe in-flight, pressure-test $ | Future-state swim-lanes reflecting **approved** initiatives only |
| Per-initiative impact (time / $) | Challenge assumptions; confirm initiative → baseline mapping | Delta view: as-is → to-be |

**UI/UX note (Emmanuel):** Agent 5 review UI should be **like Agent 2** — interactive walkthrough / validation, not just static export.

---

## Agent 4 scope — initiatives + impact

Emmanuel combines what Recording 189 split across "Initiative Generator" and "Value & Horizons":

| Component | In Agent 4? | Notes |
|-----------|-------------|-------|
| Generate initiatives from pain points | ✅ | Core |
| Map initiative → pain point | ✅ | Core |
| Estimate time / $ saved | ✅ | Uses survey baseline + v6 logic |
| Feasibility scoring | ⚠️ | May live in 4 or 6 — clarify |
| Horizons bucketing (H1/H2/H3) | ❌ → Agent 6 | Roadmapping owns horizon structure |
| Future-state workflow | ❌ → Agent 5 | Separate after human scrub |

**Still human-required (Emmanuel, Recording 189):**
- Run time-allocation **survey** (standard template — not an agent)
- Confirm initiative → activity baseline mapping
- Remove in-flight duplicates

---

## Agent 6 — Roadmapping (diagnostic conclusion)

**Output:**
- Horizon 1 / 2 / 3 initiative placement
- Timing, value capture over time, feasibility by horizon
- **Next steps** as diagnostic phase conclusion
- Match compendium horizons page (HTML or slide export)

**Does NOT:** Draft BRD (that's Agent 7) or replace client initiative selection for design.

---

## Agent 7 — BRD (design phase only)

**Input:** Client-selected initiatives after diagnostic  
**Output:** BRD content — features, business requirements, rules by team, edge cases, KPIs  
**Human:** SME interviews for rules; ED sign-off before delivery

---

## Mapping: proposals → this architecture

| Source | How it maps |
|--------|-------------|
| Blueprint library (6 PDFs) | 1≈01, 2≈02, 3≈03, 4+5≈split into 4+5+6, 8≈05+07 |
| Recording 189 merges | **Revised:** 4 includes impact; 6 owns roadmap; 5 = future state separate |
| BC slide (8 boxes) | See table below |

| Slide # | Capability | Agent v3 |
|---------|------------|----------|
| 1 | Interview guides | 1 Scoping |
| 3 | SME interviews | 2 Interview |
| 2 | ProcessAI current state | 3 Process Mapping |
| 4 + 5 | Initiatives + pain mapping | 4 Initiatives (+ impact) |
| 6 | Value estimation | 4 Initiatives (partial) + 6 Roadmap |
| 7 | Prioritization / roadmap | 6 Roadmapping |
| 8 | Future state + build plans | 5 Future State + 7 BRD |

---

## Connect vs build (unchanged principles)

| Agent | Connect | Build |
|-------|---------|-------|
| 1 | Compendium, Jan/Feb, firm templates | Approval UI |
| 2 | Subsection ingest if no live interview | Walter chat UI + escalation |
| 3 | **ProcessAI** | Traceability + validation UI |
| 4 | v6 logic (sanitized), compendium initiatives | Initiative review + pressure-test UI |
| 5 | ProcessAI redesign | Agent-2-style validation UI |
| 6 | Compendium horizons layout | Horizons HTML/slide generator |
| 7 | Firm BRD template, JK Tech | Section population + rules capture |

---

## Build sequence (team agreement)

| Sprint | Build |
|--------|-------|
| Week 2 start | **Agent 1 — Scoping / interview guides** only (no Walter / live AI interview) |
| Week 2 mid | **Agent 3** (ProcessAI integration) |
| Week 2 late | **Agent 4** (+ sanitized v6 from Emmanuel) |
| Week 3 | **Agents 5 + 6** — chain after 4 human gate pattern proven |
| Post-diagnostic | **Agent 7** when client selection happens |

---

## Open items for Emmanuel confirm

- [ ] Agent 4 includes full $ model or directional impact only before ASC scrub?
- [ ] Feasibility scores in Agent 4 or Agent 6?
- [ ] Agent 5 runs for **all** initiatives or only human-approved subset post-ASC scrub?
- [ ] Sanitized v6 + process flow training pack delivery
- [ ] "Walter" = firm tool name for interview agent or placeholder?

---

## Sign-off

| Reviewer | Architecture v3 OK? | Date |
|----------|---------------------|------|
| Emmanuel | ⬜ | |
| Khalid | ⬜ | |
| Shane | ✅ (4/5 separate, swap 2/3) | Jun 11 |
| Shayan | ⬜ | |
