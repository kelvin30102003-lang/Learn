# letstudyJLPT — project handoff

`letstudyJLPT` is a Next.js JLPT practice app. It has a learner dashboard, Supabase-backed question/exam model, partially implemented mock exams, and a light admin overview. This document is a continuation guide for the next AI or developer.

## Stack

- Next.js 16.3.4 App Router, React 19, TypeScript strict mode
- Tailwind CSS v4 and `src/app/globals.css`
- Supabase PostgreSQL/Auth/SSR helpers
- Custom bcrypt email/password authentication with an HTTP-only signed cookie

## Local setup

Requirements: Node 20+, a Supabase project, and the final database schema applied.

Create `.env.local` (never commit it):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
CUSTOM_AUTH_SECRET=USE_A_LONG_RANDOM_SECRET
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never prefix it with `NEXT_PUBLIC_`, import it into client code, commit it, or include it in logs.

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

Open `http://localhost:3000`. On Windows, `npm.cmd` bypasses PowerShell environments that block `npm.ps1`.

The build currently fetches Geist from Google through `next/font/google` in `src/app/layout.tsx`. Offline/proxied builds fail until a local font is used or outbound font access is available.

## Project map

| Area | Files | Purpose |
| --- | --- | --- |
| Public UI | `src/app/page.tsx`, `about`, `contact`, `premium`, `payment` | Marketing and payment-request UI. |
| Custom auth | `src/lib/custom-auth.ts`, `src/app/api/auth/*` | `public.users`, bcrypt hashes, `kotoba_session` cookie. |
| Supabase Auth | `utils/supabase/*`, `src/proxy.ts`, `src/app/auth/callback/route.ts` | SSR/browser auth clients and Google OAuth callback. |
| Learner portal | `src/app/dashboard/*`, `src/components/DashboardSidebar.tsx` | Protected learner experience and target-level preference. |
| Simulator | `src/app/simulation/[testId]/page.tsx`, `src/components/SimulationClient.tsx` | Database question read plus client-side test UI. |
| Mock exams | `src/app/mock-exam/*`, `src/lib/yearly-exams.ts` | Yearly exam browsing; custom mock workflow scaffold. |
| Admin | `src/app/admin/*`, `src/components/AdminShell.tsx` | Admin-only light UI and live overview metrics. |
| Imports | `scripts/import-questions.mjs`, `src/lib/question-import.ts` | Validated service-role import of tests, questions, choices. |
| Database | `supabase/schema.sql`, `supabase/migrations`, `supabase/seed.sql` | Historical schema/migrations/demo content. |

Files outside `src/app` such as `src/dashboard`, `src/login`, `src/register`, `src/result`, `src/settings`, `src/simulation`, and `src/permium` are legacy artifacts, not App Router routes. Do not extend them without deliberately migrating/removing them.

## Auth and authorization — critical

### Current email/password path

```text
/register → POST /api/auth/register → public.users → kotoba_session → /dashboard
/login    → POST /api/auth/login    → public.users → kotoba_session → /dashboard
```

`getCustomUser()` validates `kotoba_session` with `CUSTOM_AUTH_SECRET`, then reads `public.users` via a server-only service-role client. `/dashboard` requires a user; `/admin` additionally requires `users.role = 'admin'`.

Promote a known custom account:

```sql
update public.users set role = 'admin' where email = 'admin@example.com';
```

Log out/in again, then visit `/admin`.

### Incomplete second auth system

Google OAuth (`GoogleSignInButton`, `utils/supabase/*`, callback route) uses `auth.users` and `public.profiles`. It does **not** create a matching custom `public.users` row, so it does not work with `getCustomUser()` or current dashboard/admin protection.

Before substantial feature work, choose one system:

1. Recommended: migrate to Supabase Auth + one `profiles` table, then replace custom auth.
2. Or keep custom auth, remove/hide OAuth and all profile-based authorization.

Do not build new functionality on both systems. Admin access currently reads `public.users.role`, not `profiles.role`.

## Learner workflow and status

```text
Register/log in → /dashboard → choose JLPT level → tests/mock exams
→ /simulation/[testId] → result → review
```

Working:

- Custom registration/login
- Learner dashboard: database tests/attempts/question counts/score aggregates
- JLPT level update with `src/app/dashboard/actions.ts`
- Database question loading in `/simulation/[testId]` when a database test ID is supplied
- Published yearly-exam list/preview from `yearly_exams` and `yearly_exam_questions`

Incomplete/static:

- `SimulationClient` does not create attempts, persist answers, validate answers, submit scores, or use each test’s duration; it uses a fixed 20-minute timer.
- `/results/[attemptId]` is a static 70% page; `/review/[attemptId]` uses mock questions.
- `/tests` reads `src/data/mock.ts`, not the database.
- Profile, contact, payment submission, and premium pages are UI-only.
- Custom exam generation and launch of a yearly exam are disabled placeholders.

