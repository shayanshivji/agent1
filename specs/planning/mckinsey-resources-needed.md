# McKinsey Internal Resources Needed

Use this list when connecting with firm experts (Colin, Emmanuel, ProcessAI team, GM&S knowledge, etc.).  
**Share references back and we'll update agent specs before build.**

## Priority 1 — Blocks Agent 01 & 03 build

| Resource | Needed for | Questions to ask | Status |
|----------|-----------|------------------|--------|
| **ProcessAI** | Agents 03, 04 | API/docs? Batch vs interactive? VB data handling? Sample sales-support outputs? | ⬜ Request |
| **Workflow / discovery taxonomy** | Agent 01 | Prior PE sales-support workflow libraries in firm KB? ENS scope checklist? | ⬜ Request |
| **Interview guide template** | Agent 01, 02 | Standard Word/PPT format GM&S uses for SME guides? | ⬜ Request |
| **Document ingestion (IndexAI?)** | Agent 01 | Firm standard for RAG over client PPTX/PDF/XLSX vs custom pipeline? | ⬜ Request |

## Priority 2 — Blocks Agent 05 & client-quality exports

| Resource | Needed for | Questions to ask | Status |
|----------|-----------|------------------|--------|
| **Cleansheet AI** | Agent 05 | Applicable to support-function productivity or only cost/pricing? | ⬜ Request |
| **Value case Excel template** | Agent 05 | Standard GM&S productivity model structure? Relationship to Cleansheet? | ⬜ Request |
| **v6 model sign-off** | Agent 05 calibration | Which tabs/numbers are ED-approved final from original study? | ⬜ Request |
| **PPT / Visio / Word templates** | All export steps | Firm-approved diagnostic, process map, roadmap slide masters? | ⬜ Request |
| **BRD template** | Agent 04 | Horizon 1 BRD section taxonomy (exec summary, features, rules, KPIs)? | ⬜ Request |

## Priority 3 — Compliance, scaling, methodology

| Resource | Needed for | Questions to ask | Status |
|----------|-----------|------------------|--------|
| **AI client interaction policy** | Agent 02 | Can SMEs be interviewed by AI? Consent template? Data retention? | ⬜ Request |
| **Client data + LLM policy** | All | External LLM allowed during BC? McKinsey-hosted models required for KKR phase? | ⬜ Request |
| **Procurement/Pricing BC learnings** | Pipeline design | What transferred vs didn't for sales support? Agent patterns that worked? | ⬜ Request |
| **Initiative / feasibility rubric** | Agents 04, 06 | Compendium rubric once aligned — firm standard scoring? | ⬜ Request |
| **PE value creation roadmap template** | Agent 06 | Standard 100-day + Year 1 format for portco steerco? | ⬜ Request |
| **McKinsey platform migration** | Deploy phase | Path from Vercel prototype to apps.mckinsey.com pattern (auth, compliance)? | ⬜ Request |

## People to reference (from your context)

| Person | Likely knowledge |
|--------|------------------|
| **Emmanuel (AP/ED)** | Original VB study scope, quality bar, v6 approved numbers, must-have workflows |
| **Colin** | Agent architecture, Cursor workflows, AI tooling choices |
| **Robin / Isabella / Shreya** | NSP and order visibility workstreams, value estimate alignment |
| **Max Fox / SAP alliance** | JK Tech integration constraints, system dependency assessment |
| **Satish (JK Tech)** | QB 101, execution feasibility — not SI, force multiplier |

## How to share back

When you get internal materials, add to:

```
reference/mckinsey-internal/   ← create as needed
specs/agents/*.yaml             ← update open_decisions + integrations
```

Or paste summaries in chat and we'll patch specs.
