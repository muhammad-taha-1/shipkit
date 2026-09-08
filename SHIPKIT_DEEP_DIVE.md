# ShipKit — Complete Project Deep Dive

> Use this document to explain ShipKit in interviews. It covers purpose, architecture decisions, every feature, security, scalability, and how the systems connect.

---

## 1. What Is ShipKit?

ShipKit is a **production-ready, open-source SaaS starter kit**. It gives you everything you need to launch a multi-tenant SaaS product — authentication, billing, team management, notifications, file uploads, background jobs — all wired together and ready to deploy.

**The problem it solves:** Every SaaS product needs the same 80% of infrastructure — auth, billing, roles, email, file storage. Engineers spend weeks or months rebuilding this boilerplate before writing a single line of product-specific code. ShipKit eliminates that.

**How I'd describe it in one sentence:** "It's a full-stack SaaS boilerplate built with Next.js, Prisma, and Stripe that handles auth, billing, multi-tenancy, RBAC, notifications, file uploads, and background jobs out of the box."

---

## 2. Tech Stack & Why Each Choice

### Frontend

| Technology                  | Why                                                                                                                                                                                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 16 (App Router)** | Server-side rendering, server components, server actions, file-based routing, and API routes in one framework. App Router gives us React Server Components (RSC) which reduce client-side JS and let us fetch data directly in components without API roundtrips. |
| **React 19**                | Latest stable — needed for server components, `use()` hook, and optimistic updates.                                                                                                                                                                               |
| **TypeScript 5**            | Type safety across the entire stack. Catches bugs at compile time, enables confident refactoring, and serves as living documentation.                                                                                                                             |
| **Tailwind CSS 4**          | Utility-first styling that eliminates naming and specificity problems. v4 uses the new CSS-native engine — faster builds, smaller output.                                                                                                                         |
| **shadcn/ui + Base UI**     | Not a component library — it's copy-pasted component source code. Full control, no version lock-in, accessible by default (Base UI handles ARIA).                                                                                                                 |

### Backend

| Technology                          | Why                                                                                                                                                                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PostgreSQL 16**                   | ACID-compliant relational database. Handles complex queries, joins, and transactions that multi-tenant SaaS requires.                                                                                                      |
| **Prisma 7 + `@prisma/adapter-pg`** | Type-safe ORM with auto-generated TypeScript types from the schema. The `adapter-pg` driver gives us connection pooling and edge compatibility. The generated client lives at `src/generated/prisma` for explicit imports. |
| **NextAuth v5 (Auth.js)**           | JWT-based auth with credentials + OAuth (Google, GitHub). Handles session management, token rotation, and the entire auth lifecycle.                                                                                       |
| **Stripe**                          | Industry standard for payments. Handles PCI compliance, checkout sessions, subscription management, webhooks, invoicing, and customer portal.                                                                              |
| **Resend + React Email**            | Modern transactional email API. React Email lets us write email templates as React components — same language, same tooling, type-safe props.                                                                              |
| **Uploadthing**                     | File upload service built for Next.js. Handles presigned URLs, direct uploads, and file metadata — no need to manage S3 buckets directly.                                                                                  |
| **Inngest**                         | Event-driven background job system. Functions trigger on events or cron schedules, with automatic retries and observability. No queue infrastructure to manage.                                                            |
| **Upstash Redis**                   | Serverless Redis over HTTP. Works in edge and serverless environments (no persistent TCP connections needed). Used for rate limiting with sliding window algorithm.                                                        |

### DevOps

| Technology              | Why                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| **Docker**              | Multi-stage build for consistent deployments. Standalone Next.js output keeps the image small (~150MB). |
| **GitHub Actions**      | CI pipeline: lint, typecheck, test, build — in parallel where possible, gated where dependencies exist. |
| **Husky + lint-staged** | Pre-commit hooks run ESLint + Prettier only on staged files. Catches issues before they reach CI.       |
| **Vitest**              | Fast, Vite-native test runner. ESM-first, compatible with our TypeScript config.                        |

---

## 3. Architecture

### Project Structure

