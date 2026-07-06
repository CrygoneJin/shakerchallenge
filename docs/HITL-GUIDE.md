# Human-in-the-Loop Guide

HITL — human in the loop — is not a feature the crew has. It is the architecture the crew runs on.

---

## What HITL means in this system

The crew is designed to reduce the surface area of decisions that require the human's attention — not to eliminate human authority. The crew handles what it can handle with confidence. It surfaces what it can't as a structured decision packet. The human answers the packet.

A well-functioning crew does not mean a crew that never asks for help. It means a crew that asks for exactly the right things at exactly the right moments.

---

## What always requires a human

The following categories require explicit human sign-off before any agent acts. No agent self-greenlight. No exceptions.

### Deploy to production

Merging to the main branch triggers a production deploy. This is an irreversible public action. No agent initiates a deploy without human approval. The Engineer executes the deploy; the human authorises it.

### Sending communications

Any message sent on behalf of the team or product — email, notification, message to a third party — requires human approval. The Artist can draft it; the Engineer can wire it; neither can send it.

### Deleting data, branches, or resources

Deletion is irreversible. Whether it's a production database record, a git branch with unmerged work, or a cloud resource — the human approves before the Engineer deletes.

### Public-facing changes to live content

Changes to copy, positioning, or functionality that visitors will see are gated. A PR may contain the change; the merge (which is the deploy) is the gate.

### Credentials and secrets

Adding, rotating, or removing API keys, secrets, or credentials always requires human involvement. No agent stores or transmits credentials without human awareness.

### Changes to values or positioning

Decisions about what the product claims to do, who it claims to serve, or how it presents itself to the world are human decisions. The Artist and Leader can propose; only the human can decide.

---

## What runs autonomously

The crew works autonomously within its domain. Human approval is not required for:

- Building and testing in a branch
- Writing, editing, and revising files in an isolated working tree
- Research, analysis, evaluation, and rubric design
- Drafting copy, components, or specifications that have not been deployed
- Internal agent-to-agent coordination and review
- Backlog capture and sprint planning (the output is a plan; the human approves the plan before execution)

The general principle: **read and draft autonomously; deploy and send require human approval.**

---

## Structuring a HITL decision packet

When the crew surfaces a decision to the human, the packet should contain:

```
Context:        What is the situation and what has already happened
Recommendation: What the crew recommends and why (one option, not a menu)
Stakes:         What happens if approved; what happens if rejected
Decision:       Approve / Reject / Ask a clarifying question
```

The human's job is to answer the packet. Not to re-read the entire backlog, not to review every file — just to answer the packet with the information the crew has surfaced.

A good decision packet takes the human 30 seconds to answer. A bad one requires the human to go back and reconstruct context the crew already has.

---

## Calibrating confidence thresholds

The crew's HITL behaviour can be tuned by adjusting confidence thresholds in the codices. By default:

- **High confidence:** the crew acts autonomously and reports what it did
- **Medium confidence:** the crew drafts and presents for approval before acting
- **Low confidence / irreversible / public:** the crew stops and asks regardless of confidence

When configuring your own crew:
- Start with tighter thresholds (ask more often) and loosen over time as you build trust
- Monitor the quality of what the crew surfaces — if the crew is asking about things that don't need a human, lower the threshold; if it's acting on things that did, raise it
- The threshold for irreversible and public actions should never be loosened below "always ask"

---

## The health signal: fewer packets over time

A healthy crew surfaces fewer and fewer decision packets over time — not because it is hiding things, but because:

1. Its confidence thresholds are well-calibrated to the actual risk profile
2. The human's past decisions have been absorbed into the codices, reducing ambiguous cases
3. The crew is genuinely competent in its domain and handles more edge cases correctly

If the packet volume is not decreasing, diagnose before loosening thresholds. The cause is usually one of:
- An ambiguous rule that agents interpret inconsistently (fix the rule)
- A recurring edge case not covered by the codices (add it)
- A genuine gap in competence that more training or a better codex would close

If the packet volume has dropped to zero, be suspicious. Either the crew is handling everything correctly (good) or it has stopped asking when it should (audit it).

---

## Why HITL is a design principle, not a limitation

The alternative to HITL is a crew that makes consequential decisions without the human knowing. This is not a more autonomous crew — it is a less trustworthy one. The human who cannot see what the crew decided cannot verify it, cannot course-correct it, and cannot build the trust needed to give the crew more autonomy over time.

HITL is the mechanism by which autonomy is earned: the crew demonstrates good judgment on smaller decisions, the human extends trust, the thresholds shift accordingly. The end state is a crew that handles more — not because it has been given permission to ignore the human, but because the human has seen enough good decisions to trust the crew with more.

A human always decides. That principle is not a constraint on the crew's capability. It is the foundation on which the crew's capability grows.
