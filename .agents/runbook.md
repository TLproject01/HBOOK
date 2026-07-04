# Agent Runbook

This runbook explains how to start the prompt-only AI agent team and let the roles work together.

There is no automatic multi-agent runtime in this repo. The agents work through structured prompts, work orders, reports, and loop logs. One AI session can simulate all roles, or the Owner can open separate AI sessions for Head, Frontend, Backend, and QA and pass messages between them using the formats in `communication.md`.

## Recommended Mode

Use one active Head-led session.

Head reads all role files, then acts as coordinator. Head may temporarily switch into Frontend, Backend, or QA perspective when doing work, but every loop still follows the role boundaries.

This is the simplest and safest mode for this project because code changes happen in one workspace and Head can prevent conflicting edits.

## Optional Parallel Mode

Use separate sessions only when the work can be split cleanly:

- Head session: owns roadmap, decisions, and work orders.
- Frontend session: receives only frontend work orders from Head.
- Backend session: receives only backend work orders from Head.
- QA session: receives completed work summaries and verifies.

Parallel sessions must not edit the same files at the same time. Head resolves conflicts.

## How To Start

Start with the Head prompt.

Give the AI this instruction:

```text
You are the Head agent for this repo.
Read .agents/README.md, .agents/workflow.md, .agents/owner-escalation.md,
.agents/definition-of-done.md, .agents/communication.md, .agents/runbook.md,
.agents/head.md, README.md, docs/requirements.md, and docs/roadmap-status.md.

Start the product completion loop.
Inspect the repo, identify the next highest-value unfinished gap, create the first work order,
delegate to Frontend/Backend/QA as needed, implement if no Owner decision is required,
verify, fix, and repeat until Product Complete.

Ask the Owner only when .agents/owner-escalation.md requires it.
```

## First Loop

Head should begin by checking:

1. `docs/roadmap-status.md`
2. `docs/requirements.md`
3. Existing app routes under `src/app`
4. Server actions and services under `src/app/**/actions.ts` and `src/server`
5. Validation and domain helpers under `src/lib`
6. Tests under `tests`

Head then creates the first work order from the highest-priority missing item.

## Loop Execution

Each loop follows this order:

1. Head writes a work order.
2. Frontend and Backend do assigned implementation.
3. QA verifies the result.
4. Head classifies QA findings.
5. Frontend and Backend fix required issues.
6. QA retests.
7. Head marks the work order complete.
8. Head updates roadmap status if needed.
9. Head starts the next work order.

## When Agents Need To Talk

Use `communication.md`.

Important rule:

- Frontend, Backend, and QA talk to Head.
- Head talks to the Owner only when escalation rules require it.
- Frontend and Backend may coordinate through Head when contracts need to match.

## Owner Interruptions

If Head needs the Owner, Head stops implementation and asks one clear question using `owner-escalation.md`.

After the Owner answers, Head records the decision in the next work order and continues.

## Completion

When `definition-of-done.md` is satisfied, Head writes release handoff notes and declares Product Complete.

After that, the team enters bug-fix mode. Do not start new feature loops unless the Owner explicitly requests a change.