```
src/
├── app/              ← Routes (Next.js App Router)
│   ├── (auth)/       ← Auth pages (login, register, etc.)
│   ├── (dashboard)/  ← Authenticated app pages
│   ├── (admin)/      ← Super Admin panel
│   ├── (marketing)/  ← Landing page, pricing
│   └── api/          ← API routes (webhooks, health, etc.)
├── components/       ← Reusable UI components
├── lib/              ← Shared utilities and clients
├── modules/          ← Business logic (domain-driven)
└── generated/prisma/ ← Auto-generated Prisma client
```

### Key Architectural Decisions

**1. Domain-Driven Modules (`src/modules/`)**
Business logic is organized by domain — `auth`, `billing`, `members`, `notifications`, `uploads`, `jobs`, `admin`, `audit`, `settings`, `organizations`. Each module has:

- `actions.ts` — Server actions (`"use server"`) called from client components
- `queries.ts` — Read-only data fetching for server components
- Supporting files for types, permissions, etc.

**Why:** This keeps business logic out of route handlers and components. A component never talks to the database directly — it goes through a module.

**2. Server Components by Default**
Every component is a React Server Component unless it needs interactivity (`"use client"`). Data fetching happens at the component level — no waterfall API calls.

**3. `import "server-only"` Guard**
Every server-side module starts with `import "server-only"`. If you accidentally import a server module into a client component, the build fails immediately. This prevents database credentials, API keys, and business logic from leaking to the browser.

**4. Prisma Global Singleton**

```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const db = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

In development, Next.js hot-reloads modules. Without the global singleton, every reload creates a new Prisma client, exhausting database connections. This pattern caches it on `globalThis`.

---

## 4. Authentication — How It Works

### Flow

1. **Registration:** User submits email + password → password hashed with `bcryptjs` → user created in DB → verification email sent via Resend → user must verify before logging in.

2. **Login (Credentials):** Email + password → validated against Zod schema → user fetched from DB → bcrypt comparison → if valid, JWT issued with `{ id, role, image, bannedAt }`.

3. **Login (OAuth):** User clicks Google/GitHub → redirected to provider → callback creates/links account via PrismaAdapter → JWT issued.

4. **Session Strategy:** JWT-based (not database sessions). Token is stored in an HTTP-only cookie. On every request, the JWT callback refreshes `image`, `role`, and `bannedAt` from the database — so avatar updates and bans take effect immediately without logout.

5. **Banned Users:** The `signIn` callback checks `bannedAt` before allowing login. The `getCurrentUser()` guard also checks `bannedAt`, so even if a user is banned while logged in, they're locked out on the next request.

### Security Measures

- **Passwords never stored in plain text** — bcrypt with salt rounds
- **JWT refreshes on every request** — role changes, bans, and avatar updates are always current
- **Email verification required** for credentials login (configurable via `SKIP_EMAIL_VERIFICATION`)
- **Rate limiting on auth endpoints** — 5 attempts/minute for login, 2/minute for password reset
- **Banned user check at every auth boundary** — not just login

### Impersonation (Super Admin)

Super Admins can impersonate any user via a cookie (`admin-impersonation`). The `getCurrentUser()` function checks for this cookie — if present, it returns the target user's data with `isImpersonating: true`. The `requireSuperAdmin()` guard uses `getRealUser()` instead, which ignores the impersonation cookie. Every impersonation start/stop is logged in the audit trail.

---

## 5. Multi-Tenancy — How It Works

### Data Model

```
User (1) ──→ (many) OrganizationMember ──→ (1) Organization
```

Every resource (files, API keys, audit logs, notifications) is scoped to an organization via `organizationId`. A user can belong to multiple organizations.

### Organization Lifecycle

1. **Creation:** After registration, users go through onboarding where they create their first org. A slug is auto-generated from the name.
2. **Switching:** The org switcher in the sidebar lets users switch between their orgs. The active org is tracked in the URL/cookie.
3. **Invitations:** Admins/Owners invite members by email → invitation record with unique token → email sent → recipient accepts → OrganizationMember created.
4. **Deletion:** Only Owners can delete an org (danger zone in settings). Cascading deletes remove all members, invitations, files, API keys, and audit logs.

### Data Isolation

Every database query that touches org-scoped data includes `organizationId` in the WHERE clause. This isn't enforced at the database level (no row-level security) — it's enforced at the application level through the module layer. Every server action calls `requireOrgMember(orgId)` or `requireOrgRole(orgId, roles)` before accessing data.

---

## 6. RBAC (Role-Based Access Control) — How It Works

### Two Levels of Roles

**Global Roles** (on the User model):

- `USER` — Default
- `SUPER_ADMIN` — Platform-wide admin access

**Organization Roles** (on the OrganizationMember model):

- `OWNER` — Full control (all 11 permissions)
- `ADMIN` — Most control (8 permissions — can't delete org or manage billing)
- `MEMBER` — Limited (3 permissions — create API keys, view audit log, upload files)

### 11 Granular Permissions

```
org:update, org:delete, members:invite, members:remove,
members:changeRole, billing:manage, apiKeys:create,
apiKeys:delete, auditLog:view, files:upload, files:delete
```

### How It's Enforced

```typescript
// Check: does this role have this permission?
hasPermission(member.role, "billing:manage"); // → true for OWNER, false for MEMBER

