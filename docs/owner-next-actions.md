# Owner Next Actions

Last updated: 2026-07-04

The app code is product-complete and automated verification passes. Supabase schema, RLS, and storage buckets have been applied to project `HBOOK`.

## Owner-Only Tasks

These require account access, secrets, or deployment authority.

1. Provide or configure production environment variables in the deployment platform:
   - `DATABASE_URL`
   - `APP_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `SUPABASE_STORAGE_BUCKET_VEHICLES`
   - `SUPABASE_STORAGE_BUCKET_DRIVERS`
   - `SUPABASE_STORAGE_BUCKET_ROOMS`
   - Non-secret HBOOK values are documented in `docs/deployment-env-values.md`.
2. Create the first admin in Supabase Auth.
3. Create the matching row in `public.profiles` with:
   - `id` equal to the Supabase Auth user id
   - `role` set to `ADMIN`
   - `is_active` set to `true`
   - `department_id` pointing to an existing department
4. Confirm the deployment target, such as Vercel project/team/domain.
5. Run UAT with real users or approved test users using `docs/qa-uat-checklist.md`.
6. Approve production release after UAT passes.

## Publish To GitHub

This machine currently does not have Git, GitHub CLI, Winget, or Chocolatey available. After installing Git for Windows and authenticating with GitHub, run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/publish-to-github.ps1
```

The script initializes the local repo, sets `origin` to `https://github.com/TLproject01/HBOOK.git`, uses branch `Webport`, commits the current product-complete workspace, and pushes to GitHub.

## Agent-Handled Tasks Already Done

- Verified GitHub connector access to `TLproject01/HBOOK`.
- Verified Supabase connector access to project `HBOOK`.
- Created Prisma migration artifacts in `prisma/migrations`.
- Applied base schema to Supabase.
- Applied RLS policies and storage buckets to Supabase.
- Fixed Supabase security advisor findings.
- Verified:
  - `corepack.cmd pnpm typecheck`
  - `corepack.cmd pnpm lint`
  - `corepack.cmd pnpm test`
  - `corepack.cmd pnpm build`

## Current Blockers For Agent

- Local `git` is not available in PATH, and the local `.git` directory is empty. The agent cannot push the full workspace to GitHub from this machine until Git is installed or available.
- Deployment cannot be completed by the agent until production secrets and the deployment target are configured or explicitly provided through the connected deployment platform.
