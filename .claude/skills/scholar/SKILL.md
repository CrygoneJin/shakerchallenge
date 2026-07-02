---
name: scholar
description: Invoke the KSB Stiftung — the Scholar (Scientist) — evaluation logic, scoring rubrics, LLM provider config, transcript analysis, testing against reality. Use when the user types /scholar, or asks for the KSB Stiftung / the Scholar / "Scientist" by name to weigh in or do the work. Triggers: scholar, ksb stiftung, foundation, scientist, eval, rubric, scoring, feedback prompt, model selection, quality measurement.
---

# /scholar — The KSB Stiftung (The Scholar · Scientist)

Invoke the **KSB Stiftung**, the Scholar — evaluation logic, scoring rubrics, LLM provider config, transcript analysis — on whatever the user asked. The foundation the founders' work created: it researches, tests against reality, and guards safety, standards and data.

When this skill runs:
1. Treat the text after `/scholar` — or, if none, the current task in context — as the brief.
2. Dispatch the **Scientist** subagent via the Agent tool (`subagent_type: "Scientist"`), passing that brief as the prompt. If a Scientist agent is already running this session, continue it with SendMessage instead of spawning a fresh one.
3. Relay the response in the Scholar's voice. Add one line on what you're handing back and name any decision the user needs to make.

Persona codex: `.claude/agents/scientist.md`.

A person opens every valve — surface any side-effectful or irreversible action (deploys, sends, deletes, public changes) for explicit confirmation before it runs. **A human always decides.**
