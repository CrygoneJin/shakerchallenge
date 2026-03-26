# SPRINT.md — Sprint Backlog

**Owner:** Leader (/leader)
**Commitment:** Sprint Goal

---

## Current Sprint

**Sprint:** 1
**Duration:** 2 weeks
**Start:** [add date]
**End:** [add date]

### Sprint Goal

> A sales rep can open the app, pick a scenario, complete a call with Peter Hofmann,
> and receive a scored feedback report — end to end, on mobile, in under 5 minutes.

This is the core loop. Nothing else ships until this works.

---

## Sprint Backlog

| # | Task | Agent | Status | Notes |
|---|------|-------|--------|-------|
| 1.1 | Scenario selection screen — mobile layout, all states | Designer | 🔲 To do | |
| 1.2 | Difficulty selector component | Designer | 🔲 To do | |
| 1.3 | 30-second scenario brief screen | Artist + Designer | 🔲 To do | EN/DE copy needed |
| 1.4 | Vapi call start/end API route | Engineer | 🔲 To do | |
| 1.5 | Peter Hofmann system prompt — Beginner/Advanced/Expert | Artist | 🔲 To do | EN/DE |
| 1.6 | Post-call scoring rubric v1 | Scientist | 🔲 To do | |
| 1.7 | Scoring pipeline — webhook → score → DB write | Engineer | 🔲 To do | |
| 1.8 | Feedback screen — score + 3 action points | Designer + Artist | 🔲 To do | |
| 1.9 | End-to-end test: call start → transcript → score → feedback | Engineer | 🔲 To do | |

**Status key:** 🔲 To do · 🔄 In progress · ✅ Done · 🚫 Blocked

---

## Daily check-in format

Each agent updates their tasks daily with status + one line on blockers:

```
[Agent] [Task #] → [Status] — [blocker or next action]
Example: Engineer 1.4 → 🔄 In progress — webhook payload schema confirmed, writing handler
```

---

## Sprint Review checklist

Before the sprint closes, Leader verifies:
- [ ] Core loop works end-to-end on a real iPhone
- [ ] Score is produced for every completed call
- [ ] Feedback shows 3 actionable points in EN and DE
- [ ] No `any` types in merged code (Engineer)
- [ ] All new components have loading and error states (Designer)
- [ ] Scoring rubric has been tested against at least 3 transcripts (Scientist)
- [ ] All new copy exists in both EN and DE (Artist)

---

## Sprint Retrospective prompts

After each sprint, Leader asks each agent:
- **What worked?** (keep doing)
- **What didn't?** (stop doing)
- **What should we try?** (experiment next sprint)

---

## Release Plan

| Milestone | Goal | Target |
|---|---|---|
| Alpha | Core loop working (solo rep, one persona) | Sprint 1–2 |
| Beta | 3 personas, scoring stable, manager can observe | Sprint 3–4 |
| v1.0 | Full EN/DE, GDPR compliant, manager dashboard | Sprint 5–6 |
