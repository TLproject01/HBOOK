# Agent Team Prompt Design

## Goal

Create a prompt-only AI development team in `.agents` that can continue this booking system until product completion, ask the Owner only when a decision cannot be safely inferred, then stop normal feature development after deploy readiness and switch to bug-fix mode.

## Scope

This design covers only prompt and role files. It does not add an LLM runtime, API calls, background workers, or an in-app multi-agent UI.

## Product Context

The app is an internal vehicle and meeting room booking system built with Next.js App Router, TypeScript, Supabase Auth, Supabase Postgres with Prisma, Supabase Storage, Tailwind CSS, React Big Calendar, Zod, React Hook Form, Vitest, and Playwright.

The agents must treat these files as the primary source of truth:

- `docs/requirements.md`
- `docs/roadmap-status.md`
- `README.md`
- The current source code under `src`, `prisma`, `supabase`, and `tests`

When documentation and code disagree, the Head agent investigates and makes the smallest conservative decision that keeps the product aligned with requirements. The Head escalates to the Owner only for business policy, security, destructive data/schema decisions, cost-bearing external services, or contradictions that cannot be resolved from the repo.

## Roles

The prompt team contains four roles:

- Head: requirements owner, project architect, workflow designer, coordinator, and final decision maker.
- Frontend: all UI, UX, App Router pages, forms, calendars, responsive behavior, and client-side interactions assigned by Head.
- Backend: all server actions, validation, Prisma, Supabase, auth, RBAC, storage, audit, notifications, reports, and data integrity assigned by Head.
- QA: test planning, requirement verification, regression testing, defect triage, and release readiness checks.

## Workflow

The team works in loops:

1. Head inspects roadmap, requirements, code, and test status.
2. Head selects the next highest-value gap and writes a work order.
3. Frontend and Backend implement assigned parts.
4. QA verifies acceptance criteria and reports defects.
5. Head decides whether to fix, split, defer, or mark complete.
6. The loop repeats until the product reaches the Definition of Done.

After product completion and normal deploy handoff, the agents stop feature work. Future loops run only for Owner-reported bugs, production issues, or explicit change requests.

## Definition Of Done

The product is complete when all roadmap phases required for the booking product are done or intentionally accepted by the Owner, core checks pass, high-priority QA defects are resolved, role permissions are verified, and deployment readiness is documented.

## Files

- `.agents/README.md`: entry point and team overview.
- `.agents/workflow.md`: loop protocol and work order format.
- `.agents/owner-escalation.md`: when to ask the Owner.
- `.agents/definition-of-done.md`: release and bug-fix mode criteria.
- `.agents/head.md`: Head role prompt.
- `.agents/frontend.md`: Frontend role prompt.
- `.agents/backend.md`: Backend role prompt.
- `.agents/qa.md`: QA role prompt.

## Verification

Because this is prompt-only work, verification is document-focused:

- Confirm every required role exists.
- Confirm the loop and escalation rules are explicit.
- Confirm no prompt asks agents to continue feature development after product completion.
- Confirm the files mention current project stack, requirements sources, and roadmap.