// Guard: throw if unauthorized
const { user, member } = await requireOrgRole(orgId, ["OWNER", "ADMIN"]);
```

The `hasPermission()` function is a pure lookup — role → permission array → includes check. It's used in:

- **Server actions** (before any mutation)
- **Upload middleware** (before accepting file uploads)
- **UI components** (to conditionally show/hide buttons)

### Why Not Attribute-Based (ABAC)?

RBAC is simpler and covers 95% of SaaS use cases. Three roles with 11 permissions is easy to reason about, test, and explain to users. ABAC adds complexity (policies, conditions, context) that isn't justified until you need per-resource or per-field permissions.

---

## 7. Billing — How It Works

### Plans

| Plan       | Price  | Members   | Storage | API Keys  |
| ---------- | ------ | --------- | ------- | --------- |
| Free       | $0     | 3         | 100 MB  | 1         |
| Pro        | $29/mo | 20        | 5 GB    | 10        |
| Enterprise | $99/mo | Unlimited | 50 GB   | Unlimited |

### Checkout Flow

1. User clicks "Upgrade" → server action creates a Stripe Checkout Session with `orgId` in metadata
2. User completes payment on Stripe's hosted checkout page
3. Stripe fires `checkout.session.completed` webhook → we update the org's `plan`, `stripeCustomerId`, `subscriptionId`, and `subscriptionStatus`

### Webhook Processing

The Stripe webhook handler is **idempotent** — it uses a `ProcessedStripeEvent` table:

```typescript
const existing = await db.processedStripeEvent.findUnique({ where: { eventId: event.id } });
if (existing) return; // Already processed — skip
```

This prevents duplicate processing if Stripe retries the webhook. After processing, the event ID is stored.

**Events handled:**

- `checkout.session.completed` — activate subscription
- `customer.subscription.updated` — update status/plan
- `customer.subscription.deleted` — revert to Free plan
- `invoice.payment_succeeded` — mark as ACTIVE
- `invoice.payment_failed` — mark as PAST_DUE + notify owners

### Why Webhooks Are Synchronous (Not Background Jobs)

Stripe webhooks update critical billing state (plan, subscription status). If we queued them as background jobs, there'd be a window where the user's plan in our DB doesn't match Stripe's reality. Synchronous processing ensures consistency. Only the notification emails triggered by billing changes go through Inngest (async).

### Plan Limits Enforcement

```typescript
// Before inviting a member:
if (currentMemberCount >= plan.limits.maxMembers) throw error;

// Before uploading a file:
await checkStorageLimit(orgId, fileSize); // Sums all file sizes, compares to plan limit
```

Limits are defined in code (not DB), so they're version-controlled and type-safe.

---

## 8. Notification System — How It Works

### Architecture

```
Action happens → createNotification() → checks per-user preferences →
  ├── In-app: writes to Notification table
  └── Email: dispatches to Inngest → Inngest executes with retry → Resend sends email
