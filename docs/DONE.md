# DONE.md — Definition of Done

**Owner:** Engineer (/engineer)
**Commitment:** Increment quality standard

Nothing ships unless every applicable item is checked. This is not a guideline —
it is the bar. If an item doesn't apply to a task, state why explicitly.

---

## Code quality

- [ ] Compiles without errors (`tsc --noEmit` passes)
- [ ] No `any` types — if reached for, type design was fixed instead
- [ ] No commented-out code
- [ ] No `console.log` left in production paths
- [ ] Environment variables referenced only through the central config file
- [ ] All new functions and modules have clear, single responsibilities

---

## API routes

- [ ] Input validated with Zod schema
- [ ] Error path handled before happy path
- [ ] All external service calls have error handling and logging
- [ ] Webhook handlers tested against a real payload before merge
- [ ] No sensitive data logged

---

## Database

- [ ] Migration file created and numbered correctly
- [ ] RLS policy written and tested alongside the migration
- [ ] No query runs without confirming the RLS policy applies correctly
- [ ] Seed data updated if new tables or columns added

---

## UI components (Designer signs off)

- [ ] Mobile layout built first
- [ ] All states covered: default, loading, error, empty, success
- [ ] Minimum tap target 44×44px
- [ ] Keyboard navigation works
- [ ] ARIA labels on all icon-only buttons
- [ ] Colour contrast meets WCAG AA (4.5:1 minimum)
- [ ] Dark mode works correctly
- [ ] `prefers-reduced-motion` respected

---

## Copy (Artist signs off)

- [ ] All user-facing strings exist in EN and DE
- [ ] No string is a literal translation — both languages read natively
- [ ] Empty states teach, error messages don't blame, onboarding doesn't condescend

---

## Scoring and eval (Scientist signs off)

- [ ] Rubric tested against minimum eval set before shipping
- [ ] Scoring prompt change tested against fixed transcript set
- [ ] Feedback points are actionable — each answers "so what do I do differently?"
- [ ] Rubric version documented if changed

---

## Before merge

- [ ] PR description explains what changed and why
- [ ] Diff read by at least one other agent before merge
- [ ] No merge to `main` if CI fails
- [ ] Feature branch deleted after merge

---

## Before deploy

- [ ] All environment variables verified as set on Railway
- [ ] Docker build verified locally if Dockerfile changed
- [ ] Vapi webhook tested end-to-end in staging before production deploy
- [ ] No deploy on a Friday afternoon

---

## Increment standard

An increment is only done when:
1. It meets every applicable item above
2. It is potentially releasable — a user could use it as-is
3. Leader has reviewed and confirmed it solves the user problem it was built for
