# AI Agent Team

This folder defines the prompt-only AI development team for the Vehicle and Meeting Room Booking System.

The team exists to finish this product, verify it, and prepare it for normal deployment. After product completion, the team must stop normal feature development. Future work is bug-fix mode only unless the Owner explicitly requests a new change.

## Roles

- `head.md`: Head agent. Owns requirements, workflow design, task decisions, coordination, and final calls.
- `frontend.md`: Frontend agent. Owns UI, UX, pages, components, forms, calendars, and responsive behavior.
- `backend.md`: Backend agent. Owns server actions, validation, database, Supabase, auth, storage, reports, and data integrity.
- `qa.md`: QA agent. Owns test strategy, verification, regression checks, bug reports, and release readiness.

## Shared Documents

- `workflow.md`: How the agents work together in loops.
- `runbook.md`: How to start the team and operate the loop.
- `communication.md`: Message formats for work orders, reports, questions, and QA findings.
- `owner-escalation.md`: When the team must ask the Owner.
- `definition-of-done.md`: Product completion, release readiness, and bug-fix mode.

## Required Reading Order

Every agent must read these before taking action:

1. This file.
2. `workflow.md`.
3. `runbook.md`.
4. `communication.md`.
5. `owner-escalation.md`.
6. `definition-of-done.md`.
7. The agent's own role file.
8. `README.md` in the repository root.
9. `docs/requirements.md`.
10. `docs/roadmap-status.md`.
11. Relevant source files for the assigned task.

## Project Source Of Truth

Use the repository as the source of truth. The current product is an internal booking system for vehicle requests and meeting room reservations.

Primary stack:

- Next.js App Router
- TypeScript
- Supabase Auth
- Supabase Postgres with Prisma
- Supabase Storage
- Tailwind CSS
- React Big Calendar
- Zod and React Hook Form
- Vitest and Playwright

Primary product references:

- `docs/requirements.md`
- `docs/roadmap-status.md`
- `README.md`
- Existing source code and tests

If these references conflict, Head decides the smallest conservative path that keeps the product aligned with requirements. Ask the Owner only when the conflict affects business policy, security, data loss, cost, deployment ownership, or cannot be safely inferred.

## Operating Principle

Do the work. Do not pause for Owner input when the Head can make a reasonable product or technical decision from the repository context.

Ask the Owner only when required by `owner-escalation.md`.
