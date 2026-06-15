# Agent Specs & Planning

Structured specs for the 6-agent BC pipeline. **Planning complete before build.**

## Structure

```
specs/
├── pipeline.yaml              # Orchestration, build order, deliverable mapping
├── perspectives/
│   └── stakeholder-lenses.yaml  # 11 stakeholder perspectives
├── agents/
│   ├── 01-interview-scope-agent.yaml
│   ├── 02-live-interview-agent.yaml
│   ├── 03-current-state-process-mapping-agent.yaml
│   ├── 04-future-state-workflow-agent.yaml
│   ├── 05-value-modeling-agent.yaml
│   └── 06-execution-roadmap-agent.yaml
└── planning/
    ├── 00-master-plan.md
    ├── 01-interview-scope-agent-plan.md   ← detailed (build first)
    ├── 02-live-interview-agent-plan.md
    ├── 03-current-state-process-mapping-agent-plan.md
    ├── 04-future-state-workflow-agent-plan.md
    ├── 05-value-modeling-agent-plan.md
    ├── 06-execution-roadmap-agent-plan.md
    └── mckinsey-resources-needed.md
```

## Status

| Agent | v1 Spec | v3 (Emmanuel) | Plan | Build |
|-------|---------|---------------|------|-------|
| 1 Scoping | 01-interview-scope | ✅ same | ✅ | ⏸ Week 2 |
| 2 Interview (Walter) | 02-live-interview | ✅ same (now #2) | ✅ | ⏸ Week 2 |
| 3 Process Mapping | 03-current-state | ✅ same (now #3) | ✅ | ⏸ |
| 4 Initiatives + impact | — | ✅ **new scope** | ⬜ | ⏸ |
| 5 Future State | 04-future-state | ✅ separate from 4 | ⬜ | ⏸ |
| 6 Roadmapping H1–3 | 06-roadmap (partial) | ✅ diagnostic close | ⬜ | ⏸ |
| 7 BRD | part of old 04 | ✅ design phase | ⬜ | ⏸ |

**Architecture:** See `planning/agent-architecture-v3-emmanuel-proposal.md` (current)  
Previous: `agent-architecture-v2.md` (Recording 189), v1 YAML specs (pre-merge)

## Next step

Review `planning/01-interview-scope-agent-plan.md` and `mckinsey-resources-needed.md`.  
When you have internal McKinsey references, share them — we'll update specs before coding Agent 01.
