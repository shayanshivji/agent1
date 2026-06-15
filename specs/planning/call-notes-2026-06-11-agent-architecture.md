# Call Notes — Agent Architecture Session (Recording 189)

**Date:** June 11, 2026 (~5:06 PM)  
**Participants:** Emmanuel (Speaker 2), Shayan (Speaker 3/4), Khalid (Speaker 4 on roadmap), others  
**Status:** Architecture nearly locked — Emmanuel finalizing agent list (~10 min offline) before build starts

---

## Key architectural decisions

### 1. Merge agents 4 + 5 (slide) → one Initiative Agent

**Before (blueprint library):** Separate "brainstorm levers" and "map levers to pain points"  
**After (call consensus):** **One task** — take pain points from current-state mapping → generate initiatives that address them.

> "4 should be linked to 2 because initiatives address pain points in #2" — Emmanuel

### 2. Keep agent 8 (slide) separate → Future State Agent

**Khalid proposed:** Merge 4, 5, and 8  
**Emmanuel disagreed:** #8 is different — future-state workflow redesign is **design phase**, not diagnostic.

Future state runs **after** humans select which initiatives to pursue (not all initiatives get to-be workflows).

### 3. Merge agents 6 + 7 (slide) → Value & Horizons Agent

**Combined capability:**
- Business case / value estimation (hours saved, FTE, productivity, $)
- Feasibility + complexity scoring
- **Horizons roadmap** — short / medium / long (like compendium horizons page)
- Value capture over time changes by horizon
- **Updated workflow per horizon** (potentially)

> Output = "HTML version of the horizons page" — initiatives with timing, value, feasibility, workflow evolution

### 4. Human initiative selection sits BETWEEN diagnostic and design

| Phase | What happens |
|-------|--------------|
| **Diagnostic (agents run)** | Generate **comprehensive** initiative set addressing all major pain points (2–3 per horizon, not laundry list) |
| **Human gate** | Leadership picks subset org can absorb ("we can only do 2") |
| **Design (Agent 8 / Future State)** | Build future-state workflows + BRD **only for selected initiatives** |

---

## Revised agent model (pending Emmanuel final sign-off)

Maps **slide 1–8** → **6 agents** (+ human gates):

```
┌─────────────────────────────────────────────────────────────────┐
│                        DIAGNOSTIC PHASE                          │
├─────────────────────────────────────────────────────────────────┤
│  [1] Interview Scope      ← slide 1: interview guides           │
│  [2] Live Interview       ← slide 3: SME interviews (+ human     │
│                            double-click follow-ups)              │
│  [3] Current State Map    ← slide 2: ProcessAI as-is workflows  │
│  [4] Initiative Generator ← slides 4+5 MERGED: pain → initiatives│
│  [5] Value & Horizons     ← slides 6+7 MERGED: $ + roadmap       │
├─────────────────────────────────────────────────────────────────┤
│  ⚑ HUMAN GATE: Validate intermediate outputs at each step       │
│  ⚑ HUMAN GATE: Remove in-flight initiatives (slide human #3)    │
│  ⚑ HUMAN GATE: Confirm initiative → baseline mapping (value)    │
│  ⚑ HUMAN GATE: Select initiative subset for design              │
├─────────────────────────────────────────────────────────────────┤
│                         DESIGN PHASE                             │
├─────────────────────────────────────────────────────────────────┤
│  [6] Future State Workflow ← slide 8: to-be workflows + build     │
│                             plans for SELECTED initiatives only   │
│                             → feeds BRD                           │
└─────────────────────────────────────────────────────────────────┘
```

### Comparison: Blueprint library vs call decision

| Blueprint library (6 PDFs) | Call decision | Change |
|---------------------------|---------------|--------|
| 01 Interview Scope | Agent 1 | Same |
| 02 Live Interview | Agent 2 | Same |
| 03 Current State Mapping | Agent 3 | Same |
| 04 Future State | **Agent 6** (design phase only) | Moved later; scoped to selected initiatives |
| 05 Value Modeling | **Agent 5** (merged with roadmap) | Combined with horizons |
| 06 Execution Roadmap | **Agent 5** (merged with value) | Combined with value sizing |
| *(not in library)* | **Agent 4** Initiative Generator | New — merges old slide 4+5 |

---

## Value modeling — critical human-in-the-loop (Emmanuel)

The agent **does not replace the baseline survey**.

