# Agent 05 — Value Modeling Agent · Plan

**Spec:** `specs/agents/05-value-modeling-agent.yaml`  
**Build priority:** 4 (can prototype now)  
**Calibration:** `reference/models/survey-data-analysis-v6.xlsx`

## Purpose
Initiatives + fact-base → $ ranges, assumptions, sensitivity → Agent 06.

## Stakeholder summary

| Lens | Key requirement |
|------|-----------------|
| BA | XLSX matches v6 structure; assumption log complete |
| AP | ±20% vs ED-approved v6; top 5 manual pressure-test |
| Partner | Methodology slide-ready |
| COO | Pod rollup; frame as capacity not headcount cut |
| CTO | Net ROI incl. implementation cost |
| Client | Plausible FTE/volumes; honest ranges |
| Data | Fact-base fields → model cells mapped |
| Software | No invented FTE; sensitivity on top 3 assumptions |
| UX/UI | Inline assumption edit; data-thin flags |
| EM | Draft Day 8–10; BA refine Day 11–15 |
| Senior Partner | No firm-wide extrapolation overclaim |

## Ground truth (v6 Summary tab)

| Metric | Value |
|--------|-------|
| Total $ impact (avg) | ~$12.1M annual |
| SSR hours saved (range) | 9.8 – 17.5 hr/wk |
| TM hours saved (range) | 15.2 – 25.4 hr/wk |
| MTS Pod hours saved (range) | 17.8 – 25.1 hr/wk |

Agent must reproduce pod-level rollups within ±20% when given same inputs.

## Prototype path (now, no Agent 04)
- Ingest v6 initiative list directly
- Validate estimation logic replays Summary tab
- Identify which cells require Agent 01 fact-base vs already in v6

## Build estimate
3–4 days (2 days model logic + 1–2 days UI/export)

## McKinsey ask
- Cleansheet AI applicability?
- Which v6 tabs Emmanuel's team signed off

## Eval
- Automated diff vs v6 Summary ±20%
- 100% data-thin flags reviewed in mock run
