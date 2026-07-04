# Agent Communication Protocol

This file defines how the AI agent roles communicate while finishing the app.

## Communication Model

Head is the hub.

```text
Owner <-> Head <-> Frontend
              <-> Backend
              <-> QA
```

Frontend, Backend, and QA do not ask the Owner directly. They ask Head. Head decides or escalates to the Owner.

## Message Types

Use these message types to keep the loop organized:

- Work Order: Head assigns work.
- Clarification Request: An agent asks Head for a decision.
- Implementation Report: Frontend or Backend reports completed work.
- QA Report: QA reports verification results.
- Defect Ticket: QA reports a bug.
- Head Decision: Head resolves a question, defect, or scope issue.
- Owner Question: Head asks the Owner only when escalation is required.

## Work Order

Head sends this to Frontend, Backend, and QA.

```markdown
## Work Order: <short title>

Goal:
<one concrete outcome>

Requirement sources:
- <docs, roadmap, source files>

Current gap:
- <what is missing or broken>

Assigned agents:
- Frontend: <task or "none">
- Backend: <task or "none">
- QA: <verification task>

Acceptance criteria:
- <observable behavior>
- <test or check expectation>

Files likely involved:
- <paths or areas>

Decision notes:
- <Head assumptions and decisions>

Owner escalation needed:
No
```

## Clarification Request

Frontend, Backend, or QA sends this to Head.

```markdown
## Clarification Request: <short topic>

From:
Frontend | Backend | QA

Work order:
<title>

Question:
<one specific question>

Why it matters:
<impact on behavior, data, tests, or release>

Recommended answer:
<agent recommendation>
```

## Implementation Report

Frontend or Backend sends this to Head.

```markdown
## Implementation Report: <work order title>

From:
Frontend | Backend

Completed:
- <change made>

Files changed:
- <path>

Contracts:
- <server action, validation shape, data field, route, or "none">

Checks run:
- <command or manual check>

Risks:
- <risk or "none">

Needs QA:
- <what QA should verify>
```

## QA Report

QA sends this to Head.

```markdown
## QA Report: <work order title>

Status:
Pass | Fail | Blocked

Checks run:
- <command or manual check>

Acceptance criteria result:
- Pass: <criterion>
- Fail: <criterion and reason>

Findings:
- <bug or risk>

Regression risk:
Low | Medium | High

Release impact:
None | Blocks release | Needs Head decision | Needs Owner decision
```

## Defect Ticket

QA sends this to Head when a bug needs fixing.

```markdown
## Defect: <short title>

Severity:
Critical | High | Medium | Low

Area:
Frontend | Backend | Data | Auth | Report | UX

Requirement source:
- <file or work order criterion>

Steps to reproduce:
1. <step>
2. <step>

Expected:
- <expected behavior>

Actual:
- <actual behavior>

Evidence:
- <test output, screenshot note, or code reference>

Recommended owner:
Frontend | Backend | Head

Release impact:
Blocks release | Does not block release
```

## Head Decision

Head sends this after resolving a question or QA finding.

```markdown
## Head Decision: <short topic>

Decision:
<what will happen>

Reason:
<why this is consistent with requirements and roadmap>

Assigned follow-up:
- Frontend: <task or "none">
- Backend: <task or "none">
- QA: <task or "none">

Owner escalation:
Not required
```

## Owner Question

Head sends this to the Owner only when required by `owner-escalation.md`.

```markdown
Owner decision needed: <short topic>

Context:
- <what the team found>

Recommended decision:
- <Head recommendation>

Question:
<one specific question>
```

## Shared Loop Log

If the agents need a persistent handoff record, Head may create or update a loop log:

`docs/agent-loop-log.md`

Suggested format:

```markdown
# Agent Loop Log

## Loop <number>: <work order title>

Status:
Planned | In Progress | QA | Fixing | Complete | Blocked

Head decision:
- <decision>

Frontend report:
- <summary>

Backend report:
- <summary>

QA report:
- <summary>

Next action:
- <next step>
```

The loop log is optional but useful when work spans multiple sessions.
