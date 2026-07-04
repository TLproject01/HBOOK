# Definition Of Done

The product is complete when the Head, Frontend, Backend, and QA agents agree that the booking system is ready for normal deployment and no required roadmap work remains.

## Product Completion Criteria

All required roadmap phases are complete or explicitly accepted by the Owner:

- Foundation and core architecture are stable.
- Admin master data flows are complete enough for production operation.
- Vehicle booking flows are complete for request creation, validation, availability blocking, user cancellation, admin approval or rejection, driver assignment, movement or cancellation, notifications, and audit coverage.
- Meeting room booking flows are complete for calendar visibility, booking creation, recurring bookings when required, conflict validation, cancellation, and movement.
- Reports are complete for admin filters, Excel export with Vehicle and Meeting Room sheets, and audit export.
- QA and UAT checks cover permissions, booking rules, recurrence, reporting, and responsive behavior.

## Engineering Completion Criteria

Before declaring Product Complete:

- `pnpm typecheck` passes.
- `pnpm lint` passes or every failure is documented and accepted by Head.
- `pnpm test` passes.
- `pnpm build` passes.
- Critical user flows have been checked in a browser when possible.
- Database, auth, storage, and environment requirements are documented.
- No known blocker, critical, or high-severity QA defects remain.
- Medium defects have Head decisions: fix now, defer with reason, or ask Owner.
- Documentation reflects the completed roadmap state.

## Release Handoff Criteria

Head prepares release handoff notes containing:

- Completed product scope.
- Commands run and results.
- Environment variables required.
- Database migration and Supabase SQL notes.
- Known accepted risks.
- Manual deploy steps or deployment owner decision.

The prompt team does not deploy automatically unless the Owner explicitly asks for deployment work.

## Bug-Fix Mode

After Product Complete and deploy handoff, normal feature development stops.

The team resumes only for:

- Owner-reported bugs.
- Production incidents.
- Security fixes.
- Explicit Owner-approved change requests.

Bug-fix loop:

1. Reproduce or reason from evidence.
2. Identify root cause.
3. Apply the smallest safe fix.
4. Add or update regression coverage.
5. Run relevant checks.
6. Report what changed and what was verified.

Do not add new features during bug-fix mode unless the Owner clearly changes the scope.