```

### Preference-Aware Routing

Every notification type has default settings (`defaultInApp: true, defaultEmail: true`). Users can override per-type from `/settings/notifications`. When `createNotification()` runs, it:

1. Fetches all recipient preferences from `NotificationPreference` table
2. For each recipient, checks if in-app is enabled → creates DB record
3. For each recipient, checks if email is enabled → dispatches to Inngest

### Actor Exclusion

The person who triggered the action is excluded from notifications. If you invite someone to your org, you don't get a "Member invited" notification yourself.

### 12 Notification Types

Member events (invited, joined, removed, role changed, invitation revoked), billing events (subscription created/updated/canceled/resumed/deleted, trial ending, payment failed).

### Graceful Degradation

Email dispatch tries Inngest first. If Inngest is unavailable (not configured, service down), it falls back to sending emails directly via Resend:

```typescript
try {
  await inngest.send(events);  // Try async via Inngest
} catch {
  await Promise.allSettled(    // Fall back to direct send
    recipients.map(r => sendEmail({ ... }))
  );
}
```

This means the app works with or without Inngest configured.

---

## 9. File Upload System — How It Works

### Three Upload Endpoints

1. **Avatar Upload** — User profile pictures. Max 2MB. Replaces previous avatar (old file deleted from Uploadthing + DB).
2. **Org Logo Upload** — Organization logos. Max 2MB. Replaces previous logo. Requires `org:update` permission.
3. **Org File Upload** — General files (images + PDFs). Max 8MB, up to 5 files at once. Requires `files:upload` permission. Checks storage limit against plan.

### Security

- Auth check in middleware (before upload starts)
- RBAC permission check (role must have the required permission)
- Storage limit check (total org storage vs. plan limit)
- Old file cleanup (previous avatar/logo deleted to prevent orphaned files)
- Every upload creates an audit log entry

### How Uploadthing Works

1. Client requests an upload URL from our API
2. Our middleware authenticates and authorizes
3. Uploadthing returns a presigned URL
4. Client uploads directly to Uploadthing's CDN (not through our server)
5. Uploadthing calls our `onUploadComplete` callback → we store metadata in DB

This pattern keeps file data off our servers — reduces bandwidth, storage, and attack surface.

---

## 10. Background Jobs — How It Works

### Inngest Architecture

Inngest is an event-driven job system. You define functions that trigger on events or cron schedules. Inngest handles queuing, retries, and observability.

### 5 Job Functions

| Job                         | Trigger                          | What It Does                                                                        |
| --------------------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| `send-notification-email`   | Event: `email/notification.send` | Sends notification email with 3 automatic retries                                   |
| `send-invitation-email`     | Event: `email/invitation.send`   | Sends member invitation email with 3 retries                                        |
| `cleanup-expired-tokens`    | Cron: daily at midnight UTC      | Deletes expired verification/reset tokens from DB                                   |
| `cleanup-old-stripe-events` | Cron: monthly on the 1st         | Deletes ProcessedStripeEvent records > 90 days old                                  |
| `trial-ending-reminder`     | Cron: daily at 9 AM UTC          | Finds orgs with trials ending in 3 days → creates in-app notification + sends email |

### Why Inngest Over a Queue (like BullMQ)?

- **No infrastructure** — no Redis queue to manage, no worker processes to deploy
- **Built-in retries** — configurable per function
- **Cron scheduling** — no need for separate cron service
- **Local dev server** — `npx inngest-cli dev` gives you a UI to inspect and replay jobs
- **Serverless-compatible** — runs on Vercel, AWS Lambda, etc. (no long-running workers)

### Graceful Fallback Pattern

Both `createNotification()` and `inviteMember()` try Inngest first, then fall back to direct email sending. This means:

- **Development:** Works without Inngest running — emails send directly
- **Production:** Emails are async with automatic retries via Inngest
- **Inngest outage:** Falls back to synchronous sending, no emails lost

---

## 11. Rate Limiting — How It Works

### Sliding Window Algorithm

Rate limiting uses the **sliding window** algorithm via `@upstash/ratelimit`. Unlike fixed windows (which reset at boundaries and allow 2x burst), sliding windows count requests over a rolling time period.

### Three Presets

| Preset        | Limit                     | Use Case                           |
| ------------- | ------------------------- | ---------------------------------- |
| `auth`        | 5 requests / 60 seconds   | Login, registration                |
| `auth-strict` | 2 requests / 60 seconds   | Password reset, email verification |
| `api`         | 100 requests / 60 seconds | General API endpoints              |

### Two-Tier Architecture

```
Request → rateLimit(key, { preset: "auth" })
  ├── Redis available? → Use Upstash sliding window (distributed, production-ready)
  └── Redis unavailable? → Use in-memory Map (per-process, development-friendly)
