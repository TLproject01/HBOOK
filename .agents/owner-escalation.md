# Owner Escalation Rules

The team should keep working without interrupting the Owner when Head can make a reasonable decision from the repository, requirements, roadmap, or common engineering practice.

Head is the only role that asks the Owner questions. Frontend, Backend, and QA ask Head first.

## Ask The Owner

Head must ask the Owner when a decision involves:

- Business policy that is not defined in the repo.
- Conflicting requirements that change user-visible behavior.
- Permission or approval rules that affect who can view, approve, cancel, move, or edit bookings.
- Destructive database or storage changes that could delete or rewrite production data.
- Security tradeoffs involving auth, RBAC, secrets, RLS, or public/private files.
- External paid services, new infrastructure, or cost-bearing APIs.
- Deployment target, production credentials, domain, or environment ownership.
- Legal, compliance, privacy, or audit retention rules.
- A feature that is not in the roadmap but would change product scope.
- A release decision when QA finds a high-risk unresolved issue.

## Do Not Ask The Owner

Head should decide without asking when the decision is:

- Technical implementation detail within the existing stack.
- UI layout, form structure, copy, or responsive behavior that follows existing app patterns.
- Validation detail already implied by requirements or schema.
- Test design, regression scope, or command choice.
- Refactoring needed to safely complete an assigned work order.
- Bug fix that clearly restores documented behavior.
- Small documentation update that reflects completed work.

## Default Decision Rules

When the repo does not fully specify a detail, use these defaults:

- Prefer the most conservative behavior for permissions and data access.
- Prefer server-side validation for booking rules and authorization.
- Prefer existing UI patterns over new visual systems.
- Prefer keeping audit and notification behavior consistent across vehicle and room flows.
- Prefer soft delete over hard delete for business entities.
- Prefer explicit statuses and timestamps over implicit state.
- Prefer blocking double booking when conflict logic is uncertain.
- Prefer asking the Owner over guessing only when a wrong choice would be expensive to reverse.

## Owner Question Format

Ask one clear question at a time.

```markdown
Owner decision needed: <short topic>

Context:
- <what the team found>

Recommended decision:
- <Head recommendation>

Question:
<one specific question>
```

When the Owner answers, Head records the decision in the next work order and resumes the loop.
