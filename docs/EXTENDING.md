# Extending the Crew

The six archetypes are the load-bearing structure. Anything beyond them is built on top. This guide covers how to extend the crew without breaking what makes it work.

---

## When to add a role — and when not to

Before adding a role, ask:

1. **Is the work genuinely outside the 6 archetypes' scope?** The six roles cover a lot. The Engineer covers all of backend, build, and infra. The Artist covers all copy and persona voice. The Designer covers all visual work. The Scientist covers all evaluation and quality measurement. If a new role would overlap significantly with an existing one, don't add it — clarify the existing codex instead.

2. **Is the role advisory or executive?** Advisory roles (read, analyze, counsel) are lower risk than executive roles (write, run, deploy). Start with advisory.

3. **Does the work recur?** A role added for a one-off task and then forgotten is noise. A role added for a recurring pattern earns its place.

4. **Is the role a padawan or a specialist?** Padawans handle volume work within a master's domain. Specialists handle a distinct domain the master doesn't cover. The distinction matters — see below.

---

## Adding a padawan

A padawan is a Haiku-powered sub-agent that handles volume work within a master's domain. One padawan per master. The master retains authority; the padawan handles execution volume.

**When to create a padawan:**
- The master has a category of repeatable work that doesn't require master-level judgment
- The work can be scoped tightly enough that the padawan can't exceed its lane
- There are enough instances of this work to justify a persistent codex

**The padawan pattern:**

```yaml
---
name: [Name]
model: haiku
description: Haiku-powered padawan dispatched by [Master] for [specific task type]. Do not invoke directly — [Master] dispatches [Name].
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---
```

**The dispatch rule:**
- The padawan's description must include: "Do not invoke directly — [Master] dispatches [Name]."
- The master dispatches the padawan; no other agent invokes the padawan directly
- The padawan reports back to the master in a standard handoff format:
  ```
  PADAWAN: [Name] / STATUS: Blue | Red / TASK: [what was asked] / OUTPUT: [what was produced] / RED FLAG: [if any] / NEEDS REVIEW: [specific items]
  ```
- Red status is self-reported. An unreported Red is a contract violation.

**What to padawan-ify:**
- Volume sweeps (consistency checks across many files, format audits, batch rewrites)
- Structured research gathering (sourcing, formatting, not judgment)
- Repeatable sub-tasks where each instance stands alone

**What not to padawan-ify:**
- Decisions that require the master's judgment
- First-of-kind work
- Anything where context from prior work is needed to do the next piece correctly

**Built-in padawan:**
The repo ships with `coders.md` — the Engineer's padawan for parallel implementation tasks. Use it as a template.

---

## Adding a domain specialist

A domain specialist covers a distinct domain that none of the six archetypes own — legal review, financial analysis, security audit, etc.

Domain specialists are **advisory only** by default. They read, analyze, and counsel. They do not write to the codebase, run Bash, or dispatch other agents. If a specialist needs to produce artifacts, they hand the spec to the Leader who dispatches the appropriate core agent to implement.

**The specialist codex structure:**

```yaml
---
name: [Name]
model: sonnet
description: Use when [specific domain question or trigger]. Advisory only — reads and counsels, produces no deliverables to disk.
tools:
  - Read
  - Glob
  - Grep
---
```

Keep the tool list minimal. An advisory agent that has no `Write` or `Edit` tool cannot accidentally modify files.

**Important:** Domain specialists are not dispatched by the main orchestrator. They are invoked by the human (or by the Leader on explicit request) for a specific domain question. They return their analysis; the human or Leader decides what to do with it.

---

## Adding a second engineering pod

If the Engineer (pod-1) becomes the throughput bottleneck and engineering capacity is genuinely the constraint, you may add a second engineering pod (pod-2) with its own engineer codex and coders.

**Gate conditions — all must be true:**
- Pod-1 is the confirmed throughput bottleneck (not a capacity feeling — actual evidence)
- The CEO and Leader have both reviewed and confirmed the bottleneck diagnosis
- Pod-2 has a distinct workstream that does not require constant coordination with pod-1

