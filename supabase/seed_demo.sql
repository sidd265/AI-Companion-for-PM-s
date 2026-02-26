-- =============================================================================
-- Demo Account Seed
-- Run this once in the Supabase SQL Editor to create the guest demo account.
--
-- Demo credentials:
--   Email:    guest@ampm.demo
--   Password: ampm@123
--
-- Creates: demo auth user, profile, 6 team members, 5 projects, 15 tickets,
--          2 integrations (demo mode), 3 pre-seeded chat conversations.
-- =============================================================================

-- Required for bcrypt password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  -- Fixed demo user UUID — used in all FK references
  demo_user_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  -- Project UUIDs
  proj_payment  UUID := 'b1111111-0000-0000-0000-000000000001';
  proj_auth     UUID := 'b1111111-0000-0000-0000-000000000002';
  proj_frontend UUID := 'b1111111-0000-0000-0000-000000000003';
  proj_backend  UUID := 'b1111111-0000-0000-0000-000000000004';
  proj_notify   UUID := 'b1111111-0000-0000-0000-000000000005';

  -- Team member UUIDs
  tm_sarah   UUID := 'c1111111-0000-0000-0000-000000000001';
  tm_michael UUID := 'c1111111-0000-0000-0000-000000000002';
  tm_emily   UUID := 'c1111111-0000-0000-0000-000000000003';
  tm_david   UUID := 'c1111111-0000-0000-0000-000000000004';
  tm_lisa    UUID := 'c1111111-0000-0000-0000-000000000005';
  tm_james   UUID := 'c1111111-0000-0000-0000-000000000006';

  -- Conversation UUIDs
  conv1 UUID := 'd1111111-0000-0000-0000-000000000001';
  conv2 UUID := 'd1111111-0000-0000-0000-000000000002';
  conv3 UUID := 'd1111111-0000-0000-0000-000000000003';

