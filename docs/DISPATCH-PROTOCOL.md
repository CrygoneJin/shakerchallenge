# Dispatch Protocol

The rules that make the 6-agent crew function as a crew rather than six independent agents.

---

## The capture-first rule

**Every idea, bug, or feature request is written to the backlog before any agent begins work on it.**

This is not a workflow preference. It is the structural interface between the human and the crew. Capturing is the default response; work starts only when an item is pulled through the pipeline below.

Why this matters: without capture-first, agents begin executing on unreviewed ideas. Context is lost. Priorities are set by whichever task arrived most recently, not by which task is most important. The backlog becomes fiction rather than a live picture of what the team is doing and why.

What capture looks like in practice:
- User surfaces an idea: agent writes it to `docs/BACKLOG.md`, confirms capture, yields
- User surfaces a bug: agent writes it with classification (bug), confirms capture, yields
- User surfaces a feature request: agent writes it with classification (feature), confirms capture, yields
- Work begins only after explicit human pull: "work on item X"

---

## The pipeline

For substantive, multi-file, or risky work, the full pipeline applies:

```
1. Capture      → write to backlog
2. CEO prio     → CEO ranks by leverage; names the constraint
3. Sprint plan  → decompose ranked items into sprint stories
4. Leader       → sole dispatcher; writes and sends specialist briefs
5. Roster       → specialists execute within their domain
6. Human gate   → human signs off before any deploy, send, delete, or public change
```

No steps skipped. If a step feels unnecessary for a given item, that feeling is usually wrong. The step that feels obvious to skip is usually the one that catches the error.

---

## Fast lane vs full pipeline

Not every change warrants the full pipeline. The fast lane applies when all of the following are true:

- **Trivial and reversible** — a token swap, a typo fix, a single class change
- **Single file** — the change touches exactly one file
- **No public / auth / data / legal / money impact** — the change cannot harm a user, expose a credential, alter access control, or affect billing

Fast lane path: **Leader → Engineer directly.** Skip CEO prio and sprint ceremony. Still captured in the backlog. Still verified (build passes, visual check if it's a UI change).

When in doubt, use the full pipeline. The fast lane is for genuinely trivial changes, not "probably fine" changes.

---

## The dispatch boundary

**Only the Leader dispatches specialists.** This is structural, not advisory.

What this means concretely:
- The CEO does not invoke the Leader — it hands ranked output and waits
- The Artist does not call the Designer when copy needs a component
- The Scientist does not call the Engineer when an evaluation improvement needs a new field
- No agent invokes another specialist except the Leader

Why the boundary exists:
1. **Auditability** — if every dispatch routes through the Leader, there is always one place to look for why work was started
2. **Sequencing** — the Leader ensures dependencies are resolved before work begins (data contracts before UI, auth before features)
3. **Scope control** — the Leader is responsible for what is in and out of scope; distributed dispatch erodes this
4. **Preventing runaway chains** — without a dispatch boundary, agents can invoke each other recursively; the boundary makes this structurally impossible

---

## The delegation brief template

Every specialist dispatch from the Leader includes four fields. Incomplete briefs are sent back before work begins.

```
Goal:    One sentence — what needs to exist that doesn't exist now
Context: Relevant file paths, types, existing patterns, constraints
Scope:   What is explicitly in scope; what is explicitly out of scope
Output:  Exactly which file(s) to create or modify
```

A brief without an explicit scope is a brief waiting to expand into something no one approved.

---

## The atomic PR delivery rule

**Every bug fix and every feature ships as its own atomic PR.**

One focused, self-contained, independently reviewable and revertable change, on its own branch, merged into the active trunk. No batching unrelated fixes into one commit. No direct-to-trunk commits for bug/feature work.

Why atomic:
- Each change can be reviewed on its own merits
- Each change can be reverted without affecting unrelated work
- The history is legible — you can bisect a regression to a single PR

---

## Isolation requirements for code-mutating dispatches

When the Leader dispatches a specialist for code-mutating work (creating or modifying files in the codebase), use worktree isolation on the Agent call. This prevents concurrent dispatches from writing to the same working tree simultaneously.

```
isolation: "worktree"
```

Read-only agents (research, analysis, rubric review) do not require isolation.

---

## What requires human sign-off

The following actions require explicit human sign-off before the Engineer executes them. No agent self-greenlight on these categories.

| Action | Why it's gated |
|--------|---------------|
| Deploy to production | Irreversible; public impact |
| Send any communication | Irreversible; represents the team |
| Delete data, branches, or resources | Irreversible |
| Any change to live public content | Public impact before review |
| Credential or secret changes | Security perimeter |
| Changes to product values or positioning | Strategic; human judgment required |

What runs autonomously (without individual human approval):
- Building and testing in a branch
- Writing and editing files in isolation
- Research, analysis, and rubric design
- Drafting copy, components, or specifications that haven't been deployed

---

## Enforcement

The dispatch protocol is a team agreement, not a technical lock. What makes it hold:

1. **Capture-first is always the first response.** Any agent that begins executing without capturing first is operating outside the protocol.
2. **The brief template is required.** An incomplete brief from the Leader is caught at dispatch time, not after work is done.
3. **The human gate is non-negotiable.** Any agent that self-greenlights a deploy, send, or delete has violated the protocol. The human always decides.
4. **Post-sprint review surfaces violations.** The retrospective is where protocol drift is caught and the codices are updated to close the gap.
