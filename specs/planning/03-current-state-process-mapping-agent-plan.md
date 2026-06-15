# Agent 03 — Current-State Process Mapping Agent · Plan

**Spec:** `specs/agents/03-current-state-process-mapping-agent.yaml`  
**Build priority:** 2 (prototype parallel to Agent 01)  
**Blocked by:** ProcessAI integration reference

## Purpose
Transcripts + SOPs → ProcessAI → swim-lane maps + pain inventory → Agent 04.

## Stakeholder summary

| Lens | Key requirement |
|------|-----------------|
| AP | Maps match compendium pain themes; ED sign-off on fact packs |
| BA | <20% edit to PPT/Visio export; pain IDs stable |
| Client | 30-min validation per workflow; correct terminology |
| Data | 100% step→transcript traceability |
| Software | Diff vs `reference/decks/20260324_BSN_Process-Maps.pptx` |
| UX/UI | Click step → source quote; pain cards by type |
| CTO | System touchpoints on each step |
| COO | TM→SSR→MTS handoffs visible |
| Partner | Syndicate-ready fact packs |
| EM | Parallel maps; validation tracker |
| Senior Partner | ProcessAI data handling compliant |

## Prototype path (BC, no live transcripts)
Run against:
- Existing process maps PPT (reverse validation)
- Compendium pain points as synthetic "transcript"
- Compare output to known VB baseline

## Build estimate
4–5 days (2 days ProcessAI integration + 2–3 days packaging/UI)

## McKinsey ask
**ProcessAI** — highest priority internal reference. Need API, upload format, sample sales-support output.

## Eval
- Pain point recall vs compendium ≥90%
- Traceability audit 100%
- BA edit rate <20% on 2 workflows