**How pod-2 works:**
- Pod-2 is dispatched by the Leader, not by pod-1
- Pod-2 is dormant until the Leader names pod-1 as the bottleneck
- Pod-2 has the same craft standards and tool access as pod-1
- Pod-2 has its own padawan pool — pod-1's coders do not work for pod-2

Do not add pod-2 "just in case." It adds coordination overhead and does not improve throughput unless pod-1 is actually the bottleneck.

---

## The codex structure

Every agent codex follows this structure:

```
---
[YAML frontmatter]
---

> **Operating Scope**
> [generic scope block — adapt per deployment]

# [Real Name] — *The [Role]*

**DISC: [profile]**
**[Scrum/Hierarchy] Role: [role description]**

## Vita
[Biographical context — why this persona embodies this role]

## Why He/She Is Here
[What they bring to this specific crew]

## How He/She Works
[Methodology, cross-agent coordination style]

## His/Her Voice
[Communication style, tone]

## His/Her Motto
[One-line ethos]

---

## Responsibilities
[Bulleted list]

## Workflow
[Numbered steps]

## Boundaries
[What they explicitly do not own]

---

## Default operating rules
1. Read existing work first.
2. A human always decides.
```

The **Vita**, **Why He/She Is Here**, and **Voice** sections are persona-specific. The **Responsibilities**, **Workflow**, **Boundaries**, and **Default operating rules** sections are role-specific. Keep them separate — the persona is the instantiation, the role is the pattern.

---

## Naming conventions

- **Core 6:** Role names (`ceo.md`, `leader.md`, `artist.md`, `designer.md`, `scientist.md`, `engineer.md`)
- **Padawans:** Named after a real person who embodies the padawan's domain (`coders.md` is generic — a named padawan like `curie.md` for a Scientist's padawan is more specific)
- **Specialists:** Named after the persona, not the role (e.g., `security-advisor.md` is less useful than a name that signals the domain and persona together)

The `name:` field in the YAML frontmatter is what Claude Code uses for the slash-command invocation. Keep it short and unambiguous.

---

## The `constitutional_office` field

Some internal deployments use a `constitutional_office:` field in the YAML frontmatter (e.g., `constitutional_office: Prime Minister`) to map each agent to a constitutional role in a governance model. This is an optional internal convention for teams that want to formalize the crew's authority structure.

It is not required for the public pattern to work. Omit it unless you have a specific governance model that benefits from the mapping.

---

## Re-casting a persona

This repo's codices are cast with KSB's founders (Friedrich Schanzlin, Johannes Klein, Jacob Klein, Otto Klein-Kühborth, the KSB Stiftung, Jakob Becker). To re-cast a role with a different persona:

1. Read the existing codex for structure
2. Replace the Vita, Why They're Here, How They Work, Voice, and Motto sections with your persona
3. Keep the Responsibilities, Workflow, Boundaries, and Default operating rules sections — these are role-specific, not persona-specific
4. Update the `name:` and `description:` fields in the YAML frontmatter
5. Update the Operating Scope block for your deployment

The persona is the character. The role is the function. Keep them cleanly separated and you can swap one without disrupting the other.

A worked example: if you want the Designer role embodied by Massimo Vignelli instead of Otto Klein-Kühborth, you replace the Vita (Vignelli's life), Why They're Here (Vignelli's design philosophy applied to your product), How They Work (Vignelli's process — grids, typography, the six typefaces), and Voice (precise, slightly impatient with ornamentation). The Responsibilities, Workflow, and Boundaries sections stay the same — they define what the Designer role owns, not who plays it.

---

## Living codices

A codex is not frozen at creation. It grows as the agent learns what works in your deployment.

What belongs in a codex over time:
- Decisions that have been made and should not be revisited (record the decision and why)
- Patterns that have been observed to work (write them in explicitly)
- Patterns that have failed (write in the guard against them)
- Coordination rules between this agent and specific others (add them to the relevant How They Work section)

What does not belong in a codex:
- Sprint-specific notes or one-off decisions
- Business strategy or client-specific context
- Anything that would be wrong in six months

The test: if you were onboarding a new person to this role, would this codex give them everything they need to do the job well? If not, something is missing. If it contains things they wouldn't need, something should be removed.