## Admin workflow and status

```text
Custom user with role=admin → /admin → overview → users/questions/tests/payments
```

`/admin` is dynamic: it reads `users`, `questions`, `tests`, `attempts`, and `payments`, then displays totals, a 12-month attempts/completions chart, premium conversion, and recent events. Admin layout/navigation is `AdminShell.tsx`; styles are `.admin-*` rules in `globals.css`.

| Route | Current state | Next work |
| --- | --- | --- |
| `/admin/users` | Sample rows | DB fetch, filtering, pagination, details, status/premium actions. |
| `/admin/questions` | `src/data/mock.ts` | DB query and question/choice CRUD, publish state, assets. |
| `/admin/tests` | `src/data/mock.ts` | DB query and exam CRUD, question selection/order, publish/archive. |
| `/admin/payments` | Client-only sample state | Persist requests; approve/reject server-side; premium update transaction. |
| Analytics/logs/announcements/settings | Navigation only | Add data models, protected server actions, audit log. |

## Data model expected by code

```text
users
  ├─ tests → questions → choices
  ├─ attempts → user_answers
  ├─ payments
  ├─ yearly_exams → yearly_exam_questions → questions
  ├─ exam_templates → exam_template_parts
  └─ generated_exams → generated_exam_questions → questions
```

Important fields:

- `users`: `id`, `full_name`, `email`, `password_hash`, `role`, `is_premium`, `target_level`, `created_at`
- `tests`: title, description, level, duration, premium/active flags, source/yearly references
- `questions`: test linkage, section, text/type, points, choices, level/source year/section type/active flag, optional audio/image URLs
- `attempts` and `user_answers`: intended source of results and analytics

### Database consistency warning

SQL files reflect two historical designs and cannot safely be executed blindly on a fresh project:

- `schema.sql` creates `profiles` connected to `auth.users`.
- migration `002_custom_users.sql` adds current custom-auth `public.users`.
- migration `003_mock_exam_architecture.sql` uses `public.users` for generated exams but defines `is_admin()` using `profiles`.
- migration `004_seed_n5_mock_exam.sql` inserts `questions.category` and `questions.correct_answer`, columns not created by the checked-in base schema/migration 003.

First task for the next contributor: create a tested, idempotent consolidated baseline migration. Decide auth, make `is_admin()` use the same identity source as `/admin`, reconcile every question column, apply to a clean project, then seed and test the workflows.

## Import question content

Use `data/imports/n5-mondai.template.json` as the shape reference. Validation requires a test title/duration, non-empty unique positive question numbers, supported sections (Vocabulary/Grammar/Reading/Listening), >=2 choices, and exactly one correct choice.

```powershell
npm.cmd run import:questions -- data/imports/my-test.json
```

It creates a new test, questions, and choices. It does not deduplicate, upload assets, attach yearly exams, or check legal rights. Import only original or licensed content.

## Design and coding rules

- Keep database/service-role access in server components, server actions, or route handlers only.
- Use `@/` imports for `src/*`.
- Public site uses root CSS variables; admin has isolated `.admin-*` light-theme CSS. Avoid global admin overrides.
- Add validation and authorization inside every mutation; hiding a button is not authorization.
- Follow current Next 16 App Router conventions. Dynamic `params` and `searchParams` are Promises.

## Recommended next implementation order

1. Consolidate auth and database migrations.
2. Build real exam attempts: start, save answers, test duration, submit, server-side score calculation, result and review pages.
3. Replace all `src/data/mock.ts` reads with database queries.
4. Build protected admin CRUD and revalidation.
5. Add payment storage/submission, approval transaction, plans/expiry model.
6. Implement yearly/custom exam launch and question selection.
7. Add audit logs, error states, database integration tests, and end-to-end learner/admin coverage.

## Handoff verification

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

Manual checks:

1. Register and log in with custom auth.
2. Change target level on `/dashboard`.
3. Promote the same account in `public.users`, relogin, and open `/admin`.
4. Check admin metrics against Supabase records.
5. Import original content and confirm `/simulation/<database-test-id>` loads it.
6. Confirm service-role keys never reach browser code or Git.

## Cleanup backlog

- `env.local` is not a Next.js standard env filename; `.env.local` is. Remove/rename if unused.
- Resolve the `src/permium` typo only after checking any external references.
- Remove legacy duplicate files outside `src/app` after verification.
- Replace hard-coded admin identity in `AdminShell` with the authenticated admin name.
- Add a proper test suite; no tests are configured today.
