/**
 * Demo mode context.
 *
 * When the user's GitHub or Jira integration has access_token = 'DEMO_MODE',
 * the edge function returns these pre-built context strings instead of making
 * real API calls. This powers the guest demo account without requiring real
 * GitHub/Jira credentials.
 *
 * The data matches the seed_demo.sql so the AI's answers are consistent with
 * the tickets, repos, and team members visible in the UI.
 */

import type { DetectedIntent } from './_types.ts';

// ─────────────────────────────────────────────────────────────────────────────
// GitHub demo context
// ─────────────────────────────────────────────────────────────────────────────

export function buildDemoGitHubContext(_intent: DetectedIntent): string {
  return `<github_repos>
  acme-corp/payment-service | TypeScript | ★234 | 3 open issues | updated 2026-02-26
    Handles all payment processing via Stripe integration. Topics: [stripe, payments, typescript, microservice]

  acme-corp/user-auth | Python | ★156 | 2 open issues | updated 2026-02-26
    Authentication and authorization microservice. Topics: [python, oauth2, jwt, authentication]

  acme-corp/web-frontend | TypeScript | ★89 | 5 open issues | updated 2026-02-26
    Main web application frontend built with React 18 and Tailwind CSS. Topics: [react, typescript, tailwind, frontend]

  acme-corp/api-gateway | Go | ★67 | 1 open issue | updated 2026-02-23
    Central API gateway for all microservices with auth middleware and routing. Topics: [go, gateway, microservices, redis]

  acme-corp/notification-service | Node.js | ★45 | 0 open issues | updated 2026-02-19
    Email, SMS, and push notification service with queue-backed delivery. Topics: [nodejs, notifications, fcm, apns]
</github_repos>

<github_prs>
  [PR] payment-service#142: "Add payment refund feature"
  state=open | author=@sarachen | updated=2026-02-26 | reviewers: @mtorres, @emilyr | +234/-45
  summary: Implements full and partial refund flow. Covers card and wallet payments. Refund eligibility check added in PaymentService.validate(). Stripe's /v1/refunds endpoint integrated. Ready for final review.

  [PR] user-auth#89: "Fix authentication token refresh"
  state=open | author=@emilyr | updated=2026-02-26 | reviewers: @sarachen | +56/-12
  summary: Root cause was a misconfigured expiry claim in the JWT issuer. Refresh token rotation now correctly updates exp to now()+86400. All existing session tests pass. Needs @sarachen approval.

  [PR] web-frontend#203: "Migrate dashboard charts to Recharts"
  state=open | author=@mtorres | updated=2026-02-25 | reviewers: @emilyr, @lisawang | +189/-67
  summary: Replaced Chart.js with Recharts for better React 18 support. KPI charts, burndown chart, and velocity chart all migrated. Bundle size reduced by ~40KB. Needs QA sign-off on mobile layout.

  [PR] api-gateway#34: "Add Redis rate limiting middleware"
  state=open | author=@jamespark | updated=2026-02-26 | reviewers: @davidkim | +145/-23
  summary: Token bucket rate limiter using Redis. Per-client limits configurable via env vars. Falls back gracefully if Redis is unavailable. David to review infra/deployment changes.
</github_prs>

<github_issues>
  [ISSUE] payment-service#18: "Stripe webhook occasionally returns 200 but doesn't process"
  state=open | author=@sarachen | updated=2026-02-24 | [bug, payments]
  summary: Intermittent issue where webhook handler returns 200 OK but the event isn't processed. Suspected race condition in the event deduplication layer.

  [ISSUE] user-auth#15: "OAuth2 PKCE flow not implemented for mobile apps"
  state=open | author=@mtorres | updated=2026-02-22 | [enhancement, mobile]
  summary: Mobile clients need PKCE per RFC 7636. Current implicit flow is deprecated.

  [ISSUE] web-frontend#31: "Nav bar collapses incorrectly on 768px–900px screens"
  state=open | author=@lisawang | updated=2026-02-21 | [bug, responsive]

  [ISSUE] web-frontend#30: "Dark mode not supported"
  state=open | author=@mtorres | updated=2026-02-19 | [enhancement, ux]
  summary: Users requesting dark mode. Should use Tailwind dark: variant and CSS custom properties. Figma design linked in WEB-1236.
</github_issues>

<github_commits>
  [payment-service] a3f1b2c 2026-02-26: "fix: handle null metadata in refund validation" — sarachen
  [payment-service] 9d8e7f1 2026-02-25: "feat: add partial refund amount validation" — sarachen
  [payment-service] 2c4b9a0 2026-02-25: "test: add refund flow integration tests" — emilyr
  [user-auth] 4f7c3d2 2026-02-26: "fix: correct JWT expiry to 86400s" — emilyr
  [user-auth] 8a1e9b4 2026-02-25: "test: add token refresh regression tests" — emilyr
  [web-frontend] 6b2d5c8 2026-02-25: "feat: migrate KPI cards to Recharts" — mtorres
  [web-frontend] 1f9a3e7 2026-02-24: "feat: migrate burndown chart to Recharts" — mtorres
  [api-gateway] 3c7b1d9 2026-02-26: "feat: add Redis token bucket rate limiter" — jamespark
  [api-gateway] 5e4f2a8 2026-02-25: "test: rate limiter unit tests + integration" — jamespark
  [notification-service] 7d1c6b3 2026-02-20: "chore: update APNs cert expiry handler" — davidkim
</github_commits>

<github_readmes>
  [payment-service README]
  # payment-service — Stripe-based Payment Processing
  Handles all payment flows: charge, capture, refund, dispute. Built on Stripe SDK v12. Exposes REST endpoints consumed by web-frontend and mobile. Uses PostgreSQL for transaction records and Redis for idempotency keys. Deployed on AWS ECS with auto-scaling based on payment volume.

  [user-auth README]
  # user-auth — Authentication Microservice
  JWT-based authentication with OAuth2 support. Provides /login, /refresh, /logout, /me endpoints. Integrates with Google and GitHub OAuth providers. Sessions stored in Redis with 24h TTL. Rate limited at 5 attempts/min per IP.
</github_readmes>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Jira demo context
// ─────────────────────────────────────────────────────────────────────────────

export function buildDemoJiraContext(_intent: DetectedIntent): string {
  return `<jira_projects>
  PAY: Payment Gateway (software)
  AUTH: User Auth (software)
  WEB: Web Frontend (software)
  BACK: Backend Services (software)
  NOTIF: Notification Service (software)
</jira_projects>

<jira_sprint_summary>
  total=15 | done=6 | in_progress=5 | to_do=3 | blocked=1
  completion=40%
</jira_sprint_summary>

<jira_context>
  [STORY] PAY-1234: "Payment API refactor for v2 endpoints"
  status=In Progress | priority=High | project=Payment Gateway | sprint=Sprint 14
  assignee=Sarah Chen | reporter=Demo Guest | updated=2026-02-26
  description: Refactor all v1 payment endpoints to v2 format with improved error codes, rate limiting headers, and pagination. Includes Stripe integration layer update.

  [BUG] PAY-1235: "Add payment refund feature"
  status=In Review | priority=High | project=Payment Gateway | sprint=Sprint 14
  assignee=Sarah Chen | reporter=Demo Guest | updated=2026-02-26
  description: Full and partial refund flow. PR #142 in payment-service is open and nearly ready. @mtorres and @emilyr are reviewers.

  [BUG] PAY-1236: "Fix double-charge bug on mobile checkout"
  status=In Progress | priority=Critical | project=Payment Gateway | sprint=Sprint 14
  assignee=Emily Rodriguez | reporter=Demo Guest | updated=2026-02-26
  description: iOS users being charged twice when network drops mid-checkout. Root cause suspected in mobile SDK retry handler. No PR yet — Emily investigating.

  [TASK] PAY-1237: "Payment webhook retry mechanism"
  status=To Do | priority=Medium | project=Payment Gateway | sprint=Sprint 14
  assignee=unassigned | reporter=Demo Guest | updated=2026-02-24
  description: Exponential backoff for failed webhook deliveries. Retry up to 5x over 24 hours.

  [BUG] AUTH-1235: "Fix user session timeout bug"
  status=In Review | priority=Critical | project=User Auth | sprint=Sprint 14
  assignee=Emily Rodriguez | reporter=Demo Guest | updated=2026-02-26
  description: Users logged out after 15 min instead of 24 hours. PR #89 fixes JWT expiry claim. Needs @sarachen approval — flagged as at-risk.

  [STORY] AUTH-1238: "Implement OAuth2 PKCE for mobile apps"
  status=To Do | priority=High | project=User Auth | sprint=Sprint 14
  assignee=unassigned | reporter=Demo Guest | updated=2026-02-22

  [STORY] AUTH-1239: "Add TOTP multi-factor authentication"
  status=To Do | priority=Medium | project=User Auth | sprint=Sprint 14
  assignee=Lisa Wang | reporter=Demo Guest | updated=2026-02-20

  [STORY] WEB-1236: "Add dark mode support"
  status=To Do | priority=Medium | project=Web Frontend | sprint=Sprint 14
  assignee=unassigned | reporter=Demo Guest | updated=2026-02-19
  description: System-aware dark mode using CSS custom properties and Tailwind dark: classes. Figma design spec available. 5 story points.

  [TASK] WEB-1240: "Migrate dashboard charts to Recharts"
  status=In Progress | priority=Medium | project=Web Frontend | sprint=Sprint 14
  assignee=Michael Torres | reporter=Demo Guest | updated=2026-02-25
  description: Replacing Chart.js with Recharts. PR #203 open, needs QA review.

  [BUG] WEB-1241: "Fix responsive nav at tablet breakpoints"
  status=To Do | priority=Low | project=Web Frontend | sprint=Sprint 14
  assignee=unassigned | reporter=Demo Guest | updated=2026-02-21

  [TASK] BACK-1237: "Database optimization for search queries"
  status=Blocked | priority=High | project=Backend Services | sprint=Sprint 14
  assignee=James Park | reporter=Demo Guest | updated=2026-02-25
  description: Full-text search taking 3–5 seconds. Plan: GIN indexes + pg_trgm. BLOCKED: waiting for DBA review sign-off before touching production indexes.

  [TASK] BACK-1242: "API gateway rate limiting"
  status=In Review | priority=High | project=Backend Services | sprint=Sprint 14
  assignee=James Park | reporter=Demo Guest | updated=2026-02-26
  description: PR #34 in api-gateway ready for final review. Redis token bucket implementation.

  [TASK] BACK-1243: "Distributed tracing with OpenTelemetry"
  status=To Do | priority=Medium | project=Backend Services | sprint=Sprint 14
  assignee=David Kim | reporter=Demo Guest | updated=2026-02-20

  [STORY] NOTIF-1238: "Implement notification preferences"
  status=In Progress | priority=Medium | project=Notification Service | sprint=Sprint 14
  assignee=Emily Rodriguez | reporter=Demo Guest | updated=2026-02-24
  description: Per-user control over notification channels (email, push, in-app) and frequency.

  [TASK] NOTIF-1244: "Add iOS push notifications via APNs"
  status=To Do | priority=Medium | project=Notification Service | sprint=Sprint 14
  assignee=unassigned | reporter=Demo Guest | updated=2026-02-19
</jira_context>`;
}