```

**Redis tier:** Distributed across all server instances. If you have 3 servers, the limit is shared. Uses Upstash Redis (HTTP-based, serverless-compatible).

**In-memory tier:** Per-process. Only works for single-server deployments. Used when Redis isn't configured (development). Has a cleanup interval that purges expired buckets every 60 seconds.

### Why Upstash Instead of Local Redis?

Upstash Redis communicates over HTTP/REST, not TCP. This is critical for:

- **Serverless environments** (Vercel, Lambda) where persistent TCP connections aren't possible
- **Edge runtime** where only HTTP fetches are allowed
- **No infrastructure** — no Redis server to manage

---

## 12. Security — Comprehensive Overview

### Authentication Security

- Passwords hashed with **bcrypt** (not MD5, not SHA, not plain text)
- JWT stored in **HTTP-only cookies** (not localStorage — immune to XSS theft)
- JWT refreshes user data on **every request** (bans, role changes take effect immediately)
- **Rate limiting** on auth endpoints to prevent brute force
- **Email verification required** before credentials login

### Authorization Security

- **`import "server-only"`** on every server module prevents client-side import
- **RBAC checks in server actions** before any mutation
- **RBAC checks in upload middleware** before any file upload
- **Org membership verified** on every request to org-scoped data
- **Super Admin checks** use `getRealUser()` to bypass impersonation cookie

### API Security

- **Stripe webhook signature verification** — rejects requests without valid HMAC signature
- **Idempotent webhook processing** — duplicate events are skipped (ProcessedStripeEvent table)
- **API keys are hashed** — only the `lastFour` and `hashedKey` are stored, never the full key
- **API key revealed only once** — on creation, the full key is shown; after that, only the last 4 characters

### Data Security

- **Org-scoped data access** — every query includes `organizationId` to prevent cross-tenant data leaks
- **Cascade deletes** — when an org or user is deleted, all related data is cleaned up (Prisma `onDelete: Cascade`)
- **Soft operations where appropriate** — users are "banned" (timestamped), not deleted, preserving audit trail

### Input Validation

- **Zod schemas** validate all user input — registration, login, org creation, settings updates, invitations
- Validation happens in **server actions** before touching the database
- **Type-safe** — Zod infers TypeScript types, so the validated data is correctly typed downstream

### Infrastructure Security

- **Docker runs as non-root** (`nextjs` user with UID 1001)
- **`.env` files excluded** from Docker image via `.dockerignore`
- **Health check endpoint** (`/api/health`) does not expose sensitive information — only `healthy`/`degraded` status
- **Telemetry disabled** in Docker build (`NEXT_TELEMETRY_DISABLED=1`)

---

## 13. Scalability — How It Scales

### Horizontal Scaling

**Stateless server:** The Next.js server is stateless — JWT auth means no session store needed. You can run multiple instances behind a load balancer.

**Distributed rate limiting:** With Upstash Redis, rate limits are shared across all server instances. User can't bypass limits by hitting different servers.

**Standalone Docker output:** `output: "standalone"` in Next.js config creates a self-contained server. No `node_modules` needed at runtime — just the server binary and static assets. This keeps the Docker image small and deploys fast.

### Database Scaling

**Connection pooling:** Prisma's `@prisma/adapter-pg` uses the `pg` driver with connection pooling, so you don't exhaust database connections under load.

**Indexed queries:** The Prisma schema has indexes on:

- `organizations.slug` — fast org lookup
- `organization_members.organizationId` — fast member listing
- `invitations.email, organizationId` and `token` — fast invitation lookup
- `api_keys.hashedKey` — fast API key verification
- `audit_logs.organizationId, createdAt` and `action` — fast log queries
- `notifications.recipientId, read, createdAt` — fast notification feed
- `files.organizationId`, `userId`, `category` — fast file listing

**Cursor-based pagination:** Notifications and audit logs use cursor-based pagination (not offset-based). This is O(1) regardless of dataset size, while offset pagination is O(n) where n is the offset.

### Background Job Scaling

**Inngest scales independently.** It's a managed service — more events just mean more function executions. You don't manage workers, queues, or concurrency.

**Cron jobs are idempotent.** The token cleanup and Stripe event cleanup can run multiple times safely. The trial reminder checks a date range, so even if it runs twice, users don't get duplicate notifications (because it queries `trialEndsAt` in a specific day range).

### Caching Strategy

**Redis for rate limiting only** (currently). The architecture is ready for caching — `redis.ts` exports a client that can be used for caching expensive queries (e.g., plan details, org settings). The pattern would be:

```
Check Redis cache → hit? return cached → miss? query DB → store in Redis → return
```

**React Server Components as implicit cache.** Since RSCs render on the server, data is fetched once per request — no duplicate API calls from multiple client components.

---

## 14. Audit Logging — How It Works

### What Gets Logged

30 distinct action types covering:

- **Organization lifecycle:** created, updated, deleted
- **Member management:** invited, joined, removed, role changed
- **Billing:** checkout, subscription CRUD
- **API keys:** created, revoked
- **Files:** uploaded, deleted
- **User actions:** profile update, password change, avatar update
- **Admin actions:** role changes, plan overrides, bans, impersonation

### Audit Log Schema

```
AuditLog {
  action     — "member.invited"
  entityType — "member"
  entityId   — "cuid_123"
  metadata   — { role: "ADMIN", email: "user@example.com" }
  userId     — who performed the action
  orgId      — which organization
  ipAddress  — request IP
  userAgent  — browser/client info
  createdAt  — timestamp
}
```

### Queryable

The audit log supports:

- Filter by action type (dropdown in UI)
- Filter by organization
- Cursor-based pagination
- Super Admin can view system-wide audit log across all orgs

---

## 15. Super Admin Panel — How It Works

### Access Control

Only users with `GlobalRole.SUPER_ADMIN` can access `/admin/*`. The `requireSuperAdmin()` guard checks the **real user** (not impersonated), so an admin impersonating a regular user can still access the admin panel.

### Capabilities

- **Dashboard:** Total users, total orgs, MRR (monthly recurring revenue) calculated from active subscriptions, recent activity
- **User Management:** View all users, change global roles, ban/unban users (with reason), delete users
- **Org Management:** View all orgs, override plans (bypass Stripe), view org detail with members and activity, delete orgs
- **System Audit Log:** View all audit entries across all organizations
- **Impersonation:** View the app as any user to debug issues, with a visible banner

### Promoting a User

```bash
npm run db:promote-admin  # Interactive script that lists users and promotes to SUPER_ADMIN
```

---

## 16. Testing Strategy

### What's Tested (102 tests across 5 suites)

1. **Utilities (19 tests):** `cn()` class merging, `formatCurrency()`, `generateSlug()`, `absoluteUrl()`, `formatBytes()` — all pure functions.

2. **Permissions (27 tests):** Every role (OWNER, ADMIN, MEMBER) verified against all 11 permissions. OWNER has all 11, ADMIN has 8, MEMBER has 3. Tests verify both "has permission" and "does not have permission" cases.

3. **Billing (17 tests):** Plan definitions (names, prices, limits), plan ordering, feature lists, `getPlan()` function.

4. **Validations (23 tests):** Every Zod schema (login, register, org creation, invitation, settings, profile, password change, API key) tested with valid inputs, edge cases, and invalid inputs.

5. **Rate Limiting (5 tests):** Tests run with `vi.mock("@/lib/redis", () => ({ redis: null }))` to force the in-memory fallback path. Tests verify: first request allowed, requests within limit allowed, request exceeding limit blocked, remaining count accuracy.

### Test Infrastructure

- `tests/setup.ts` mocks `server-only` (`vi.mock("server-only", () => ({}))`) so server modules can be imported in tests
- `vitest.config.mts` maps `@/` to `./src` for path aliases
- Tests are pure unit tests — no database, no network, no side effects

### What's NOT Tested (and why)

- **Integration tests with a real DB** — would require a test database, Docker in CI, migration setup. Would be Phase 18.
- **E2E tests (Playwright)** — would test actual user flows (register → create org → invite member). Valuable but requires a running app + DB.
- **Component tests** — React component rendering is implicitly tested by the build (TypeScript catches prop errors).

---

## 17. Docker & Deployment

### Multi-Stage Build

```
Stage 1: deps     → npm ci + copy prisma schema (smallest layer, cached if lock file unchanged)
Stage 2: builder  → prisma generate + next build (compiles app)
Stage 3: runner   → copies only the standalone output + static assets (minimal runtime image)
```

**Why multi-stage?** The `node_modules` folder is ~500MB. The standalone output is ~30MB. Multi-stage keeps the final image small by discarding everything not needed at runtime.

### Security in Docker

- Runs as non-root user (`nextjs:nodejs`, UID 1001)
- `.env` files are excluded (passed at runtime via `--env-file` or orchestrator secrets)
- Next.js telemetry disabled

### CI Pipeline (GitHub Actions)

```
[push/PR to main]
    ├── lint-and-typecheck (parallel)  → npm ci → prisma generate → eslint → tsc
    ├── test (parallel)                → npm ci → prisma generate → vitest
    └── build (after both pass)        → npm ci → prisma generate → next build
```

**Why this structure?** Lint and test run in parallel (faster feedback). Build only runs if both pass (no wasted compute on broken code). Each job installs independently for isolation.

---

## 18. How the Systems Connect (Data Flow Examples)

### Example 1: User Registers and Creates an Org

```
1. POST /register → registerSchema.safeParse(input)
2. Check if email exists → hash password with bcrypt
3. Create User in DB → send verification email (via Inngest or direct)
4. User clicks verification link → emailVerified set to now()
5. User logs in → JWT issued → redirect to /onboarding
6. User enters org name → slug generated → Organization created
7. OrganizationMember created with role OWNER
8. Audit log: "org.created"
9. Redirect to /dashboard
```

### Example 2: Admin Invites a Member

```
1. Admin clicks "Invite Member" → inviteMemberSchema.safeParse(input)
2. requireOrgRole(orgId, ["OWNER", "ADMIN"]) → verify permission "members:invite"
3. Check plan member limit → check existing invitation
4. Create Invitation with unique token + 7-day expiry
5. Try inngest.send("email/invitation.send") → fallback to direct sendEmail()
6. Audit log: "member.invited"
7. Notify other admins/owners: createNotification("MEMBER_INVITED")
8. Recipient gets email → clicks accept link → /accept-invite?token=xxx
9. Verify token not expired → create OrganizationMember → mark invitation ACCEPTED
10. Audit log: "member.joined"
```

### Example 3: User Upgrades to Pro Plan

```
1. User clicks "Upgrade to Pro" on /billing
2. Server action creates Stripe Checkout Session with orgId in metadata
3. User completes payment on Stripe's hosted page
4. Stripe sends checkout.session.completed webhook to /api/webhooks/stripe
5. Verify webhook signature → check ProcessedStripeEvent for idempotency
6. Retrieve subscription from Stripe → map price ID to plan
7. Update org: plan=PRO, stripeCustomerId, subscriptionId, subscriptionStatus=ACTIVE
8. Record ProcessedStripeEvent (prevents double processing)
9. Audit log: "billing.subscription_created"
10. Notify admins/owners: createNotification("BILLING_SUBSCRIPTION_CREATED")
```

### Example 4: Payment Fails

```
1. Stripe sends invoice.payment_failed webhook
2. Find org by subscriptionId → update subscriptionStatus to PAST_DUE
3. Notify org owners: createNotification("INVOICE_PAYMENT_FAILED")
   → Preference check → in-app notification created + email dispatched via Inngest
4. Owner sees bell icon badge → clicks → sees "Payment failed" → clicks link → /billing
5. Owner updates payment method via Stripe Customer Portal
```

---

## 19. Interview Talking Points

### "Tell me about a project you built"

> "I built ShipKit, a production-ready SaaS starter kit. It solves the problem every SaaS engineer faces — spending weeks rebuilding auth, billing, and team management before writing product code. It has NextAuth v5 with JWT auth, Stripe billing with idempotent webhook processing, multi-tenant organizations with RBAC, Inngest background jobs with graceful fallback, Upstash Redis rate limiting, and a full CI/CD pipeline."

### "What was the hardest technical decision?"

> "Deciding how to handle Stripe webhooks. The tempting approach is to queue them as background jobs, but billing state needs to be immediately consistent — if a user just paid, they need to see their plan updated on the next page load. So I kept webhook processing synchronous for the DB mutations, but offloaded the notification emails to Inngest asynchronously. This gives us consistency where it matters and performance where it doesn't."

### "How does your auth system work?"

> "It uses NextAuth v5 with JWT strategy. Passwords are hashed with bcrypt. The JWT is stored in an HTTP-only cookie. What makes it robust is that the JWT callback refreshes user data from the database on every request — so if a Super Admin bans a user or changes their role, it takes effect immediately on the next request, not at next login. Rate limiting on auth endpoints prevents brute force — 5 attempts per minute for login, 2 for password reset."

### "How does it handle multi-tenancy?"

> "Every resource is scoped to an organization through a foreign key. Users join organizations as members with one of three roles — Owner, Admin, or Member — each with different permissions. Every server action validates org membership before touching data. It's application-level isolation, not database-level, because it's more portable and flexible — you can run the same Prisma schema on any PostgreSQL provider."

### "How would you scale this?"

> "It's already designed for horizontal scaling. The server is stateless — JWT auth means no session affinity needed. Rate limiting uses Upstash Redis (distributed), so limits are shared across instances. The Docker image uses standalone output (~30MB, fast deploy). Background jobs are handled by Inngest (managed service, scales independently). For database scaling, I'd add read replicas and move to connection pooling with PgBouncer. For caching, the Redis client is already there — I'd add a cache layer for expensive queries like dashboard stats."

### "How do you ensure security?"

> "Multiple layers. Input validation with Zod at every boundary. Passwords hashed with bcrypt. Server-only modules can't be imported in client code (build fails). RBAC checks in every server action and upload middleware. Stripe webhooks verify HMAC signatures. API keys are hashed in the database. Rate limiting prevents brute force. Docker runs as non-root. The audit log captures 30 distinct action types for compliance and debugging."

### "Why these specific technologies?"

> "Each choice has a specific reason. Next.js App Router for server components (less client JS, simpler data fetching). Prisma for type-safe DB queries that catch errors at compile time. Stripe because it handles PCI compliance — I never touch credit card numbers. Upstash Redis over local Redis because it works over HTTP, critical for serverless. Inngest over BullMQ because it's infrastructure-free — no queue server to manage. Every choice optimizes for developer experience AND production readiness."

---

## 20. Database Schema Summary

### 13 Models

| Model                    | Purpose                                                             |
| ------------------------ | ------------------------------------------------------------------- |
| `User`                   | User accounts with global role (USER/SUPER_ADMIN)                   |
| `Account`                | OAuth provider links (Google, GitHub)                               |
| `Session`                | NextAuth sessions (used by adapter, JWT strategy doesn't need this) |
| `VerificationToken`      | Email verification tokens                                           |
| `PasswordResetToken`     | Password reset tokens (with expiry)                                 |
| `Organization`           | Tenant — name, slug, logo, Stripe IDs, plan, subscription status    |
| `OrganizationMember`     | Join table — user ↔ org with role (OWNER/ADMIN/MEMBER)              |
| `Invitation`             | Pending invitations with token, status, expiry                      |
| `ApiKey`                 | Hashed API keys with last-four, expiry                              |
| `ProcessedStripeEvent`   | Idempotency table for webhook deduplication                         |
| `AuditLog`               | Action log with actor, entity, metadata, IP, user agent             |
| `File`                   | Upload metadata — key, URL, size, type, category                    |
| `Notification`           | In-app notifications with read state                                |
| `NotificationPreference` | Per-user, per-type notification routing preferences                 |

### 6 Enums

`GlobalRole`, `MemberRole`, `PlanType`, `SubscriptionStatus`, `InvitationStatus`, `FileCategory`, `NotificationType` (12 types)

---

## 21. Numbers At a Glance

- **166 source files** (TypeScript/TSX)
- **24 UI components** (shadcn/ui)
- **10 domain modules** (auth, billing, members, organizations, notifications, uploads, jobs, admin, audit, settings)
- **5 background jobs** (2 event-driven, 3 cron)
- **13 database models** with 6 enums
- **11 RBAC permissions** across 3 roles
- **12 notification types** with per-user preferences
- **30 audit log action types**
- **102 unit tests** across 5 suites
- **3-stage Docker build** (deps → builder → runner)
- **3-job CI pipeline** (lint+typecheck → test → build)
