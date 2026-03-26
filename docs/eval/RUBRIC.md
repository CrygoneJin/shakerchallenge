# docs/eval/RUBRIC.md

**Owner:** Scientist (/scientist)
**Version:** v0.1 — pre-eval (no ground truth transcripts validated yet)
**Status:** Draft. Minimum eval set not yet run. Do not treat scores as reliable.

> "How would we know if this score was wrong?"
> Until that question is answerable for every criterion, the rubric isn't ready.
> — Feynman

---

## Rubric: Sales Call Quality v1

Evaluates a sales rep's practice call with Peter Hofmann (or any persona) on
observable, transcript-level behaviour. Every criterion must be scoreable by a
third party reading only the transcript — no inference about intent.

---

### Criteria

| # | Criterion | Weight | Pass condition | Fail condition |
|---|-----------|--------|----------------|----------------|
| 1 | **Opening & rapport** | 15% | Rep introduces themselves and the purpose of the call within the first 3 turns. Uses the prospect's name at least once. Does not launch into a pitch. | Rep skips introduction, does not use prospect's name, or opens with a feature list. |
| 2 | **Needs discovery** | 25% | Rep asks at least 2 open-ended questions about the prospect's situation before proposing a solution. Listens — does not interrupt or redirect before the prospect finishes. | Rep asks only yes/no questions, asks fewer than 2 discovery questions, or proposes a solution before any discovery. |
| 3 | **Product knowledge** | 20% | Rep accurately describes at least one product capability relevant to a need the prospect expressed. No factual errors about the product. | Rep states an inaccurate product claim, describes a feature the product does not have, or fails to connect any product capability to a stated need. |
| 4 | **Objection handling** | 20% | When the prospect raises an objection, rep acknowledges it explicitly ("I understand that…"), addresses the substance, and does not abandon the call. | Rep ignores the objection, becomes defensive, talks over the prospect, or concedes without addressing the substance. |
| 5 | **Closing** | 10% | Rep proposes a clear next step before the call ends (follow-up meeting, demo, send materials). Step is specific — not "I'll be in touch." | Rep ends the call without proposing any next step, or proposes something vague ("maybe we can talk again sometime"). |
| 6 | **Communication clarity** | 10% | Rep's sentences are complete and structured. No filler-heavy or circular answers. Prospect does not ask the rep to repeat or clarify more than once. | Rep's responses are fragmented, heavily filler-laden, or circular. Prospect asks for clarification more than once due to rep's communication, not complexity. |

**Total: 100%**

Scoring: each criterion is PASS (full weight) or FAIL (0). No partial credit in v1.
Overall score = sum of weights for passed criteria × 100.

---

### Failure mode test cases

**Criterion 1 — Opening & rapport**
- False positive: Rep says "Hi, I'm Sarah from Acme, calling about our solution."
  Uses their name, states purpose, but immediately follows with a 3-minute pitch.
  This should FAIL (no rapport, immediate pitch) but would PASS the criterion
  as written because it technically meets all pass conditions. → **Fix: add "does not
  launch into a pitch within 2 turns" to pass condition.**
- False negative: Rep opens with "Hey Peter, good to finally speak — I know you've
  been looking at this for a while." Warm, uses name, implies purpose — but doesn't
  state purpose explicitly. Criterion would FAIL when it should arguably PASS.
  → **Accept for v1. If this becomes a pattern, loosen pass condition to "implies
  purpose clearly."**

**Criterion 2 — Needs discovery**
- False positive: Rep asks "What are your biggest challenges?" and "And what else?"
  — two open-ended questions, technically passes. But both are generic and produce
  no useful information about fit. → **Fix in v2: add "questions must relate to the
  prospect's stated context."**
- False negative: Rep asks one very detailed, multi-part open question that covers
  all necessary discovery ground. Fails on "at least 2" when discovery was clearly
  done. → **Accept for v1; revisit threshold after 10+ transcripts.**

