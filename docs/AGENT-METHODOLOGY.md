# Agent Methodology — the foundation of apuna/core

The Apuna agent crew (the codices in `.claude/agents/`, the invoke-skills in `.claude/skills/`) is the
foundation of **apuna/core**. Two structural ideas, adapted from the Schatzinsel project, govern how the
crew works and improves. Schatzinsel-specific framing (its game/book, German-only mandate, its CxO
line-up) is intentionally left out; what follows is the reusable core.

---

## 1. The Padawan structure

Each **master** (the core specialists — Leader, Artist, Designer, Scientist, Engineer, and by extension
the other specialists) may have **one Padawan**: a cheaper, faster apprentice that shadows the master,
does the 80%, and frees the master for the 20% that needs judgement.

- **One padawan per master. No more.** Coders (up to 5) are the Engineer's exception for parallel build.
- **Padawans run on the cheap/fast model** (Haiku-tier). Never elevate a padawan; if a task needs the
  master's judgement, it goes to the master.
- **Never spawn a padawan without a Codex.** The codex is the padawan's persona file. No codex → no padawan.
- **80/20 behaviour baseline.** ~80% deterministic (follows the master's established patterns, repeatable,
  consistent) and ~20% exploratory (questions assumptions, tries alternatives, occasionally surprises the
  master). The Scientist (the Scholar — the KSB Stiftung) owns calibration of this ratio and watches for drift.

### The Codex is living
A padawan's codex is **not** a static profile — it grows each session:
- After each task: 1–2 lines on what was learned.
- After a mistake: what went wrong, why, what to do differently.
- After a success: what worked, and whether it's reproducible.
- **Own voice:** over time the codex should read more like the padawan than like its master.
- **Contradiction allowed:** where the padawan thinks differently from the master, that belongs in the codex.

A **stagnant codex is a warning sign** — either the padawan isn't learning or isn't writing it down. The
Scientist tracks whether codices grow.

> Each master in this repo (Leader, Artist, Designer, Scientist, Engineer) can field one padawan in this
> spirit; the Engineer additionally fields up to five Coders. The shipped crew leaves the padawans for you
> to cast — see "Re-cast a role" in the README.

---

## 2. Evolutionary coding (the bioinformatics approach)

Treat the codebase **and** the agent crew as an evolving population under selection. The posture is
Darwinian: standards and architecture are maintained by **selection**, not decree.

The loop has the three ingredients of evolution:

- **Variation (mutation).** Generate more than one candidate: several approaches to a design, the
  padawan's 20% exploration, parallel attempts at a hard problem. Monoculture doesn't adapt.
- **Selection (fitness).** Keep what survives scrutiny. Fitness is *measured*, not asserted — the
  Scientist's evals, adversarial verification (try to refute a finding before trusting it), the `/meeting`
  round-table that scores competing options and picks a winner. What can't defend itself is cut.
- **Inheritance (memory).** What survives is written down — into the living codices and the repo's
  decision docs — so the next generation starts from the adapted state, not from scratch.

In practice this is why the crew:
- proposes 2–3 approaches and selects the fittest rather than committing to the first idea;
- verifies adversarially (a claim must survive an attempt to break it — e.g. the contrast audit, the
  fact-check gate on the daily devlog) before it ships;
- prunes relentlessly — the Librarian's fifth law, "a library is a growing organism, *which means it must
  also shed*"; the Architect's "one clean structure, no loose parts"; dead code and orphaned keys removed, not hoarded;
- lets agents improve over time through their codices instead of being frozen at creation.

**Selection needs a measurer with no stake in the outcome.** That is the Scientist's role (separation of
powers): the builder proposes, the measurer decides fitness. A human always makes the final call.

**Fitness, measured per token (the crew health signal).** Efficiency, not "improvement": without a
controlled A/B there is no clean counterfactual, so we measure output quality *per token* and read it
**directionally**, never as an absolute verdict.

> `Efficiency = Benefit / (cost-weighted TokenCost + w·Harms + 1)`
>
> - **Benefit** — human *accepted-on-first-pass-without-rework*, binary (1/0). Ground truth, hard to inflate. A dispatch that ships nothing scores 0 (not infinite efficiency for spending no tokens).
> - **TokenCost** — `subagent_tokens` summed to the task/PR level, **weighted by model tier** (60k Haiku ≈ 60k Opus in count but ~10–20× apart in real cost; raw sums are gameable by pushing work to a padawan). Orchestrator tokens ≈ constant overhead, left out.
> - **Harms** — `human-intervention count + re-dispatch count`, the **anti-gaming guard**: starving a dispatch of context to cut tokens raises interventions/re-dispatches, so efficiency *falls*, by design.

Protocol: compare only same-task-type, same-tier work against a rolling baseline; read the trend, not
the digit; only call a difference real past tens of samples (n=5 is calibration, not proof). Capture is a
one-line-per-dispatch tally (`task-id · type · tier · tokens · outcome-tag`) — log *every* dispatch (or
selection bias rots the numerator). A causal/auditable version (usage-block parser + model-price table +
outcome store, contract `{task_id, task_type, model_tier, subagent_tokens, outcome_tag, harm_counts}`) is
a **gated Engineer follow-on — not built yet**.

