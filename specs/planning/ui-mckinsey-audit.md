# McKinsey UX & Quality Audit — Agent 1 (Scoping)

**Date:** June 2026  
**Scope:** Scoping agent UI + workflow after redesign

---

## Executive summary

Agent 1 now follows McKinsey diagnostic discipline: **hypothesis-led scope → ED gate → defensible outputs**. The UI embeds a live quality audit across Partner, AP/ED, BA, and EM lenses.

---

## What changed (redesign)

| Area | Before | After |
|------|--------|-------|
| Visual | Light generic SaaS | Dark command-center, glass panels, cyan accent |
| Navigation | Flat list | Command Center → Scoping with stepper |
| Workflow review | Long accordion | Tabbed: Workflows · Guides · Fact base |
| Quality | None | Live McKinsey audit panel (9 checks) |
| Actions | Buried | Sticky CTA bar at decision points |
| Dead code | Walter, old data files | Removed |

---

## McKinsey lens audit

### Partner
- ✅ Hypothesis-led discovery (3 BSN hypotheses pre-loaded)
- ✅ Methodology visible — not a black-box LLM
- ⚠️ Needs Emmanuel sign-off on hypothesis set per engagement

### AP / ED
- ✅ Human approval gate before guide generation
- ✅ MTS + critical pods flagged in audit
- ✅ Preliminary pain points shown as hypotheses, not facts
- ⚠️ Export is JSON — Word template from firm still needed

### BA
- ✅ Interview guides: sections, probes, quantification prompts
- ✅ Fact-base table with status (known / partial / missing)
- ✅ Source citations on workflows
- ⚠️ Guide quality: LLM mode needs spot-check vs template mode

### EM
- ✅ Stepper shows Week 1 deliverable progress
- ✅ Quality score % for stairco updates
- ✅ "Ready for fieldwork" flag when complete

### COO / Client (future)
- Guides use BSN pod terminology (FSP, TM, SSR, MTS Pod)
- No AI interviewer — human-led sessions only

---

## Quality audit checks (in-app)

1. Critical pod coverage (MTS, SSR, TM)
2. Hypothesis-led discovery
3. MTS operations in scope
4. Source traceability
5. ED approval gate
6. Interview guide readiness
7. Fact-base for value model
8. Scope confidence
9. Week 1 deliverable status

---

## Remaining gaps

| Gap | Owner | Priority |
|-----|-------|----------|
| Word/PPT export (firm template) | BA + McKinsey KB | P1 |
| Jan/Feb subsection ingest | Data / EM | P1 |
| Emmanuel sanitized v6 link | AP | P2 |
| McKinsey SSO for deploy | IT | P2 |
| Supabase for Vercel persistence | Eng | P2 |

---

## Run locally

```bash
npm run dev
```

Open http://localhost:3000 → Start scope run → Approve → Generate guides → Check audit panel