**Criterion 3 — Product knowledge**
- False positive: Rep accurately describes a feature, but it's irrelevant to anything
  the prospect said. Scores PASS. Should FAIL — accuracy without relevance is a
  different problem. → **Pass condition already requires "relevant to a need the
  prospect expressed." Enforce strictly.**
- False negative: Rep demonstrates deep product knowledge through questions
  ("Are you currently using X? Because we handle that differently…") rather than
  explicit statements. Might fail if scorer requires declarative statements. →
  **Clarify in scoring guide: implicit demonstration of knowledge via targeted
  questions also counts.**

**Criterion 4 — Objection handling**
- False positive: Rep says "I understand your concern" (acknowledges) then changes
  the subject. Scores PASS on acknowledgement, misses substance. → **Pass condition
  requires "addresses the substance" — enforce strictly. Parroting acknowledgement
  alone is a FAIL.**
- False negative: Rep addresses objection confidently but doesn't use the exact phrase
  "I understand" or similar. Scorer marks FAIL because acknowledgement isn't explicit.
  → **Scoring guide must clarify: acknowledgement can be implicit ("That's a fair
  point…", "You're right that…") — literal phrase not required.**

**Criterion 5 — Closing**
- False positive: Rep says "Let me send you our deck." Specific action, but rep-
  driven, not agreed. Prospect did not confirm. Scores PASS. → **v1 accepts this.
  Flag for v2: mutual agreement on next step is a stronger signal.**
- False negative: Prospect proposes the next step ("Can we set up a demo?") and rep
  confirms. No rep-initiated close, but outcome is the same. Strict read fails this.
  → **Scoring guide: rep accepting and confirming a prospect-initiated next step
  counts as a PASS.**

**Criterion 6 — Communication clarity**
- False positive: Rep is perfectly fluent but gives non-answers — clear sentences,
  no substance. Passes clarity, fails on value. → **Clarity criterion doesn't measure
  substance; that's covered by criteria 2 and 3. Accept this as a feature.**
- False negative: Rep has a slight accent or non-native phrasing that reads as
  "unclear" to a scorer. Structure is fine; only surface-level fluency is different.
  → **Scoring guide: criterion evaluates structural clarity and prospect comprehension,
  not native fluency. Accent is irrelevant.**

---

### Minimum eval set

Before this rubric ships, the following must be tested:

| Test case | Criterion tested | Expected result |
|-----------|-----------------|-----------------|
| Transcript: rep opens with immediate pitch, no intro | 1 | FAIL |
| Transcript: rep opens warmly, uses name, states purpose | 1 | PASS |
| Transcript: rep asks only "Are you interested in X?" | 2 | FAIL |
| Transcript: rep asks 2+ open questions before any solution mention | 2 | PASS |
| Transcript: rep states a product feature that doesn't exist | 3 | FAIL |
| Transcript: rep correctly connects a real feature to a stated need | 3 | PASS |
| Transcript: prospect objects, rep says "I understand" then changes subject | 4 | FAIL |
| Transcript: prospect objects, rep acknowledges + addresses substance | 4 | PASS |
| Transcript: call ends, rep says "Great, let's stay in touch" | 5 | FAIL |
| Transcript: rep proposes "Let's do a 30-minute demo next Tuesday" | 5 | PASS |
| Transcript: rep uses "um", "like", "basically" heavily; prospect asks "can you say that again?" twice | 6 | FAIL |
| Transcript: rep answers clearly; prospect never asks for clarification | 6 | PASS |

Minimum: 12 test transcripts (2 per criterion) before v1 ships.
Current status: 0 / 12 validated. **Rubric is not ready to ship.**

---

### Notes for v2

- Add partial credit (0 / 0.5 / 1.0) once patterns from real transcripts are clear
- Consider separating "discovery quantity" (# of questions) from "discovery quality"
  (relevance of questions) in criterion 2
- Closing criterion should require mutual agreement, not just rep-proposed action
- Add criterion for **pacing** — does the rep allow silence? Does the prospect get
  time to think?
- Add criterion for **personalisation** — does the rep reference something specific
  about the prospect's context, or is the call generic?