**Delegation policy — what a padawan can hold (measured: 2026-06-19 k=5 blind eval).** A blind k=5
evaluation — padawan (Haiku) vs master (Sonnet), identical prompts, graded against ground-truth keys by
independent graders with no stake in the outcome — drew the line empirically:

- **Mechanical / bounded work** (token-consistency audits, structured formatting, scoped code edits) →
  **delegate to the padawan, then a cheap master-or-rule verify pass.** The feared
  hallucination-under-pressure did *not* appear (Haiku invented zero false divergences on the trap-test,
  median 97.5/100); its only failure mode is an occasional *miss*, which a master's read catches cheaply.
- **Judgment-bearing work** (sequencing, surfacing a buried decision) → the padawan may draft, but the
  master's brief **must explicitly prompt for the load-bearing decision** — the padawan produces work that
  *looks* complete while silently dropping the highest-stakes open call (only 2/10 Haiku runs surfaced a
  hidden GDPR/consent decision). Draft with the padawan, then verify that the decisive item is present.
  (This is why the dispatch brief cross-references the `MEMORY.md` invariants — see `CLAUDE.md`.)
- **Taste / native-language work** (German copy, register, credibility) → **escalate to a native human
  (a native speaker) — not merely a stronger model.** Both evals confirm it: Haiku floored at 7/100 (30
  false positives), and a follow-up Sonnet-vs-Opus run showed **Opus is no better — it over-flagged *more*
  than Sonnet** (35 vs 17 false positives). Climbing the model ladder does not fix taste; a native speaker does.

**The cross-eval meta-finding:** going up the model ladder fixes only the *mechanical* floor (and it plateaus
at Sonnet — Opus was no better, sometimes worse). It does **not** fix the two failure modes that matter:
*judgment-omission* (every tier dropped the hidden GDPR decision unless explicitly prompted — the fix is the
**prompt**, not the tier) and *taste* (the fix is a **native human**). Spend the model budget where it pays
(mechanical), and spend prompt-discipline and human review where it doesn't.

Caveat: identical-prompt testing biases *against* the padawan (a master tunes the brief to his own model),
so these are a **lower bound** on padawan value — but the failure modes (omission on judgment,
over/under-flagging on taste) are the real risks the policy guards against.

**Execution venue.** Build work — design, scaffold, implement — runs in the background (sprint or
fast-lane dispatch). The human's interface stays free for capture and decisions; results surface
back tersely. The crew's job at the interface is capture + dispatch + decision-surfacing, not
doing the work in front of the human.

---

## 3. Coders — the Engineer's parallel build force

The Engineer is the one master who may field **more than one** apprentice: up to **five Coders**
(Haiku-tier), dispatched for parallel implementation when the work decomposes into independent units.

- **One master per Opus/Sonnet agent; one padawan per master — except the Engineer, who may run up to 5 Coders.**
- Coders are spawned by the Engineer (the Groundlayer — Jakob Becker) and **inherit his authority for the duration of the dispatch** —
  but the same discipline binds them: read existing code first, the minimal correct change, verify before reporting.
- Use Coders for fan-out (e.g. one Coder per file in a migration), not for work that needs a single coherent
  judgement — that stays with the Engineer.

---

## 4. Model assignment — matched to scope and reasoning needs

Each agent's **default model** is chosen by two questions: *how broad / load-bearing is its scope*, and *how
much deliberate reasoning does its work actually need*. Cheap-and-fast where the pattern is known; the
expensive tier only where judgement earns its cost.

| Tier | Model | Who | Why |
|------|-------|-----|-----|
| **Fast** | Haiku 4.5 | **Padawans + Coders** (the apprentices each master casts) | The 80% deterministic work — repeatable patterns, sweeps, formatting, parallel implementation. Speed and cost matter more than deep reasoning; the master holds the judgement. |
| **Default** | Sonnet 4.6 | **Working specialists** (Leader, Artist, Designer, Scientist, Engineer) and any advisors you add | Real domain judgement and multi-step reasoning, but bounded scope. Sonnet is the right cost/quality point for almost all crew work — it is the default for a reason. |
| **Elevated** | Opus 4.8 | Any agent **temporarily taking a Product-Owner or Scrum-Master role**, or a genuinely hard cross-cutting call | More capability for higher-stakes orchestration. **No agent self-elevates** — the Scientist decides: he defines the criteria and measures whether the added capability justifies the cost. |
| **Apex** | Fable 5 | Reserved for the **hardest long-horizon / high-ambiguity** problems (a knotty migration, a design with no obvious shape yet) | A sledgehammer is a wonderful tool — you still don't use it to hang a picture. Reach for it only when the task is genuinely hard; most work runs faster and just as correctly a tier down. |

The principle: **scope sets the floor, reasoning-need sets the ceiling.** A padawan doing a known sweep stays
Haiku no matter how important the sprint; an Engineer resolving a one-way-door architecture call may rise to
Opus for that call. The Scientist owns the calibration, the same way he owns the padawans' 80/20 ratio —
because model choice is just another fitness question: is the extra capability earning its keep?

---

*This document is part of apuna/core's open foundation. The agent prompts themselves are intended to be
given away (see the held "Apuna Core" prompt-giveaway) — the methodology here is how they're meant to be
used: a small crew, each with one apprentice, improving by variation and selection, pruning as they grow.*
