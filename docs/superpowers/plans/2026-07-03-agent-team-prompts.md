# Agent Team Prompts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build prompt-only AI agent role files in `.agents` for a Head, Frontend, Backend, and QA team that can loop until this booking system is product complete.

**Architecture:** The implementation is documentation-based. `.agents/README.md` is the entry point, shared workflow files define the operating protocol, and each role prompt defines authority, responsibilities, inputs, outputs, and handoff rules.

**Tech Stack:** Markdown prompt files, existing Next.js/TypeScript booking system context, existing docs in `README.md`, `docs/requirements.md`, and `docs/roadmap-status.md`.

---

### Task 1: Create Shared Agent Operating Documents

**Files:**
- Create: `.agents/README.md`
- Create: `.agents/workflow.md`
- Create: `.agents/owner-escalation.md`
- Create: `.agents/definition-of-done.md`

- [ ] **Step 1: Add the team entry point**

Create `.agents/README.md` with the team purpose, role list, operating mode, and required reading order.

- [ ] **Step 2: Add the loop workflow**

Create `.agents/workflow.md` with the inspect, plan, delegate, implement, QA, fix, repeat, and completion loop.

- [ ] **Step 3: Add Owner escalation rules**

Create `.agents/owner-escalation.md` with concrete rules for when the team must ask the Owner and when Head can decide.

- [ ] **Step 4: Add completion criteria**

Create `.agents/definition-of-done.md` with release readiness, test expectations, and post-completion bug-fix mode.

### Task 2: Create Role Prompts

**Files:**
- Create: `.agents/head.md`
- Create: `.agents/frontend.md`
- Create: `.agents/backend.md`
- Create: `.agents/qa.md`

- [ ] **Step 1: Add Head prompt**

Create `.agents/head.md` defining Head as requirements owner, project architect, coordinator, and final decision maker.

- [ ] **Step 2: Add Frontend prompt**

Create `.agents/frontend.md` defining ownership of UI, forms, calendars, responsiveness, accessibility, and client interaction quality.

- [ ] **Step 3: Add Backend prompt**

Create `.agents/backend.md` defining ownership of server actions, validation, Prisma, Supabase, auth, RBAC, storage, audit, notifications, and reports.

- [ ] **Step 4: Add QA prompt**

Create `.agents/qa.md` defining requirement verification, test planning, regression checks, and release risk reporting.

### Task 3: Verify Prompt Set

**Files:**
- Inspect: `.agents/*.md`
- Inspect: `docs/superpowers/specs/2026-07-03-agent-team-design.md`

- [ ] **Step 1: Confirm all files exist**

Run: `rg --files .agents docs/superpowers`

Expected: The output lists all shared documents, all four role prompts, this plan, and the design spec.

- [ ] **Step 2: Scan for unfinished placeholders**

Run: `rg -n "TB[D]|TO[D]O|implement[ ]later|fill[ ]in[ ]details" .agents docs/superpowers`

Expected: No matches.

- [ ] **Step 3: Read the generated files**

Run: `Get-Content -Path '.agents\README.md'` and spot-check each role file.

Expected: The prompts describe a prompt-only team, not an in-app LLM runtime.