### How the v6 model works (Emmanuel walkthrough)
1. **Survey** → hours allocated to activities per role (baseline)
2. Known **hourly rate** → convert hours to $
3. **Initiatives** with standard savings % applied to mapped activities
4. Reduction calculated per role/pod

### What agents can vs cannot do

| Task | Agent? | Human? |
|------|--------|--------|
| Create survey template | ❌ No — use existing standardized template | ✅ Reuse v6 template across portcos |
| Run survey with client | ❌ | ✅ Required each engagement for baseline |
| Generate initiatives | ✅ Relatively easy | Review + pressure-test |
| Map initiative → activity baseline | ⚠️ Hard — company-dependent | ✅ **Human must confirm mapping** |
| Apply savings math | ✅ Logic can live in agent (not Excel long-term) | Validate |
| Sanitized v6 as reference | ✅ Upload sanitized model for agent to learn formulas | Emmanuel to provide |

> "Same initiative (e.g. email embedded agents) = 10 hrs in Team X at Company A, 20 hrs at Company B" — mapping is situational.

### Long-term vision
- Ideally **no Excel template** — math lives in agent, variables change per portco
- For BC: **sanitize v6** and use to train/calibrate Agent 5
- Next portco: structured input of role/time allocation (from survey) → same logic

---

## In-flight initiative deduplication (human row #3)

When agent recommends an initiative already underway at client:
- **Remove or flag** duplicate so steerco doesn't recommend what's already happening
- Requires **custom interviews** about ongoing efforts — "tricky and customized"
- Not fully automatable; human validates

---

## Diagnostic output (without full automation)

End state of diagnostic agents (with human validation at each step):

1. ✅ Initiatives mapped to pain points
2. ✅ Value estimates per initiative
3. ✅ Horizons view (short / medium / long) with timing + value capture + feasibility
4. ✅ Workflow evolution per horizon (potentially)
5. ❌ **Not** full future-state design for all initiatives — that's post-selection

> Shayan recap confirmed with Emmanuel: "These three or four agents… complete the diagnostic… with human validation along the way."

---

## Build approach (agreed on call)

### Iterative, not theoretical
> "Better to have something built out and iterate by walking through it as if we are the client" — Shayan  
> Emmanuel agreed: build instead of over-planning

### Build sequence
1. **Start with Agents 1 + 2** — perfect those, see output quality
2. Chain **3 → 4 → 5** as prior agents stabilize
3. **Agent 6** after diagnostic human gate pattern is clear

### Admin prep (Emmanuel)
- Consolidate process flows as **training material** for agents
- Pin team with final agent list + small admin tasks

### LLM / API costs
- OpenAI API (~hundreds to ~$1000 for 3-week study) — acceptable
- Emmanuel can put firm card on file for BC trial
- Long-term McKinsey billing TBD

---

## What NOT to build

| Item | Decision |
|------|----------|
| Survey generator agent | ❌ Use existing v6 survey template |
| New Excel template per portco | ❌ Same template; agent absorbs logic over time |
| Agent 8 for ALL initiatives | ❌ Only selected initiatives post-diagnostic |
| Separate agents for slide 4 and 5 | ❌ Merged |
| Separate agents for slide 6 and 7 | ❌ Merged |

---

## Action items

| Owner | Action | Status |
|-------|--------|--------|
| **Emmanuel** | Finalize 6–7 agent list; pin Shayan + team | ⬜ In progress (~10 min) |
| **Emmanuel** | Share sanitized v6 model for agent training | ⬜ |
| **Emmanuel** | Consolidate process flows for agent training material | ⬜ |
| **Shayan** | First pass build Agents 1 + 2 after Emmanuel pins final list | ⬜ Blocked on final list |
| **Team** | Update specs to v2 architecture (this doc) | ✅ In progress |
| **Khalid** | Input on horizons HTML output format | ⬜ |

---

## Open questions (for Emmanuel's final pin)

1. Confirm **6 vs 7 agents** — is Initiative Generator definitely separate from Value & Horizons?
2. **Workflow per horizon** — required in v1 or aspirational?
3. **Horizons output** — HTML page spec: match compendium slide exactly?
4. Does **Agent 4** also classify initiatives into H1/H2/H3, or does **Agent 5** own horizons bucketing?
5. **Tech stack evaluation** (slide workplan) — explicitly out of scope for now per call?
