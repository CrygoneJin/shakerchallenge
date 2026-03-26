# docs/eval/ANALYSIS.md

**Owner:** Scientist (/scientist)
**Version:** v0 — hypothesis only. No ground truth transcripts have been analysed.
**Status:** Framework established. Populate with real data once transcripts arrive.

> "The first principle is that you must not fool yourself — and you are the
> easiest person to fool."
> — Feynman

---

## Status note

`~/Downloads/claude-code/` was not found on this system. No transcript files
were available for analysis at the time this document was created.

The patterns below are **informed hypotheses** based on:
- The sprint goal (sales call practice, Peter Hofmann persona, EN/DE)
- The rubric criteria in `docs/eval/RUBRIC.md`
- General patterns observed in sales training research

**This document must be replaced with data-driven analysis once real transcripts
are available.** Run `/scientist` with the transcripts in `docs/eval/ground-truth/`
to produce the real version.

---

## What to do when transcripts arrive

1. Copy all `.txt` and `.md` files into `docs/eval/ground-truth/`
2. Run `/scientist` and ask it to:
   - Apply `docs/eval/RUBRIC.md` to each transcript
   - Score each criterion (PASS / FAIL)
   - Note any criterion that was ambiguous to score
   - Identify patterns across all transcripts
3. Update this file with the real findings
4. Update `docs/eval/RUBRIC.md` with any criterion changes that the transcripts expose

---

## Hypothesis: What reps consistently get right

These are the behaviours expected to score PASS most reliably, based on domain
knowledge. Verify against real transcripts.

**1. Opening and introduction**
Reps tend to introduce themselves correctly because it's the most rehearsed part
of any call. The first 30 seconds are usually strong. The rubric will likely show
high pass rates on criterion 1.

**2. Basic product accuracy**
Reps who have used the product or attended training can describe at least one
feature correctly. Accuracy errors tend to occur on edge cases or pricing, not
core functionality.

**3. Surface-level communication clarity**
Reps who are comfortable on calls are usually fluent enough to avoid the "asked to
repeat" threshold in criterion 6. Clarity failures tend to be substance-related
(circular answers) rather than fluency-related.

---

## Hypothesis: What reps consistently get wrong

These are the behaviours expected to score FAIL most reliably. Verify against
real transcripts.

**1. Discovery depth (criterion 2 — highest risk)**
The most common failure mode in sales training transcripts across industries:
reps ask one or two surface questions ("What are your goals?") and move to a pitch
before real needs are surfaced. The persona will not volunteer information freely —
if the rep doesn't dig, the transcript will be shallow.

Expected: majority of early transcripts will FAIL criterion 2.

**2. Closing specificity (criterion 5)**
Reps frequently end calls with vague next steps. "I'll follow up" is a natural
way to end an uncomfortable conversation. Specific next steps require confidence
and a sense that value was demonstrated — which requires passing criteria 2 and 4.

Expected: if criterion 2 fails, criterion 5 will likely also fail. These will
correlate in the data.

**3. Objection substance (criterion 4)**
Reps acknowledge objections but don't address the underlying concern. "I understand
that" followed by a pivot to a different feature is the most common false positive
risk in the rubric. The scoring guide must be strict here.

Expected: criterion 4 will be the hardest to score reliably (see below).

---

## Hypothesis: Which criteria are hardest to score reliably

**Criterion 4 — Objection handling** is expected to be the most scorer-dependent.

Reasons:
- "Acknowledges" and "addresses the substance" are both interpretive
- The line between a legitimate reframe and a dodge is thin in transcript form
- The persona's reaction to the objection handling is not always in the transcript

Mitigation: the failure mode test cases in RUBRIC.md are designed to anchor
scorers. A calibration session (multiple scorers, same transcript, compare results)
should be run before automated scoring is introduced.

**Criterion 2 — Discovery quality** has a quantity threshold (≥2 questions) that
is easy to measure but may not capture quality. A rep who asks "What are your
challenges?" twice has technically passed. The v2 rubric should separate quantity
from quality.

**Criterion 6 — Communication clarity** is susceptible to scorer bias based on
accent, non-native phrasing, or speaking style. The scoring guide must anchor
scorers to structural clarity and prospect comprehension, not fluency aesthetics.

---

## Template: per-transcript scoring record

When real transcripts are available, record results in this format:

```
### Transcript: [filename]
**Date:** [when was this call recorded?]
**Difficulty:** Beginner / Advanced / Expert
**Duration:** [approximate turn count or minutes]

| # | Criterion | Result | Notes |
|---|-----------|--------|-------|
| 1 | Opening & rapport | PASS / FAIL | |
| 2 | Needs discovery | PASS / FAIL | |
| 3 | Product knowledge | PASS / FAIL | |
| 4 | Objection handling | PASS / FAIL | |
| 5 | Closing | PASS / FAIL | |
| 6 | Communication clarity | PASS / FAIL | |

**Overall score:** [X / 100]
**Ambiguities:** [any criterion where the pass/fail was unclear and why]
**Rubric change triggered:** yes / no — [if yes, what changed?]
```

---

## Rubric change log

| Date | Version | Change | Reason |
|------|---------|--------|--------|
| 2026-03-26 | v0.1 | Initial draft | No transcripts; hypothesis-only |

Update this table every time the rubric changes. Include the transcript that
triggered the change. A rubric that never changes after real data arrives was
either perfect (unlikely) or never seriously tested (more likely).
