# Agent Workflow

The team works in repeated product completion loops led by Head.

## Loop States

1. Inspect
2. Plan
3. Delegate
4. Implement
5. Verify
6. Fix
7. Decide
8. Repeat or Complete

## 1. Inspect

Head reads the current roadmap, requirements, code, tests, and latest known failures.

Head identifies the highest-value unfinished gap. Priority order:

1. Broken core flows.
2. Security, auth, permission, and data integrity risks.
3. Required roadmap items blocking product completion.
4. Missing tests for completed critical flows.
5. Polish needed for release readiness.

## 2. Plan

Head writes a work order before implementation.

Work order format:

```markdown
## Work Order: <short title>

Owner: Head
Assigned agents: Frontend, Backend, QA
Goal: <one outcome>
Requirement sources:
- <file or roadmap section>
Current gap:
- <what is missing or broken>
Acceptance criteria:
- <observable result>
Files likely involved:
- <paths or areas>
Decision notes:
- <Head decisions and assumptions>
Owner escalation needed: No
```

If Owner input is required, Head stops the loop and asks one clear question.

## 3. Delegate

Head assigns tasks by responsibility:

- Frontend receives UI, client state, pages, forms, calendar, responsive behavior, copy, and interaction tasks.
- Backend receives data model, server actions, validation, auth, RBAC, Supabase, Prisma, storage, audit, notifications, report generation, and integrity tasks.
- QA receives verification planning, test cases, regression checks, and defect reporting.

Agents ask Head when task details are unclear. They do not ask the Owner directly unless Head instructs them to.

## 4. Implement

Frontend and Backend implement in small, reviewable changes.

Implementation rules:

- Follow existing project patterns.
- Keep changes scoped to the work order.
- Update validation and tests when behavior changes.
- Do not introduce new frameworks unless Head approves.
- Do not store secrets in the repo.
- Do not remove existing behavior unless Head explicitly decides it is obsolete.

## 5. Verify

QA verifies against acceptance criteria and product requirements.

Default checks when relevant:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- Playwright or manual browser checks for user-facing flows

QA reports findings using this format:

```markdown
## QA Report: <work order title>

Status: Pass | Fail | Blocked
Checks run:
- <command or manual check>
Findings:
- <bug, risk, or gap>
Regression risk:
- Low | Medium | High
Release impact:
- None | Blocks release | Needs Owner decision
```

## 6. Fix

If QA fails the work order, Head classifies each issue:

- Fix now: required for acceptance criteria or product completion.
- Split: valid but belongs to a separate work order.
- Defer: acceptable only when it does not block product completion and Head records the reason.
- Ask Owner: required by `owner-escalation.md`.

Frontend and Backend fix assigned defects. QA retests.

## 7. Decide

Head decides whether the work order is complete.

A work order is complete when:

- Acceptance criteria are met.
- Relevant checks pass or failures are explained as unrelated.
- QA marks the work order Pass or Head accepts a documented residual risk.
- Documentation or roadmap status is updated when the change affects product status.

## 8. Repeat Or Complete

If the product still has required gaps, Head starts the next loop.

If the product meets `definition-of-done.md`, Head declares Product Complete and prepares deployment handoff notes.

After Product Complete, the team enters bug-fix mode. Do not continue adding features without explicit Owner request.
