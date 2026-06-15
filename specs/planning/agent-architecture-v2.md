# Agent Architecture v2 (Draft — pending Emmanuel final pin)

**Source:** Recording 189 + BC slide "What Agents do" + blueprint library  
**Replaces:** v1 pipeline mapping in `specs/pipeline.yaml`  
**Gate:** Emmanuel + Khalid sign-off + Emmanuel final pin before build

| Slide # | Slide capability | Agent v2 | Phase |
|---------|------------------|----------|-------|
| 1 | GenAI interview guides | **Agent 1 — Interview Scope** | Diagnostic |
| 3 | Interview agent (SME) | **Agent 2 — Live Interview** | Diagnostic |
| 2 | ProcessAI → current workflows | **Agent 3 — Current State Mapping** | Diagnostic |
| 4 + 5 | Initiatives from pain points + mapping | **Agent 4 — Initiative Generator** | Diagnostic |
| 6 + 7 | Value estimation + prioritization/roadmap | **Agent 5 — Value & Horizons** | Diagnostic |
| 8 | Future state workflow + build plans | **Agent 6 — Future State** | Design |

**Merged:** 4+5, 6+7  
**Separated:** 8 from diagnostic bundle; runs post-initiative-selection

---

## Agent summaries

### Agent 1 — Interview Scope
- **Input:** Company context, function types, uploaded materials, hypotheses
- **Output:** Approved workflow list, interview guides, preliminary pain points, fact-base requirements
- **Human gate:** ED approves workflow list before guides generated
- **Connect:** Compendium + Jan/Feb subsections + firm templates (don't rediscover)

### Agent 2 — Live Interview
- **Input:** Approved guides, SME profile
- **Output:** Transcript, structured summary, coverage flags
- **Human gate:** Double-click follow-ups; escalate thin responses
- **Connect:** Ingest Jan/Feb subsections where no live interview; defer full AI interview if needed

### Agent 3 — Current State Mapping
- **Input:** Transcripts/subsections, SOPs, recordings
- **Output:** Swim-lane maps, pain point inventory (IDs stable for Agent 4)
- **Human gate:** SME validation sessions
- **Connect:** **ProcessAI** — do not rebuild mapper

### Agent 4 — Initiative Generator *(new merged agent)*
- **Input:** Pain point inventory from Agent 3 (linked to process maps)
- **Output:** Comprehensive initiative set — **not laundry list**; structured like compendium horizons (2–3 per horizon bucket suggested)
- **Each initiative:** Links to pain_point_id(s), category (process vs AI), description
- **Human gate:** Review initiatives; pressure-test via LLM chat; **remove in-flight duplicates**
- **Does NOT:** Size value, design future state

### Agent 5 — Value & Horizons *(merged agent)*
- **Input:** Initiatives from Agent 4, **survey baseline** (human-run v6 template), sanitized v6 logic, use-case repository
- **Output:**
  - Per-initiative: hours saved, FTE impact, $ range, assumptions, feasibility/complexity score
  - **Horizons view:** short / medium / long — timing, cumulative value capture, feasibility by horizon
  - **Workflow snapshot per horizon** (if in v1 scope)
  - HTML/page export matching compendium horizons layout
- **Human gates:**
  - Confirm **initiative → activity baseline mapping** (Emmanuel: critical, not fully automatable)
  - Validate $ estimates vs pressure-test
- **Connect:** v6 model math (sanitize + embed logic); standardized survey template (human fills)

### Agent 6 — Future State Workflow *(design phase — slide 8)*
- **Input:** **Human-selected** initiative subset only; current-state maps from Agent 3
- **Output:** To-be workflows, delta view, high-level build plans → BRD inputs
- **Human gate:** ED sign-off before BRD
- **Timing:** After diagnostic complete + initiative pick

---

## Human-in-the-loop map (from slide bottom row)

| Human task | When | Which agent step |
|------------|------|------------------|
| Follow-up interviews, workshops, shadowing | Diagnostic | After Agent 2 |
| Validate / pressure-test outputs | Every step | All agents |
| Reflect in-flight initiatives | Diagnostic | After Agent 4 |
| Confirm initiative → baseline mapping | Diagnostic | Agent 5 |
| Run time-allocation survey | Engagement start | Before Agent 5 (not an agent) |
| Select initiatives for design | Between phases | Before Agent 6 |
| SME interviews for BRD detail | Design | Agent 6 |
| Business rules & edge cases | Design | Agent 6 / BRD |

---

## Diagnostic vs design boundary

```
DIAGNOSTIC OUTPUT (Agents 1–5):
  • All major pain points documented
  • Comprehensive initiative set w/ horizons + value
  • NO full to-be workflow for every initiative

        ↓  HUMAN: "We pick these 2 (or N) initiatives"

DESIGN OUTPUT (Agent 6):
  • Future-state workflows for selected initiatives only
  • Build plans + BRD
```

---

## Build order (call agreement)

```
Week 1 (foundation):     Alignment, sanitized v6, process flow training material
Week 2 (build):          Agent 1 → Agent 2 → chain 3 → 4 → 5
Week 2–3 (output):       Run diagnostic pipeline with human gates
Week 3 (design):         Agent 6 on selected initiatives + synthesis
```

**First code:** Agents 1 + 2 (after Emmanuel pins final list)

---

## Spec file migration (v1 → v2)

| v1 YAML | v2 YAML | Action |
|---------|---------|--------|
| `01-interview-scope-agent.yaml` | `01-interview-scope-agent.yaml` | Update phase gates |
| `02-live-interview-agent.yaml` | `02-live-interview-agent.yaml` | Minor |
| `03-current-state-process-mapping-agent.yaml` | `03-current-state-mapping-agent.yaml` | Minor |
| `04-future-state-workflow-agent.yaml` | `06-future-state-workflow-agent.yaml` | Move to design phase |
| `05-value-modeling-agent.yaml` | `05-value-and-horizons-agent.yaml` | Merge roadmap + horizons UI |
| `06-execution-roadmap-agent.yaml` | *(absorbed into 05)* | Deprecate standalone |
| *(new)* | `04-initiative-generator-agent.yaml` | Create from merged 4+5 |

---

## Pending Emmanuel pin

- [ ] Final agent count (6 confirmed?)
- [ ] Agent 4 vs 5 split on horizon bucketing
- [ ] Workflow-per-horizon in v1 or v2
- [ ] Sanitized v6 delivery
- [ ] Process flow training pack location

**Do not restructure YAML files until pin received** — architecture doc is draft.