BEGIN

  -- ─── 1. Demo auth user ────────────────────────────────────────────────────
  INSERT INTO auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    demo_user_id,
    'authenticated',
    'authenticated',
    'guest@ampm.demo',
    crypt('ampm@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Demo Guest"}',
    now(),
    now(),
    '', '', '', ''
  ) ON CONFLICT (id) DO UPDATE
    SET encrypted_password = crypt('ampm@123', gen_salt('bf')),
        email_confirmed_at = now(),
        updated_at = now();

  -- ─── 2. Auth identity (email provider) ───────────────────────────────────
  -- Note: auth.identities schema varies by Supabase version.
  -- If this fails, create the user via Supabase Dashboard → Auth → Add user.
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    demo_user_id,
    demo_user_id,
    jsonb_build_object(
      'sub',   demo_user_id::text,
      'email', 'guest@ampm.demo'
    ),
    'email',
    now(),
    now(),
    now()
  ) ON CONFLICT DO NOTHING;

  -- ─── 3. Profile ───────────────────────────────────────────────────────────
  INSERT INTO public.profiles (id, name, email, role, avatar_color)
  VALUES (demo_user_id, 'Demo Guest', 'guest@ampm.demo', 'Product Manager', '#FF5A5F')
  ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        role = EXCLUDED.role,
        updated_at = now();

  -- ─── 4. Team members ──────────────────────────────────────────────────────
  INSERT INTO public.team_members
    (id, name, role, email, github, slack, expertise, avatar_color, velocity, capacity, active_tasks)
  VALUES
    (tm_sarah,   'Sarah Chen',      'Senior Backend Engineer', 'sarah@acme.com',
     '@sarachen',  '@sarah',
     ARRAY['Python','AWS','Docker','PostgreSQL','Redis','Node.js'],
     '#E255A1', 23, 75, 5),

    (tm_michael, 'Michael Torres',  'Frontend Lead',           'michael@acme.com',
     '@mtorres',   '@michael',
     ARRAY['React','TypeScript','CSS','Tailwind','Next.js'],
     '#2383E2', 31, 60, 8),

    (tm_emily,   'Emily Rodriguez', 'Full Stack Developer',    'emily@acme.com',
     '@emilyr',    '@emily',
     ARRAY['JavaScript','Node.js','React','MongoDB','GraphQL'],
     '#0F7B6C', 19, 85, 3),

    (tm_david,   'David Kim',       'DevOps Engineer',         'david@acme.com',
     '@davidkim',  '@david',
     ARRAY['Kubernetes','Terraform','AWS','CI/CD','Linux'],
     '#D9730D', 15, 45, 4),

    (tm_lisa,    'Lisa Wang',       'QA Engineer',             'lisa@acme.com',
     '@lisawang',  '@lisa',
     ARRAY['Selenium','Jest','Cypress','Python','Test Automation'],
     '#9065B0',  8, 55, 2),

    (tm_james,   'James Park',      'Backend Developer',       'james@acme.com',
     '@jamespark', '@james',
     ARRAY['Go','gRPC','Microservices','Redis','Kafka'],
     '#DFAB01', 27, 70, 6)
  ON CONFLICT (id) DO NOTHING;

  -- ─── 5. Projects ──────────────────────────────────────────────────────────
  INSERT INTO public.projects (id, name, key, owner_id) VALUES
    (proj_payment,  'Payment Gateway',     'PAY',   demo_user_id),
    (proj_auth,     'User Auth',           'AUTH',  demo_user_id),
    (proj_frontend, 'Web Frontend',        'WEB',   demo_user_id),
    (proj_backend,  'Backend Services',    'BACK',  demo_user_id),
    (proj_notify,   'Notification Service','NOTIF', demo_user_id)
  ON CONFLICT (id) DO NOTHING;

  -- ─── 6. Tickets ───────────────────────────────────────────────────────────
  INSERT INTO public.tickets
    (title, description, status, priority, type, project_id, assignee_id, jira_key, story_points)
  VALUES
    -- Payment Gateway
    ('Payment API refactor for v2 endpoints',
     'Refactor all v1 payment API endpoints to the new v2 format with improved error codes, rate limiting headers, and pagination. Includes Stripe integration layer updates.',
     'In Progress', 'High', 'Story', proj_payment, tm_sarah, 'PAY-1234', 8),

    ('Add payment refund feature',
     'Full and partial refund flow for card and wallet payments. PR #142 in payment-service is open and nearly ready to merge.',
     'In Review', 'High', 'Story', proj_payment, tm_sarah, 'PAY-1235', 5),

    ('Fix double-charge bug on mobile checkout',
     'iOS users report duplicate charges when network drops mid-checkout. Root cause suspected in the mobile SDK retry handler.',
     'In Progress', 'Critical', 'Bug', proj_payment, tm_emily, 'PAY-1236', 3),

    ('Payment webhook retry mechanism',
     'Implement exponential backoff for failed webhook deliveries to merchant endpoints. Should retry up to 5 times over 24 hours.',
     'To Do', 'Medium', 'Task', proj_payment, NULL, 'PAY-1237', 3),

    -- User Auth
    ('Fix user session timeout bug',
     'Users are being logged out after 15 minutes instead of the configured 24 hours. Issue is in the token refresh logic. PR #89 in user-auth addresses this.',
     'In Review', 'Critical', 'Bug', proj_auth, tm_emily, 'AUTH-1235', 2),

    ('Implement OAuth2 PKCE for mobile apps',
     'Mobile apps need PKCE extension for OAuth2. Currently only implicit flow is supported which is deprecated by RFC 9700.',
     'To Do', 'High', 'Story', proj_auth, NULL, 'AUTH-1238', 5),

    ('Add TOTP multi-factor authentication',
     'TOTP-based MFA compatible with Google Authenticator and Authy. Should be optional with graceful fallback to email OTP.',
     'To Do', 'Medium', 'Story', proj_auth, tm_lisa, 'AUTH-1239', 8),

    -- Web Frontend
    ('Add dark mode support',
     'System-aware dark mode using CSS custom properties and Tailwind dark: classes. Respect OS preference with manual toggle. Design specs are in Figma (link in ticket).',
     'To Do', 'Medium', 'Story', proj_frontend, NULL, 'WEB-1236', 5),

    ('Migrate dashboard charts to Recharts',
     'Move from Chart.js to Recharts for better React 18 compatibility. PR #203 is open, needs review from frontend team.',
     'In Progress', 'Medium', 'Task', proj_frontend, tm_michael, 'WEB-1240', 3),

    ('Fix responsive nav at tablet breakpoints',
     'Main navigation collapses incorrectly on screens between 768px–900px. Hamburger menu not rendering correctly on iPad.',
     'To Do', 'Low', 'Bug', proj_frontend, NULL, 'WEB-1241', 2),

    -- Backend Services
    ('Database optimization for search queries',
     'Full-text search on tickets is taking 3–5 seconds on prod. Plan: add GIN indexes on title/description, evaluate pg_trgm. BLOCKED pending DBA review sign-off.',
     'Blocked', 'High', 'Task', proj_backend, tm_james, 'BACK-1237', 5),

    ('API gateway rate limiting',
     'Per-client rate limiting using Redis token bucket at the gateway level. PR #34 in api-gateway is ready for final review.',
     'In Review', 'High', 'Task', proj_backend, tm_james, 'BACK-1242', 3),

    ('Distributed tracing with OpenTelemetry',
     'Instrument all microservices with OpenTelemetry SDK. Send traces to Jaeger. Start with payment-service and user-auth as highest priority.',
     'To Do', 'Medium', 'Task', proj_backend, tm_david, 'BACK-1243', 5),

    -- Notification Service
    ('Implement notification preferences',
     'Granular per-user control over notification channels (email, push, in-app) and frequency (immediate, digest, weekly). UI mockups in Figma.',
     'In Progress', 'Medium', 'Story', proj_notify, tm_emily, 'NOTIF-1238', 5),

    ('Add iOS push notifications via APNs',
     'Integrate Apple Push Notification service for iOS. Android FCM integration is complete. Need APNs auth key from iOS team.',
     'To Do', 'Medium', 'Task', proj_notify, NULL, 'NOTIF-1244', 3)
  ON CONFLICT DO NOTHING;

  -- ─── 7. Integrations (demo mode — no real tokens) ─────────────────────────
  -- The edge function detects access_token = 'DEMO_MODE' and returns
  -- rich pre-built context instead of making real API calls.
  INSERT INTO public.integrations (user_id, type, status, access_token, metadata)
  VALUES
    (demo_user_id, 'github', 'connected', 'DEMO_MODE',
     '{"username":"demo-acme","org":"acme-corp","demo":true}'::jsonb),

    (demo_user_id, 'jira',   'connected', 'DEMO_MODE',
     '{"site":"acme.atlassian.net","base_url":"https://acme.atlassian.net","email":"demo@acme.com","demo":true}'::jsonb)
  ON CONFLICT (user_id, type) DO UPDATE
    SET status       = EXCLUDED.status,
        access_token = EXCLUDED.access_token,
        metadata     = EXCLUDED.metadata,
        updated_at   = now();

  -- ─── 8. Pre-seeded conversations ──────────────────────────────────────────
  INSERT INTO public.conversations (id, user_id, title, updated_at)
  VALUES
    (conv1, demo_user_id, 'Repository Overview',  now() - INTERVAL '2 hours'),
    (conv2, demo_user_id, 'Sprint Status',         now() - INTERVAL '1 hour'),
    (conv3, demo_user_id, 'Who should own WEB-1236?', now() - INTERVAL '20 minutes')
  ON CONFLICT (id) DO NOTHING;

  -- ─── 9. Pre-seeded messages ───────────────────────────────────────────────
  INSERT INTO public.messages (conversation_id, role, content, created_at)
  VALUES

  -- ── Conversation 1: Repository Overview ───────────────────────────────────
  (conv1, 'user',
   'Give me an overview of all our repos and what each one does',
   now() - INTERVAL '2 hours'),

  (conv1, 'assistant',
$$## Repository Overview

Here's a full inventory of all **5 active repositories** in the `acme-corp` organization:

| Repository | Language | Stars | Open Issues | Last Updated |
|---|---|---|---|---|
| **payment-service** | TypeScript | 234 | 3 | Today |
| **user-auth** | Python/SQL | 156 | 2 | Today |
| **web-frontend** | TypeScript | 89 | 5 | Today |
| **api-gateway** | Go | 67 | 1 | 3 days ago |
| **notification-service** | Node.js | 45 | 0 | 1 week ago |

---

### payment-service
Handles all payment processing via **Stripe**. Currently the most active repo — 3 open PRs including the big **refund feature (PR #142)** from @sarachen. Linked to sprint tickets PAY-1234 and PAY-1235.

### user-auth
Python microservice for authentication and authorization. **Critical PR #89** is open fixing a session timeout regression (AUTH-1235). Needs @sarachen to approve.

### web-frontend
Main React/TypeScript app. **PR #203** (dashboard charts migration) has been open 2 days and needs review from @emilyr and @lisawang. Dark mode (WEB-1236) is still unassigned.

### api-gateway
Central Go gateway. **PR #34** adds Redis-backed rate limiting — nearly ready to merge. Once merged, it unblocks BACK-1237.

### notification-service
Email, SMS, and push notifications in Node.js. **No open PRs** — stable and good opportunity to tackle NOTIF-1244 (iOS push notifications).

---

### Immediate Action Items
1. 🔴 **PR #89** (`user-auth`) — Critical session bug, needs reviewer approval today
2. 🟡 **PR #203** (`web-frontend`) — 2 days old, assign a reviewer
3. 🟢 **WEB-1236** (dark mode) — 5 pts, unassigned, good fit for Michael Torres$$,
   now() - INTERVAL '2 hours' + INTERVAL '8 seconds'),


  -- ── Conversation 2: Sprint Status ─────────────────────────────────────────
  (conv2, 'user',
   'What''s the current sprint status? Any blockers I should know about?',
   now() - INTERVAL '1 hour'),

  (conv2, 'assistant',
$$## Current Sprint Status

**Overall: 40% complete** (6 of 15 tickets done this cycle)

### Status Breakdown

| Status | Count | Notable Tickets |
|---|---|---|
| ✅ Done | 6 | — |
| 🔵 In Progress | 5 | PAY-1234, PAY-1236, WEB-1240, NOTIF-1238, BACK-1242 |
| 🟡 In Review | 2 | AUTH-1235 ⚠️, PAY-1235 |
| ⚪ To Do | 1 | AUTH-1238 |
| 🔴 **Blocked** | **1** | **BACK-1237** |

---

### 🔴 Active Blocker: BACK-1237
**Database optimization for search queries** — assigned to @jamespark

> *Blocked waiting for DBA review sign-off before adding GIN indexes on prod.*

This is impacting the 3–5 second search latency users are experiencing. Recommend:
- Escalate DBA review to this week
- Or ship a Redis-cache interim fix to buy time

---

### ⚠️ At Risk

**AUTH-1235** (Critical) — Session timeout bug. PR #89 has been "In Review" since yesterday. @sarachen needs to approve — this is a production issue affecting all users.

**PAY-1236** (Critical) — Double-charge bug on iOS. @emilyr is investigating but no PR yet. May need to involve @sarachen for the Stripe retry handler.

---

### Team Capacity Snapshot

| Engineer | Commits (14d) | Active Tasks | Capacity |
|---|---|---|---|
| Sarah Chen | 23 | 5 | 75% |
| Michael Torres | 31 | 8 | 60% |
| Emily Rodriguez | 19 | 3 | **85%** ← watch |
| James Park | 27 | 6 | 70% |
| Lisa Wang | 8 | 2 | 55% — available |
| David Kim | 15 | 4 | 45% — available |$$,
   now() - INTERVAL '1 hour' + INTERVAL '9 seconds'),


  -- ── Conversation 3: Dark Mode Assignment ──────────────────────────────────
  (conv3, 'user',
   'WEB-1236 (dark mode) has been sitting unassigned for a week. Who''s the best fit?',
   now() - INTERVAL '20 minutes'),

  (conv3, 'assistant',
$$## Assignment Recommendation: WEB-1236 — Dark Mode

### 🏆 Best Fit: Michael Torres (Frontend Lead)

**Expertise match: 95%**
- ✅ TypeScript — primary language for `web-frontend`
- ✅ React — full component-level dark mode changes needed
- ✅ CSS / Tailwind — dark: variant classes + CSS custom properties
- ✅ Already working on WEB-1240 (dashboard charts) — knows the codebase

**Capacity: 60% load, 8 active tasks** — room for a 5-point story this sprint

---

### Alternative: Emily Rodriguez (Full Stack)

Emily has React/JS skills and could handle it, but:
- Currently at **85% capacity** — adding more risks overload
- Less Tailwind experience than Michael
- Would need ramp-up time vs. Michael who knows `web-frontend`

---

### Why Not Assign to Lisa Wang?

Lisa (QA, 55% capacity) is available but this is a frontend implementation ticket. Better to tag her for **QA/review** once Michael has a branch ready.

---

### Suggested Breakdown (to avoid a huge PR)

| Sub-task | Est. | Notes |
|---|---|---|
| CSS variables + Tailwind config | 1 pt | System dark: token setup |
| Layout components (nav, sidebar) | 1 pt | Highest visibility |
| Data components (cards, tables, charts) | 2 pts | Bulk of the work |
| OS preference detect + toggle | 1 pt | LocalStorage persist |

> **Recommended:** Assign WEB-1236 to **@mtorres**, tag **@lisawang** as QA reviewer, target next sprint if current sprint is full.$$,
   now() - INTERVAL '20 minutes' + INTERVAL '7 seconds')

  ON CONFLICT DO NOTHING;

END $$;
