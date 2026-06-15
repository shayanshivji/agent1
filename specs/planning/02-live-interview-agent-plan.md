# Agent 02 — Live Interview Agent · Plan

**Spec:** `specs/agents/02-live-interview-agent.yaml`  
**Build after:** Agent 01 approved guides exist  
**Blocked by:** Firm AI-interview policy (see `mckinsey-resources-needed.md`)

## Purpose
Autonomous SME interviews from approved guides → transcript + structured summary → Agent 03.

## Stakeholder summary

| Lens | Key requirement |
|------|-----------------|
| AP | Spot-check 2/pod; escalate thin responses before mapping |
| Client | Plain language; option to request human mid-session |
| UX/UI | Mobile-friendly SME chat; BA side-by-side transcript/summary |
| Software | Streaming session, coverage scorer, escalation webhook |
| Partner | Quality narrative for "AI interviewed team" if client-facing |
| EM | Parallel interviews Week 2; dashboard by status |
| BA | Summary maps 1:1 to guide sections |
| Data | Turn-level timestamps; link to question IDs |
| CTO | PII handling; SSO for KKR phase |
| COO | 30–45 min max; avoid peak SLA hours |
| Senior Partner | Consent template; compliance sign-off |

## v1 scope recommendation
- **Channel:** Web chat only (no voice v1)
- **BC SMEs:** Role-play APs with real guides
- **Escalation:** Coverage score <0.85 → human queue

## Build estimate
3–4 days after Agent 01 + policy clarity

## Open decisions
- OD-02-001: Chat vs email async
- OD-02-002: Disclose AI interviewer upfront?

## Eval
- Completion rate on 5 role-play interviews
- AP rates depth ≥80% vs manual baseline
