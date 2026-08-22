# ShipKit -- Production-Ready SaaS Starter Kit

## Complete Implementation Plan (A to Z)

> An open-source, production-ready Next.js SaaS boilerplate with authentication,
> multi-tenancy, Stripe billing, RBAC, email, background jobs, and more.
> Built with Next.js 15, PostgreSQL, Prisma, and Stripe.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Setup](#4-environment-setup)
5. [Database Schema](#5-database-schema)
6. [Phase 1 -- Foundation](#6-phase-1--foundation)
7. [Phase 2 -- Authentication](#7-phase-2--authentication)
8. [Phase 3 -- Multi-Tenancy & RBAC](#8-phase-3--multi-tenancy--rbac)
9. [Phase 4 -- Stripe Billing](#9-phase-4--stripe-billing)
10. [Phase 5 -- Email System](#10-phase-5--email-system)
11. [Phase 6 -- Dashboard & Analytics](#11-phase-6--dashboard--analytics)
12. [Phase 7 -- Settings & Profile](#12-phase-7--settings--profile)
13. [Phase 8 -- Super Admin Panel](#13-phase-8--super-admin-panel)
14. [Phase 9 -- API Keys & Audit Logs](#14-phase-9--api-keys--audit-logs)
15. [Phase 10 -- Background Jobs](#15-phase-10--background-jobs)
16. [Phase 11 -- Scalability & Caching](#16-phase-11--scalability--caching)
17. [Phase 12 -- Testing](#17-phase-12--testing)
18. [Phase 13 -- Docker & CI/CD](#18-phase-13--docker--cicd)
19. [Phase 14 -- Documentation & README](#19-phase-14--documentation--readme)
20. [Phase 15 -- Landing Page](#20-phase-15--landing-page)
21. [Deployment Guide](#21-deployment-guide)
22. [Design System & UI Guidelines](#22-design-system--ui-guidelines)
23. [API Route Reference](#23-api-route-reference)
24. [Implementation Notes & Conventions](#24-implementation-notes--conventions)
25. [Security Architecture](#25-security-architecture)
26. [Tool-by-Tool Breakdown -- What Does What & Why](#26-tool-by-tool-breakdown----what-does-what--why)

---

## 1. PROJECT OVERVIEW

### What is ShipKit?
A fully-featured SaaS starter kit that handles all the boilerplate every SaaS needs:
auth, billing, teams, permissions, email, and infrastructure. Developers fork it
and start building their product immediately.

### Target Audience
- Developers building SaaS products
- Indie hackers who want to skip 3 weeks of boilerplate
- Teams evaluating Next.js + PostgreSQL architecture

### GitHub Repository Goals
- Clean, readable code with consistent patterns
- Comprehensive README with architecture diagrams
- One-command local setup (Docker)
- Well-documented environment variables
- CI pipeline that runs on every PR

---

## 2. TECH STACK

### Core
| Layer              | Technology                     | Version  |
|--------------------|--------------------------------|----------|
| Framework          | Next.js (App Router)           | 15.x     |
| Language           | TypeScript                     | 5.x      |
| Database           | PostgreSQL                     | 16       |
| ORM                | Prisma                         | 6.x      |
| Auth               | NextAuth.js (Auth.js)          | v5       |
| Payments           | Stripe                         | Latest   |
| Styling            | Tailwind CSS                   | 4.x      |
| UI Components      | shadcn/ui                      | Latest   |
| Email              | React Email + Resend           | Latest   |
| Background Jobs    | Inngest                        | Latest   |
| Caching            | Redis (Upstash)                | Latest   |
| Rate Limiting      | @upstash/ratelimit             | Latest   |

### Development & Infrastructure
| Tool               | Purpose                        |
|--------------------|--------------------------------|
| Docker Compose     | Local PostgreSQL + Redis       |
| Vitest             | Unit & integration testing     |
| Playwright         | E2E testing                    |
| GitHub Actions     | CI/CD pipeline                 |
| ESLint + Prettier  | Code quality                   |
| Husky + lint-staged| Pre-commit hooks               |
| Zod                | Runtime validation             |

### Key Libraries
| Library            | Purpose                        |
|--------------------|--------------------------------|
| @tanstack/react-table | Data tables                 |
| recharts           | Dashboard charts               |
| date-fns           | Date formatting                |
| lucide-react       | Icons                          |
| nuqs               | URL state management           |
| sonner             | Toast notifications            |
| cmdk               | Command palette (Cmd+K)        |
| next-themes        | Dark/light mode                |

---

## 3. PROJECT STRUCTURE

```
shipkit/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Lint, type-check, test on PR
│   │   └── e2e.yml                   # Playwright tests
│   └── PULL_REQUEST_TEMPLATE.md
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Generated migrations
│   └── seed.ts                       # Seed data for development
│
├── public/
│   ├── logo.svg
│   └── og-image.png                  # Open Graph image
│
├── src/
│   ├── app/
│   │   ├── (auth)/                   # Auth route group (no sidebar)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx
│   │   │   ├── verify-email/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx            # Centered card layout
│   │   │
│   │   ├── (dashboard)/              # Dashboard route group (with sidebar)
│   │   │   ├── layout.tsx            # Sidebar + header layout
│   │   │   ├── page.tsx              # Dashboard home / overview
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx          # Client list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Add client
│   │   │   │   └── [clientId]/
│   │   │   │       └── page.tsx      # Client details
│   │   │   ├── billing/
│   │   │   │   └── page.tsx          # Plans, subscription, invoices
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx          # General org settings
│   │   │   │   ├── members/
│   │   │   │   │   └── page.tsx      # Team members & invites
│   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx      # User profile
│   │   │   │   └── api-keys/
│   │   │   │       └── page.tsx      # API key management
│   │   │   └── activity/
│   │   │       └── page.tsx          # Audit log
│   │   │
│   │   ├── (marketing)/              # Landing page route group
│   │   │   ├── layout.tsx            # Navbar + footer
│   │   │   ├── page.tsx              # Landing/home page
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   └── docs/
│   │   │       └── page.tsx
│   │   │
│   │   ├── admin/                    # Super admin panel
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Admin dashboard
│   │   │   ├── organizations/
│   │   │   │   └── page.tsx          # All orgs
│   │   │   └── users/
│   │   │       └── page.tsx          # All users
│   │   │
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   └── stripe/
│   │   │   │       └── route.ts      # Stripe webhook handler
│   │   │   ├── health/
│   │   │   │   └── route.ts          # Health check endpoint
│   │   │   └── v1/                   # Public API (if needed)
│   │   │       └── [...route]/
│   │   │           └── route.ts
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── not-found.tsx
│   │   └── error.tsx                 # Global error boundary
│   │
│   ├── modules/                      # Domain modules (business logic)
│   │   ├── auth/
│   │   │   ├── auth.config.ts        # NextAuth configuration
│   │   │   ├── auth.ts               # Auth instance export
│   │   │   ├── actions.ts            # Server actions (login, register, etc.)
│   │   │   ├── guards.ts             # Auth guard helpers
│   │   │   └── types.ts
│   │   │
│   │   ├── billing/
│   │   │   ├── stripe.ts             # Stripe client singleton
│   │   │   ├── plans.ts              # Plan definitions & pricing
│   │   │   ├── actions.ts            # Server actions (subscribe, cancel, etc.)
│   │   │   ├── webhooks.ts           # Webhook event handlers
│   │   │   └── types.ts
│   │   │
│   │   ├── organizations/
│   │   │   ├── actions.ts            # Server actions (create, update, invite)
│   │   │   ├── queries.ts            # Data fetching functions
│   │   │   └── types.ts
│   │   │
│   │   ├── members/
│   │   │   ├── actions.ts            # Invite, remove, change role
│   │   │   ├── permissions.ts        # RBAC permission definitions
│   │   │   └── types.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── emails.tsx            # React Email templates
│   │   │   ├── send.ts              # Email sending logic
│   │   │   └── types.ts
│   │   │
│   │   └── audit/
│   │       ├── log.ts                # Audit logging utility
│   │       ├── queries.ts            # Fetch audit logs
│   │       └── types.ts
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── table.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── select.tsx
│   │   │   ├── form.tsx
│   │   │   ├── label.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── command.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── sonner.tsx
│   │   │
│   │   ├── layouts/
│   │   │   ├── sidebar.tsx           # Dashboard sidebar navigation
│   │   │   ├── header.tsx            # Dashboard header with user menu
│   │   │   ├── mobile-nav.tsx        # Mobile responsive nav
│   │   │   └── theme-toggle.tsx      # Dark/light mode switch
│   │   │
│   │   ├── shared/
│   │   │   ├── data-table.tsx        # Reusable data table with sorting/filtering
│   │   │   ├── empty-state.tsx       # Empty state placeholder
│   │   │   ├── loading.tsx           # Loading skeletons
│   │   │   ├── page-header.tsx       # Page title + description + actions
│   │   │   ├── confirm-dialog.tsx    # Confirmation modal
│   │   │   ├── copy-button.tsx       # Click to copy
│   │   │   └── error-boundary.tsx    # Client error boundary
│   │   │
│   │   ├── forms/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── forgot-password-form.tsx
│   │   │   ├── org-create-form.tsx
│   │   │   ├── invite-member-form.tsx
│   │   │   ├── profile-form.tsx
│   │   │   └── api-key-form.tsx
│   │   │
│   │   ├── billing/
│   │   │   ├── pricing-cards.tsx     # Plan selection cards
│   │   │   ├── subscription-status.tsx
│   │   │   ├── invoice-list.tsx
│   │   │   └── usage-meter.tsx
│   │   │
│   │   └── dashboard/
│   │       ├── stats-cards.tsx       # KPI cards (MRR, active users, etc.)
│   │       ├── revenue-chart.tsx     # Revenue over time
│   │       ├── recent-activity.tsx   # Activity feed
│   │       └── quick-actions.tsx     # Common action shortcuts
│   │
│   ├── lib/
│   │   ├── db.ts                     # Prisma client singleton
│   │   ├── redis.ts                  # Redis client (Upstash)
│   │   ├── rate-limit.ts            # Rate limiter setup
│   │   ├── utils.ts                  # General utilities (cn, formatCurrency, etc.)
│   │   ├── constants.ts             # App-wide constants
│   │   ├── errors.ts                # Custom error classes
│   │   └── validations.ts           # Shared Zod schemas
│   │
│   ├── hooks/
│   │   ├── use-current-org.ts       # Get active organization
│   │   ├── use-permissions.ts       # Check user permissions
│   │   └── use-debounce.ts          # Debounce hook
│   │
│   └── types/
│       ├── index.ts                  # Shared types
│       └── next-auth.d.ts           # NextAuth type extensions
│
├── emails/                           # React Email templates (preview server)
│   ├── welcome.tsx
│   ├── invite-member.tsx
│   ├── reset-password.tsx
│   ├── verify-email.tsx
│   ├── invoice-paid.tsx
│   └── subscription-reminder.tsx
│
├── tests/
│   ├── unit/
│   │   ├── permissions.test.ts
│   │   ├── billing.test.ts
│   │   └── utils.test.ts
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── organizations.test.ts
│   │   └── stripe-webhooks.test.ts
│   └── e2e/
│       ├── auth.spec.ts
│       ├── onboarding.spec.ts
│       └── billing.spec.ts
│
├── docker-compose.yml                # PostgreSQL + Redis for local dev
├── Dockerfile                        # Production build
├── .env.example                      # All env vars documented
├── .eslintrc.json
├── .prettierrc
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── next.config.ts
├── package.json
├── LICENSE                           # MIT
└── README.md                         # Comprehensive documentation
```

---

## 4. ENVIRONMENT SETUP

### .env.example (every variable documented)
```env
# ============================================
# APP
# ============================================
NEXT_PUBLIC_APP_NAME="ShipKit"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# ============================================
# DATABASE (PostgreSQL)
# ============================================
DATABASE_URL="postgresql://shipkit:shipkit@localhost:5432/shipkit?schema=public"

# ============================================
# AUTH (NextAuth.js v5)
# ============================================
AUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers (optional -- app works with email/password only)
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# ============================================
# STRIPE
# ============================================
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_FREE_PRICE_ID=""
STRIPE_PRO_PRICE_ID=""
STRIPE_ENTERPRISE_PRICE_ID=""

# ============================================
# REDIS (Upstash or local)
# ============================================
REDIS_URL="redis://localhost:6379"
# If using Upstash:
# UPSTASH_REDIS_REST_URL=""
# UPSTASH_REDIS_REST_TOKEN=""

# ============================================
# EMAIL (Resend)
# ============================================
RESEND_API_KEY="re_..."
EMAIL_FROM="ShipKit <noreply@yourdomain.com>"

# ============================================
# INNGEST (Background Jobs)
# ============================================
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""
```

### docker-compose.yml
```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: shipkit
      POSTGRES_PASSWORD: shipkit
      POSTGRES_DB: shipkit
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### First-time setup commands
```bash
# 1. Clone and install
git clone https://github.com/yourusername/shipkit.git
cd shipkit
npm install

# 2. Start databases
docker compose up -d

# 3. Setup environment
cp .env.example .env
# Edit .env with your keys

# 4. Setup database
npx prisma migrate dev
npx prisma db seed

# 5. Start development
npm run dev
```

---

## 5. DATABASE SCHEMA

### Complete Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==========================================
// AUTH MODELS (NextAuth.js v5 compatible)
// ==========================================

model User {
  id              String    @id @default(cuid())
  name            String?
  email           String    @unique
  emailVerified   DateTime?
  image           String?
  passwordHash    String?
  role            GlobalRole @default(USER)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  accounts        Account[]
  sessions        Session[]
  memberships     OrganizationMember[]
  invitationsSent Invitation[] @relation("InvitedBy")
  auditLogs       AuditLog[]
  apiKeys         ApiKey[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())

  @@map("password_reset_tokens")
}

// ==========================================
// ORGANIZATION / MULTI-TENANCY MODELS
// ==========================================

model Organization {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  logo            String?
  stripeCustomerId String? @unique
  subscriptionId  String?  @unique
  subscriptionStatus SubscriptionStatus @default(TRIALING)
  plan            PlanType @default(FREE)
  trialEndsAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  members         OrganizationMember[]
  invitations     Invitation[]
  auditLogs       AuditLog[]
  apiKeys         ApiKey[]

  @@index([slug])
  @@map("organizations")
}

model OrganizationMember {
  id             String   @id @default(cuid())
  userId         String
  organizationId String
  role           MemberRole @default(MEMBER)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
  @@index([organizationId])
  @@map("organization_members")
}

model Invitation {
  id             String   @id @default(cuid())
  email          String
  organizationId String
  role           MemberRole @default(MEMBER)
  token          String   @unique
  status         InvitationStatus @default(PENDING)
  expiresAt      DateTime
  invitedById    String
  createdAt      DateTime @default(now())

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  invitedBy      User         @relation("InvitedBy", fields: [invitedById], references: [id])

  @@index([email, organizationId])
  @@index([token])
  @@map("invitations")
}

// ==========================================
// API KEYS
// ==========================================

model ApiKey {
  id             String   @id @default(cuid())
  name           String
  hashedKey      String   @unique
  lastFour       String
  lastUsedAt     DateTime?
  expiresAt      DateTime?
  organizationId String
  userId         String
  createdAt      DateTime @default(now())

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([hashedKey])
  @@map("api_keys")
}

// ==========================================
// STRIPE IDEMPOTENCY
// ==========================================

model ProcessedStripeEvent {
  id        String   @id @default(cuid())
  eventId   String   @unique
  type      String
  createdAt DateTime @default(now())

  @@index([eventId])
  @@map("processed_stripe_events")
}

// ==========================================
// AUDIT LOG
// ==========================================

model AuditLog {
  id             String   @id @default(cuid())
  action         String
  entityType     String
  entityId       String?
  metadata       Json?
  ipAddress      String?
  userAgent      String?
  userId         String?
  organizationId String
  createdAt      DateTime @default(now())

  user           User?        @relation(fields: [userId], references: [id], onDelete: SetNull)
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId, createdAt])
  @@index([action])
  @@map("audit_logs")
}

// ==========================================
// ENUMS
// ==========================================

enum GlobalRole {
  USER
  SUPER_ADMIN
}

enum MemberRole {
  OWNER
  ADMIN
  MEMBER
}

enum PlanType {
  FREE
  PRO
  ENTERPRISE
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
  INCOMPLETE
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
  REVOKED
}
```

### Database Indexes Strategy
- `organizations.slug` -- fast org lookup by URL slug
- `organization_members.organizationId` -- fast member listing per org
- `invitations.token` -- fast invite acceptance
- `invitations(email, organizationId)` -- prevent duplicate invites
- `api_keys.hashedKey` -- fast API key validation
- `audit_logs(organizationId, createdAt)` -- fast audit log queries with time range
- `audit_logs.action` -- filter by action type

---

## 6. PHASE 1 -- FOUNDATION

### Step 1.1: Initialize Next.js Project
```bash
npx create-next-app@latest shipkit --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd shipkit
```

### Step 1.2: Install Core Dependencies
```bash
# Database
npm install prisma @prisma/client

# Auth
npm install next-auth@beta @auth/prisma-adapter

# UI
npm install tailwindcss @tailwindcss/postcss
npx shadcn@latest init
npx shadcn@latest add button input label card dialog dropdown-menu table badge avatar skeleton tabs select form textarea switch separator sheet command popover tooltip sonner

# Utilities
npm install zod date-fns lucide-react next-themes nuqs recharts clsx tailwind-merge

# Dev dependencies
npm install -D @types/node prettier eslint-config-prettier husky lint-staged
```

### Step 1.3: Configure Prisma
```bash
npx prisma init
```
- Copy the schema from Section 5 into `prisma/schema.prisma`
- Update `DATABASE_URL` in `.env`
- Run `npx prisma migrate dev --name init`

### Step 1.4: Create Prisma Client Singleton
File: `src/lib/db.ts`
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

### Step 1.5: Create Utility Functions
File: `src/lib/utils.ts`
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

export function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}
```

### Step 1.6: Create Custom Error Classes
File: `src/lib/errors.ts`
```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404, "NOT_FOUND");
  }
}
```

### Step 1.7: Setup Root Layout
File: `src/app/layout.tsx`
- ThemeProvider (next-themes)
- Sonner Toaster
- Global font (Inter from next/font)
- Metadata with OG tags

### Step 1.8: Setup Docker Compose
- Copy docker-compose.yml from Section 4
- Create npm scripts:
  - `"db:up": "docker compose up -d"`
  - `"db:down": "docker compose down"`
  - `"db:migrate": "prisma migrate dev"`
  - `"db:seed": "prisma db seed"`
  - `"db:studio": "prisma studio"`
  - `"db:reset": "prisma migrate reset"`

---

## 7. PHASE 2 -- AUTHENTICATION

### Step 2.1: Configure NextAuth.js v5
File: `src/modules/auth/auth.config.ts`

Providers to configure:
1. **Credentials** -- email + password login
   - Hash passwords with bcrypt
   - Validate with Zod schema
2. **Google OAuth** (optional, works without it)
3. **GitHub OAuth** (optional, works without it)

Strategy:
- Use **JWT session strategy** (not database sessions) -- explicitly set `session: { strategy: "jwt" }`
- The Prisma adapter defaults to database sessions; we override to JWT for
  faster auth checks (no DB query per request) and better serverless compatibility

Callbacks:
- `jwt` callback: attach userId, orgId, role to token
- `session` callback: expose userId, orgId, role in session
- `signIn` callback: handle email verification check

### Step 2.2: Auth Module Files

**`src/modules/auth/auth.ts`** -- Export auth instance
```typescript
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
```

**`src/modules/auth/actions.ts`** -- Server Actions:
- `registerAction(formData)` -- create user with hashed password, send verification email
- `loginAction(formData)` -- authenticate with credentials
- `forgotPasswordAction(email)` -- generate reset token, send email
- `resetPasswordAction(token, newPassword)` -- validate token, update password
- `verifyEmailAction(token)` -- mark email as verified

**`src/modules/auth/guards.ts`** -- Auth Guards:
```typescript
// getCurrentUser() -- get session user or null
// requireAuth() -- get session user or redirect to /login
// requireOrgMember(orgId) -- check user is member of org
// requireOrgRole(orgId, roles[]) -- check user has specific role
// requireSuperAdmin() -- check user is SUPER_ADMIN
```

### Step 2.3: Auth Pages

**Login page** (`/login`):
- Email + password form
- OAuth buttons (Google, GitHub)
- "Forgot password?" link
- "Don't have an account? Sign up" link
- Error handling with toast notifications

**Register page** (`/register`):
- Name, email, password, confirm password
- Password strength indicator
- Terms acceptance checkbox
- Auto-login after registration
- Send verification email

**Forgot Password** (`/forgot-password`):
- Email input
- Success message regardless of email existence (security)

**Reset Password** (`/reset-password?token=xxx`):
- New password + confirm
- Token validation
- Redirect to login on success

**Verify Email** (`/verify-email?token=xxx`):
- Auto-verify on page load
- Success/error states

### Step 2.4: Auth Layout
File: `src/app/(auth)/layout.tsx`
- Centered card design
- App logo at top
- Minimal, clean layout
- No sidebar/nav

### Step 2.5: Middleware
File: `src/middleware.ts`
- Protect `/dashboard/*` routes -- redirect to `/login` if not authenticated
- Protect `/admin/*` routes -- redirect to `/dashboard` if not SUPER_ADMIN
- Redirect `/login` and `/register` to `/dashboard` if already authenticated
- Public routes: `/`, `/pricing`, `/docs`, `/api/webhooks/*`, `/api/health`

### Step 2.6: Validation Schemas
File: `src/lib/validations.ts`
```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
  token: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

---

## 8. PHASE 3 -- MULTI-TENANCY & RBAC

### Step 3.1: Organization Onboarding Flow

After first login, if user has no organizations:
1. Redirect to `/onboarding`
2. Show "Create your workspace" form
3. Fields: Organization name, slug (auto-generated, editable)
4. On submit: create org, create membership with OWNER role
5. Redirect to `/dashboard`

### Step 3.2: Organization Actions
File: `src/modules/organizations/actions.ts`

```typescript
// createOrganization(name, slug) -- create org + owner membership
// updateOrganization(orgId, data) -- update name, logo, slug
// deleteOrganization(orgId) -- only OWNER can delete, Stripe cleanup
// switchOrganization(orgId) -- update active org in session/cookie
```

### Step 3.3: Organization Queries
File: `src/modules/organizations/queries.ts`

```typescript
// getUserOrganizations(userId) -- all orgs user belongs to
// getOrganization(orgId) -- single org with member count
// getOrganizationBySlug(slug) -- lookup by slug
// getOrganizationMembers(orgId) -- all members with user data
```

### Step 3.4: RBAC Permission System
File: `src/modules/members/permissions.ts`

```typescript
type Permission =
  | "org:update"
  | "org:delete"
  | "members:invite"
  | "members:remove"
  | "members:changeRole"
  | "billing:manage"
  | "apiKeys:create"
  | "apiKeys:delete"
  | "auditLog:view";

const rolePermissions: Record<MemberRole, Permission[]> = {
  OWNER: [
    "org:update", "org:delete",
    "members:invite", "members:remove", "members:changeRole",
    "billing:manage",
    "apiKeys:create", "apiKeys:delete",
    "auditLog:view",
  ],
  ADMIN: [
    "org:update",
    "members:invite", "members:remove",
    "apiKeys:create", "apiKeys:delete",
    "auditLog:view",
  ],
  MEMBER: [],
};

export function hasPermission(role: MemberRole, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}
```

### Step 3.5: Team Member Management
File: `src/modules/members/actions.ts`

```typescript
// inviteMember(orgId, email, role) -- create invitation, send email
// acceptInvitation(token) -- validate token, create membership
// removeMember(orgId, userId) -- remove from org (can't remove OWNER)
// changeRole(orgId, userId, newRole) -- change member role (only OWNER/ADMIN)
// revokeInvitation(invitationId) -- cancel pending invite
// resendInvitation(invitationId) -- resend invite email
```

### Step 3.6: Organization Switcher Component
- Dropdown in sidebar header
- Shows current org name + logo
- Lists all user's organizations
- "Create new organization" option at bottom
- Stores active org ID in cookie for server components

### Step 3.7: Members Settings Page
Route: `/settings/members`
- Table of current members (name, email, role, joined date)
- Role change dropdown (OWNER/ADMIN only)
- Remove member button with confirmation
- Pending invitations section
- "Invite member" button -> dialog with email + role picker

---

## 9. PHASE 4 -- STRIPE BILLING

### Step 4.1: Plan Definitions
File: `src/modules/billing/plans.ts`

```typescript
export const plans = {
  FREE: {
    name: "Free",
    description: "For individuals getting started",
    price: 0,
    stripePriceId: null,
    features: [
      "1 organization",
      "Up to 3 team members",
      "Basic analytics",
      "Community support",
    ],
    limits: {
      maxMembers: 3,
      maxApiKeys: 1,
    },
  },
  PRO: {
    name: "Pro",
    description: "For growing teams",
    price: 2900, // $29/month in cents
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "Unlimited organizations",
      "Up to 20 team members",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "API access",
    ],
    limits: {
      maxMembers: 20,
      maxApiKeys: 10,
    },
  },
  ENTERPRISE: {
    name: "Enterprise",
    description: "For large organizations",
    price: 9900, // $99/month in cents
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "SSO/SAML (coming soon)",
      "Audit logs",
      "Dedicated support",
      "SLA guarantee",
      "Unlimited API keys",
    ],
    limits: {
      maxMembers: Infinity,
      maxApiKeys: Infinity,
    },
  },
} as const;
```

### Step 4.2: Stripe Client
File: `src/modules/billing/stripe.ts`

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Pin to the latest stable version at project init time.
  // Check https://stripe.com/docs/upgrades for newer versions.
  apiVersion: "2025-06-30.basil",
  typescript: true,
});
```

### Step 4.3: Billing Server Actions
File: `src/modules/billing/actions.ts`

```typescript
// createCheckoutSession(orgId, priceId)
//   - Create or retrieve Stripe customer
//   - Create checkout session with success/cancel URLs
//   - Return session URL for redirect
//
// createBillingPortalSession(orgId)
//   - Create Stripe billing portal session
//   - User can manage subscription, update payment method, view invoices
//   - Return portal URL for redirect
//
// cancelSubscription(orgId)
//   - Cancel at period end (not immediate)
//   - Update local subscription status
//
// resumeSubscription(orgId)
//   - Remove cancel_at_period_end
//   - Update local status back to ACTIVE
```

### Step 4.4: Stripe Webhook Handler
File: `src/app/api/webhooks/stripe/route.ts`

Handle these events:
```typescript
// checkout.session.completed
//   -> Create/update subscription in DB
//   -> Update org plan and stripeCustomerId
//   -> Log audit event
//
// customer.subscription.updated
//   -> Sync subscription status (active, past_due, etc.)
//   -> Update org plan if price changed
//
// customer.subscription.deleted
//   -> Set org plan to FREE
//   -> Set subscription status to CANCELED
//
// invoice.payment_succeeded
//   -> Log successful payment
//
// invoice.payment_failed
//   -> Set status to PAST_DUE
//   -> Send email notification to org OWNER
```

**Webhook security:**
- Verify Stripe signature with `stripe.webhooks.constructEvent()`
- Idempotency: check if event already processed (store event ID)
- Return 200 immediately, process async where possible

### Step 4.5: Billing Page
Route: `/billing`

Sections:
1. **Current Plan** -- plan name, status badge, renewal date
2. **Plan Selection** -- pricing cards for all plans, highlight current
3. **Usage** -- member count vs limit, API key count vs limit
4. **Payment Method** -- last 4 digits, expiry, "Manage" link to Stripe portal
5. **Invoice History** -- table of past invoices with download links
6. **Cancel Subscription** -- cancel button with confirmation dialog

### Step 4.6: Pricing Page (Public)
Route: `/pricing`
- Three pricing cards (Free, Pro, Enterprise)
- Feature comparison list
- "Get Started" / "Subscribe" CTAs
- Monthly/annual toggle (stretch goal)
- FAQ section below

### Step 4.7: Plan Limit Enforcement
File: `src/modules/billing/limits.ts`

```typescript
// checkMemberLimit(orgId) -- throw if at max members for plan
// checkApiKeyLimit(orgId) -- throw if at max API keys for plan
// enforceFeatureAccess(orgId, feature) -- check if plan includes feature
```

Call these in relevant server actions before creating resources.

---

## 10. PHASE 5 -- EMAIL SYSTEM

### Step 5.1: Email Setup
File: `src/modules/notifications/send.ts`

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    react,
  });
}
```

### Step 5.2: Email Templates (React Email)
Location: `emails/`

Templates to build:
1. **Welcome** -- after registration
2. **Verify Email** -- email verification link
3. **Reset Password** -- password reset link
4. **Invite Member** -- team invite with accept link
5. **Invoice Paid** -- payment confirmation
6. **Subscription Reminder** -- trial ending soon, payment failed

Each template:
- Clean, minimal design
- Responsive (mobile email clients)
- App logo at top
- Clear CTA button
- Footer with unsubscribe/app link

### Step 5.3: Email Preview Server
```bash
npx email dev
```
Add to package.json scripts: `"email:dev": "email dev"`

---

## 11. PHASE 6 -- DASHBOARD & ANALYTICS

### Step 6.1: Dashboard Home Page
Route: `/(dashboard)/page.tsx`

Layout:
```
┌──────────────────────────────────────────────┐
│ Welcome back, Taha                           │
│                                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ │ Members  │ │ API Keys │ │ Plan     │      │
│ │    5     │ │    3     │ │   Pro    │      │
│ └──────────┘ └──────────┘ └──────────┘      │
│                                              │
│ ┌─────────────────────┐ ┌──────────────────┐│
│ │   Recent Activity   │ │  Quick Actions   ││
│ │                     │ │                  ││
│ │ • John joined team  │ │ [Invite Member]  ││
│ │ • Plan upgraded     │ │ [Create API Key] ││
│ │ • API key created   │ │ [View Billing]   ││
│ └─────────────────────┘ └──────────────────┘│
└──────────────────────────────────────────────┘
```

### Step 6.2: Stats Cards Component
File: `src/components/dashboard/stats-cards.tsx`
- Total members
- Active API keys
- Current plan
- Days until renewal / trial end

### Step 6.3: Recent Activity Feed
File: `src/components/dashboard/recent-activity.tsx`
- Pull from audit logs
- Show last 10 activities
- Icon + description + relative time
- "View all" link to `/activity`

### Step 6.4: Activity / Audit Log Page
Route: `/activity`
- Full audit log table
- Columns: Action, User, Details, Timestamp
- Filter by action type
- Cursor-based pagination
- Date range filter

---

## 12. PHASE 7 -- SETTINGS & PROFILE

### Step 7.1: Settings Layout
Route: `/settings`
- Sidebar navigation within settings:
  - General (org name, slug, logo)
  - Members (team management -- Phase 3)
  - Profile (personal settings)
  - API Keys
- Active tab indicator

### Step 7.2: General Settings
Route: `/settings` (default)
- Organization name (editable)
- Organization slug (editable, unique validation)
- Logo upload (save as base64 or use a simple URL input)
- Danger zone: Delete organization (OWNER only, confirmation dialog)

### Step 7.3: Profile Settings
Route: `/settings/profile`
- Name (editable)
- Email (display only or editable with re-verification)
- Avatar (URL input or upload)
- Change password (current + new + confirm)
- Connected accounts (Google, GitHub -- show linked status)
- Delete account (confirmation, transfer ownership first)

### Step 7.4: API Keys Page
Route: `/settings/api-keys`
- Table of existing keys (name, last 4 chars, created, last used, expires)
- "Create API Key" button -> dialog
  - Name input
  - Expiration picker (30d, 90d, 1y, never)
  - On create: show full key ONCE, then it's hashed
- Revoke button with confirmation
- Usage note: keys are hashed in DB, shown only at creation

---

## 13. PHASE 8 -- SUPER ADMIN PANEL

### Step 8.1: Admin Layout
Route: `/admin/layout.tsx`
- Separate layout from dashboard
- Admin-specific sidebar
- Only accessible to SUPER_ADMIN role

### Step 8.2: Admin Dashboard
Route: `/admin`
- Total users count
- Total organizations count
- Revenue metrics (from Stripe)
- Recent signups chart
- System health status

### Step 8.3: Organizations Management
Route: `/admin/organizations`
- Table of all organizations
- Columns: Name, Plan, Members, Created, Status
- Search by name/slug
- Click to view details
- Impersonate: "Login as" button (sets a session override, shows banner)

### Step 8.4: Users Management
Route: `/admin/users`
- Table of all users
- Columns: Name, Email, Role, Orgs, Created
- Search by name/email
- Change global role (USER <-> SUPER_ADMIN)
- View user's organizations

---

## 14. PHASE 9 -- API KEYS & AUDIT LOGS

### Step 9.1: API Key Generation
File: `src/modules/organizations/api-keys.ts`

```typescript
import crypto from "crypto";

// Generate a prefixed API key: sk_live_xxxxxxxxxxxx
// Returns the raw key (show once to user), the hash (store in DB), and last 4 chars (for display)
export function generateApiKey(): { key: string; hashedKey: string; lastFour: string } {
  const key = `sk_live_${crypto.randomBytes(24).toString("base64url")}`;
  const hashedKey = crypto
    .createHash("sha256")
    .update(key)
    .digest("hex");
  const lastFour = key.slice(-4);
  return { key, hashedKey, lastFour };
}

// Validate an API key from request header
export async function validateApiKey(key: string) {
  const hashedKey = crypto
    .createHash("sha256")
    .update(key)
    .digest("hex");

  const apiKey = await db.apiKey.findUnique({
    where: { hashedKey },
    include: { organization: true },
  });

  if (!apiKey) return null;
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

  // Update last used timestamp (fire and forget)
  db.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  return apiKey;
}
```

### Step 9.2: Audit Logging Utility
File: `src/modules/audit/log.ts`

```typescript
export async function createAuditLog({
  action,
  entityType,
  entityId,
  metadata,
  organizationId,
  userId,
  request,
}: {
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  organizationId: string;
  userId?: string;
  request?: Request;
}) {
  return db.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      metadata: metadata ?? undefined,
      organizationId,
      userId,
      ipAddress: request?.headers.get("x-forwarded-for") ?? null,
      userAgent: request?.headers.get("user-agent") ?? null,
    },
  });
}
```

Actions to log:
- `member.invited`, `member.joined`, `member.removed`, `member.role_changed`
- `organization.created`, `organization.updated`, `organization.deleted`
- `subscription.created`, `subscription.updated`, `subscription.canceled`
- `api_key.created`, `api_key.revoked`
- `auth.login`, `auth.password_changed`

---

## 15. PHASE 10 -- BACKGROUND JOBS

### Step 10.1: Inngest Setup
```bash
npm install inngest
```

File: `src/lib/inngest.ts`
```typescript
import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "shipkit" });
```

### Step 10.2: Job Definitions

**Send Email Job:**
```typescript
export const sendEmailJob = inngest.createFunction(
  { id: "send-email" },
  { event: "email/send" },
  async ({ event }) => {
    // Send via Resend
    // Retry on failure (Inngest handles this)
  },
);
```

**Stripe Webhook Processing:**
```typescript
export const processStripeWebhook = inngest.createFunction(
  { id: "process-stripe-webhook" },
  { event: "stripe/webhook.received" },
  async ({ event }) => {
    // Process the webhook event
    // Update DB
    // Send notifications
  },
);
```

**Invitation Cleanup:**
```typescript
export const cleanupExpiredInvitations = inngest.createFunction(
  { id: "cleanup-invitations" },
  { cron: "0 0 * * *" }, // Daily at midnight
  async () => {
    // Mark expired invitations
    // Optionally notify inviters
  },
);
```

**Trial Ending Reminder:**
```typescript
export const trialEndingReminder = inngest.createFunction(
  { id: "trial-ending-reminder" },
  { cron: "0 9 * * *" }, // Daily at 9 AM
  async () => {
    // Find orgs with trial ending in 3 days
    // Send reminder emails to owners
  },
);
```

### Step 10.3: Inngest Route Handler
File: `src/app/api/inngest/route.ts`
```typescript
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { sendEmailJob, processStripeWebhook, cleanupExpiredInvitations, trialEndingReminder } from "@/modules/notifications/jobs";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendEmailJob, processStripeWebhook, cleanupExpiredInvitations, trialEndingReminder],
});
```

---

## 16. PHASE 11 -- SCALABILITY & CACHING

### Step 11.1: Redis Setup
File: `src/lib/redis.ts`

```typescript
import { Redis } from "@upstash/redis";

// For local dev: use ioredis with local Redis
// For production: use @upstash/redis
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

### Step 11.2: Rate Limiting
File: `src/lib/rate-limit.ts`

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// General API rate limit
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1m"), // 100 requests per minute
  analytics: true,
});

// Auth rate limit (stricter)
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1m"), // 5 attempts per minute
  analytics: true,
});
```

Apply in:
- Login/register actions (authRateLimit)
- API routes (apiRateLimit, keyed by API key or IP)
- Webhook endpoint (by IP)

### Step 11.3: Caching Strategy

**Organization data caching:**
```typescript
// Cache org data for 5 minutes
// Invalidate on org update
// Key: `org:${orgId}`
```

**Session permission caching:**
```typescript
// Cache user's role/permissions per org for 5 minutes
// Invalidate on role change
// Key: `perms:${userId}:${orgId}`
```

**Use Next.js `"use cache"` directive for server components (Next.js 15+):**
```typescript
import { cacheLife, cacheTag } from "next/cache";

export async function getCachedOrganization(orgId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(`organization-${orgId}`);
  return db.organization.findUnique({ where: { id: orgId } });
}
```

### Step 11.4: Cursor-Based Pagination
File: `src/lib/pagination.ts`

```typescript
export async function paginateWithCursor<T>({
  model,
  where,
  orderBy,
  cursor,
  take = 20,
}: {
  model: any;
  where?: any;
  orderBy?: any;
  cursor?: string;
  take?: number;
}) {
  const items = await model.findMany({
    where,
    orderBy: orderBy ?? { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = items.length > take;
  if (hasMore) items.pop();

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  };
}
```

### Step 11.5: Health Check Endpoint
File: `src/app/api/health/route.ts`

```typescript
export async function GET() {
  const checks = {
    database: false,
    redis: false,
  };

  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {}

  try {
    await redis.ping();
    checks.redis = true;
  } catch {}

  const healthy = Object.values(checks).every(Boolean);

  return Response.json(
    { status: healthy ? "healthy" : "degraded", checks },
    { status: healthy ? 200 : 503 },
  );
}
```

---

## 17. PHASE 12 -- TESTING

### Step 12.1: Vitest Setup
File: `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Step 12.2: Unit Tests to Write

**`tests/unit/permissions.test.ts`:**
- Test each role has correct permissions
- Test OWNER has all permissions
- Test MEMBER has no admin permissions
- Test permission check function

**`tests/unit/billing.test.ts`:**
- Test plan limit checks
- Test plan feature access
- Test price formatting

**`tests/unit/utils.test.ts`:**
- Test slug generation
- Test currency formatting
- Test URL helpers

### Step 12.3: Integration Tests

**`tests/integration/auth.test.ts`:**
- Test registration flow
- Test login with correct/incorrect credentials
- Test password reset flow
- Test email verification

**`tests/integration/organizations.test.ts`:**
- Test org creation
- Test invite flow
- Test role changes
- Test member removal

**`tests/integration/stripe-webhooks.test.ts`:**
- Test checkout.session.completed handling
- Test subscription.updated handling
- Test subscription.deleted handling
- Test idempotency (duplicate event)

### Step 12.4: E2E Tests (Playwright)
File: `playwright.config.ts`

**`tests/e2e/auth.spec.ts`:**
- Register new account
- Login with credentials
- Logout

**`tests/e2e/onboarding.spec.ts`:**
- Create first organization
- Verify redirect to dashboard

**`tests/e2e/billing.spec.ts`:**
- View pricing page
- Navigate to billing settings

### Step 12.5: Test Scripts
```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

---

## 18. PHASE 13 -- DOCKER & CI/CD

### Step 13.1: Production Dockerfile
File: `Dockerfile`

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

### Step 13.2: GitHub Actions CI
File: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: shipkit_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    env:
      DATABASE_URL: postgresql://test:test@localhost:5432/shipkit_test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm test

  build:
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npx prisma generate
      - run: npm run build
```

### Step 13.3: Pre-commit Hooks
```bash
npx husky init
```

`.husky/pre-commit`:
```bash
npx lint-staged
```

`package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## 19. PHASE 14 -- DOCUMENTATION & README

### Step 14.1: README Structure

```markdown
# ShipKit

> Production-ready SaaS starter kit with auth, billing, teams, and more.
> Built with Next.js 15, PostgreSQL, Prisma, and Stripe.

[Screenshot/Demo GIF]

## Features
- Authentication (email/password + OAuth)
- Multi-tenancy (organizations & workspaces)
- Role-based access control (RBAC)
- Stripe billing (subscriptions, plans, invoices)
- Team management (invites, roles)
- API key management
- Audit logging
- Email system (React Email + Resend)
- Background jobs (Inngest)
- Rate limiting (Redis)
- Dark/light mode
- Responsive design
- Docker support
- CI/CD with GitHub Actions
- Full test suite

## Tech Stack
[Table from Section 2]

## Quick Start
[Commands from Section 4]

## Architecture
[Diagram showing request flow]

## Project Structure
[Simplified tree]

## Environment Variables
[Table of all variables with descriptions]

## Deployment
[Vercel, Docker, Railway instructions]

## Contributing
[Contribution guidelines]

## License
MIT
```

### Step 14.2: Architecture Diagram
Create a Mermaid diagram in README showing:
- Client -> Next.js -> PostgreSQL
- Stripe webhooks -> API -> Background Jobs
- Redis caching layer
- Email service flow

### Step 14.3: Database ERD
Generate with Prisma or create manually:
- Show all tables and relationships
- Include in README or as separate doc

---

## 20. PHASE 15 -- LANDING PAGE

### Step 15.1: Marketing Layout
Route: `/(marketing)/layout.tsx`
- Sticky navbar with logo, nav links, "Login" / "Get Started" buttons
- Footer with links, social, copyright

### Step 15.2: Landing Page
Route: `/(marketing)/page.tsx`

Sections:
1. **Hero** -- headline, subheadline, CTA buttons, screenshot
2. **Features Grid** -- 6 feature cards with icons
3. **How It Works** -- 3-step process
4. **Tech Stack** -- logos/icons of technologies used
5. **Pricing** -- 3 plan cards (reuse from /pricing)
6. **Open Source CTA** -- GitHub stars, contribute link
7. **Footer**

### Step 15.3: Pricing Page
Route: `/(marketing)/pricing`
- Same pricing cards component
- Feature comparison table below
- FAQ accordion

---

## 21. DEPLOYMENT GUIDE

### Option A: Vercel (Recommended for demo)
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

Database: Use Neon (free PostgreSQL) or Supabase
Redis: Use Upstash (free tier)

### Option B: Docker (Self-hosted)
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Option C: Railway
1. Connect GitHub repo
2. Add PostgreSQL + Redis plugins
3. Deploy

---

## 22. DESIGN SYSTEM & UI GUIDELINES

### Color Palette
- Use shadcn/ui default theme (neutral grays)
- Accent color: Blue (configurable via CSS variables)
- Status colors: green (success), red (error), yellow (warning), blue (info)

### Typography
- Font: Inter (via next/font/google)
- Headings: font-bold, tracking-tight
- Body: text-sm for dense UI, text-base for content

### Component Patterns
- Use shadcn/ui components as base
- Consistent spacing: p-4 for cards, gap-4 for grids
- Border radius: rounded-lg (default shadcn)
- Shadows: shadow-sm for cards, shadow-lg for modals

### Responsive Breakpoints
- Mobile first approach
- Sidebar collapses to sheet on mobile
- Tables become card lists on mobile
- Forms stack vertically on mobile

### Dark Mode
- Use next-themes for toggle
- All colors via CSS variables (shadcn handles this)
- Test both modes for every component

---

## 23. API ROUTE REFERENCE

### Public API Routes
```
GET  /api/health                    # Health check
POST /api/webhooks/stripe           # Stripe webhooks
POST /api/inngest                   # Inngest job handler
```

### Auth Routes (NextAuth)
```
GET/POST /api/auth/[...nextauth]    # All auth routes
```

### Server Actions (not API routes)
All mutations use Next.js Server Actions, NOT API routes.
This is intentional -- server actions provide:
- Automatic CSRF protection
- Type safety end-to-end
- Progressive enhancement
- No manual fetch() calls

---

## 24. IMPLEMENTATION NOTES & CONVENTIONS

### File Naming
- Components: PascalCase (`DataTable.tsx`) -- exception: shadcn components use kebab-case
- Utilities: camelCase (`formatCurrency.ts`)
- Route files: lowercase (`page.tsx`, `layout.tsx`, `route.ts`)
- Types: PascalCase with `.types.ts` or in `types.ts`

### Import Order
1. React/Next.js imports
2. Third-party libraries
3. Internal modules (`@/modules/...`)
4. Components (`@/components/...`)
5. Utilities (`@/lib/...`)
6. Types

### Server vs Client Components
- Default to Server Components (no "use client" directive)
- Use Client Components only when needed: event handlers, hooks, browser APIs
- Keep client components small -- extract server parts out
- Forms: use server actions with `useActionState` hook

### Error Handling
- Server actions: return `{ success: boolean, error?: string }` pattern
- Use Zod for input validation in every server action
- Never expose internal error messages to client
- Log errors server-side with context

### Data Fetching Pattern
- Server Components: fetch data directly with Prisma queries
- Place queries in `modules/[domain]/queries.ts`
- Place mutations in `modules/[domain]/actions.ts`
- Use `unstable_cache` for expensive queries with revalidation

### Security Checklist
- [ ] All server actions validate input with Zod
- [ ] All server actions check authentication
- [ ] All server actions check authorization (RBAC)
- [ ] Passwords hashed with bcrypt (cost 12)
- [ ] API keys hashed with SHA-256
- [ ] CSRF protection via server actions
- [ ] Rate limiting on auth endpoints
- [ ] Stripe webhook signature verification
- [ ] No sensitive data in client components
- [ ] Environment variables not exposed to client (no NEXT_PUBLIC_ for secrets)

---

## IMPLEMENTATION ORDER (RECOMMENDED)

Follow this exact order for the smoothest development experience:

```
Phase 1:  Foundation (project init, Prisma, Docker)         ~ 1 session
Phase 2:  Authentication (NextAuth, login, register)        ~ 2 sessions
Phase 3:  Multi-tenancy & RBAC (orgs, teams, permissions)   ~ 2 sessions
Phase 4:  Stripe Billing (plans, checkout, webhooks)         ~ 2 sessions
Phase 5:  Email System (React Email, templates)              ~ 1 session
Phase 6:  Dashboard & Analytics (stats, activity)            ~ 1 session
Phase 7:  Settings & Profile (org settings, profile, keys)   ~ 1 session
Phase 8:  Super Admin Panel (admin dashboard)                ~ 1 session
Phase 9:  API Keys & Audit Logs (generation, logging)        ~ 1 session
Phase 10: Background Jobs (Inngest setup, jobs)              ~ 1 session
Phase 11: Scalability & Caching (Redis, rate limit)          ~ 1 session
Phase 12: Testing (unit, integration, E2E)                   ~ 2 sessions
Phase 13: Docker & CI/CD (Dockerfile, GitHub Actions)        ~ 1 session
Phase 14: Documentation & README                             ~ 1 session
Phase 15: Landing Page (marketing site)                      ~ 1 session
```

Total: ~25-30 focused sessions (solo, building alongside work)

---

## NOTES FOR CLAUDE CODE

When implementing this plan:
1. Follow the phase order strictly -- each phase builds on the previous
2. After each phase, verify the app runs without errors before moving on
3. Use `npx prisma migrate dev` after any schema changes
4. Test Stripe flows with test mode keys and test card numbers (4242...)
5. Run `npm run lint` and `npm run type-check` frequently
6. Commit after completing each phase with a descriptive message
7. The project structure in Phase 1 is the source of truth for file locations
8. All business logic goes in `src/modules/`, not in page components
9. Page components should be thin -- fetch data, render components
10. Every server action must: validate input (Zod), check auth, check permissions

---

## 25. SECURITY ARCHITECTURE

This section covers every security measure in the project. Security isn't a separate phase --
it's embedded into every phase. But this documents it all in one place.

---

### 25.1: Authentication Security

**Password Hashing:**
- Use `bcryptjs` (pure JS) with cost factor 12 -- works reliably on Vercel serverless
  (native `bcrypt` has cold-start issues on serverless; `@node-rs/argon2` is another option)
- Never store plaintext passwords
- Never log passwords, even in development

**Session Management:**
- NextAuth.js v5 handles session tokens
- JWT strategy with short expiry (1 hour)
- Session rotation on sensitive actions (password change, role change)
- HttpOnly, Secure, SameSite=Lax cookies

**Brute Force Protection:**
- Rate limit login attempts: 5 per minute per IP
- Rate limit registration: 3 per minute per IP
- Rate limit forgot-password: 2 per minute per email
- Exponential backoff messaging (don't reveal exact lockout time)

**OAuth Security:**
- Use PKCE flow for OAuth providers (NextAuth handles this)
- Validate `state` parameter to prevent CSRF
- Link OAuth accounts only when email is verified

**Email Verification:**
- Token: cryptographically random, 64 chars
- Token expiry: 24 hours
- One-time use: delete token after verification
- Don't reveal whether email exists in forgot-password response

**Password Reset:**
- Token: cryptographically random, 64 chars
- Token expiry: 1 hour (short -- intentional)
- One-time use: delete after reset
- Invalidate all existing sessions after password reset

---

### 25.2: Authorization Security (RBAC)

**Server-Side Enforcement:**
```typescript
// EVERY server action follows this pattern:
export async function updateOrganization(orgId: string, data: UpdateOrgInput) {
  // 1. Authenticate
  const session = await requireAuth();

  // 2. Authorize
  const member = await requireOrgRole(orgId, session.user.id, ["OWNER", "ADMIN"]);

  // 3. Validate input
  const validated = updateOrgSchema.parse(data);

  // 4. Execute
  // ...
}
```

**Never trust the client:**
- Don't hide buttons and assume that's security -- check permissions server-side
- UI hides buttons for UX, server actions enforce for security
- Both must agree, but only the server matters

**Tenant Isolation:**
- Every database query that touches org data MUST include `organizationId` in the WHERE clause
- Never rely on just the entity ID -- always scope to the org
- Helper function enforces this:

```typescript
// BAD -- any user could access any org's data by guessing the ID
const member = await db.organizationMember.findUnique({
  where: { id: memberId },
});

// GOOD -- scoped to the requesting user's org
const member = await db.organizationMember.findFirst({
  where: { id: memberId, organizationId: currentOrgId },
});
```

**Super Admin Separation:**
- Super admin routes under `/admin/*` with separate layout
- Middleware checks `GlobalRole.SUPER_ADMIN` before allowing access
- Impersonation shows a visible banner and logs to audit trail
- Impersonation sessions expire after 1 hour

---

### 25.3: API Security

**API Key Security:**
- Keys are hashed with SHA-256 before storage (never stored in plain text)
- Full key shown only ONCE at creation -- cannot be retrieved later
- Keys prefixed with `sk_live_` or `sk_test_` for easy identification
- Keys have optional expiration dates
- Track `lastUsedAt` for monitoring
- Rate limit per API key: 100 requests/minute

**Request Validation:**
- Every input validated with Zod schemas -- no raw `req.body` usage ever
- Reject unknown fields (Zod `strict()` mode)
- Sanitize string inputs (trim whitespace, limit length)
- File uploads: validate MIME type, enforce size limits

**Response Security:**
- Never return full database objects to the client -- use explicit select/pick
- Never expose internal IDs unnecessarily
- Never return error stack traces in production
- Use generic error messages for auth failures ("Invalid credentials" not "User not found")

---

### 25.4: Stripe / Payment Security

**Webhook Verification:**
```typescript
// ALWAYS verify the Stripe signature -- never skip this
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!,
);
```

**Idempotency:**
- Store processed Stripe event IDs in the database
- Check before processing: if already processed, return 200 and skip
- This prevents double-charging, duplicate subscriptions, etc.

```typescript
const existingEvent = await db.processedStripeEvent.findUnique({
  where: { eventId: event.id },
});
if (existingEvent) {
  return new Response("Already processed", { status: 200 });
}
```

**Price Validation:**
- Never trust price amounts from the client
- Always look up the price server-side from your plan definitions
- Stripe checkout session is created server-side with the correct price ID

**Customer Portal:**
- Use Stripe's hosted billing portal for payment method changes
- Don't build your own credit card form -- Stripe handles PCI compliance
- This means you never touch raw card numbers

---

### 25.5: Infrastructure Security

**Environment Variables:**
- `.env` is in `.gitignore` -- never committed
- `.env.example` has placeholder values, not real secrets
- Client-safe vars use `NEXT_PUBLIC_` prefix -- everything else is server-only
- Validate all required env vars at startup (fail fast, not at runtime)

```typescript
// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  RESEND_API_KEY: z.string().startsWith("re_"),
});

export const env = envSchema.parse(process.env);
```

**HTTP Headers (via Next.js config):**
```typescript
// next.config.ts
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; frame-src https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com;",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];
```

**Database Security:**
- Connection via SSL in production
- Connection pooling with PgBouncer (Prisma supports this)
- Database user has minimal required permissions (not superuser)
- No raw SQL queries -- Prisma parameterizes everything (SQL injection proof)

**Docker Security:**
- Run as non-root user in production container
- Multi-stage build (no dev dependencies in production image)
- No secrets in Dockerfile -- use environment variables at runtime
- Pin specific image versions (not `latest`)

---

### 25.6: CSRF & XSS Protection

**CSRF:**
- Next.js Server Actions have built-in CSRF protection (Origin header check)
- No need for manual CSRF tokens when using server actions
- Stripe webhooks verify via signature (not CSRF tokens)

**XSS:**
- React escapes all rendered content by default
- Never use `dangerouslySetInnerHTML`
- Sanitize any user-generated content before storage
- Content-Security-Policy header blocks inline scripts from unknown sources

---

### 25.7: Audit & Monitoring

**What gets logged:**
Every security-relevant action is written to the audit_logs table:
- Login attempts (success and failure)
- Password changes
- Role changes
- Member invitations and removals
- API key creation and revocation
- Subscription changes
- Organization deletion
- Super admin impersonation start/end

**Log structure:**
```typescript
{
  action: "member.role_changed",
  entityType: "OrganizationMember",
  entityId: "member_123",
  metadata: {
    oldRole: "MEMBER",
    newRole: "ADMIN",
    changedBy: "user_456",
  },
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  userId: "user_456",
  organizationId: "org_789",
}
```

**Failed login monitoring:**
- Log all failed login attempts with IP and email
- Alert (via audit log query) if > 10 failures for same email in 1 hour
- This data is visible in the super admin panel

---

### 25.8: Security Checklist (For Each Phase)

```
PHASE 2 (Auth):
  [ ] Passwords hashed with bcrypt cost 12
  [ ] Rate limiting on login/register/forgot-password
  [ ] Email verification tokens are one-time use
  [ ] Password reset tokens expire in 1 hour
  [ ] Generic error messages (don't leak user existence)
  [ ] Sessions invalidated on password change

PHASE 3 (Multi-tenancy):
  [ ] Every query scoped to organizationId
  [ ] RBAC checked server-side in every action
  [ ] Can't remove the last OWNER
  [ ] Invitation tokens are one-time use and expire

PHASE 4 (Stripe):
  [ ] Webhook signature verified
  [ ] Idempotent webhook processing
  [ ] Prices looked up server-side, never from client
  [ ] No raw card data handled (Stripe Checkout/Portal)

PHASE 9 (API Keys):
  [ ] Keys hashed with SHA-256 before storage
  [ ] Full key shown only once at creation
  [ ] Rate limiting per API key
  [ ] Expired keys rejected

PHASE 11 (Infrastructure):
  [ ] Environment variables validated at startup
  [ ] Security headers configured
  [ ] Docker runs as non-root user
  [ ] CSP header configured for Stripe
  [ ] No secrets in git history
```

---

## 26. TOOL-BY-TOOL BREAKDOWN -- What Does What & Why

This section explains every technology in the stack, what problem it solves,
how it fits into the project, and what the alternative would be.

---

### CORE FRAMEWORK

#### Next.js 15 (App Router)
**What it is:** A React framework by Vercel that handles both frontend AND backend.

**What it does in this project:**
- **Server Components** -- React components that run on the server. They can directly query the database, read files, call APIs. The HTML is sent to the browser, not the JavaScript. This means faster page loads and smaller bundle size.
- **Client Components** -- Regular React components (marked with `"use client"`) that run in the browser. Used for interactive things: forms, buttons, dropdowns, modals.
- **Server Actions** -- Functions that run on the server but are called from the client like regular functions. Replace traditional API routes for mutations. Example: `submitForm()` in a button click calls a server function directly.
- **Route Handlers** -- Traditional API endpoints (`/api/webhooks/stripe`). Used when external services need to call us (Stripe webhooks).
- **App Router** -- The file-system routing. A file at `src/app/billing/page.tsx` becomes the `/billing` URL. Folders in parentheses like `(dashboard)` are "route groups" -- they share a layout but don't add to the URL.
- **Middleware** -- Code that runs before every request. We use it to check "is this user logged in?" before they can access `/dashboard/*`.

**Why not Express/Nest.js backend?** Because Next.js does everything. Splitting into a separate backend would mean two deployments, CORS configuration, two CI pipelines, and double the infrastructure -- for zero benefit in a single-team project.

**What you'll learn:** Server Components vs Client Components thinking, server actions, middleware patterns, caching strategies.

---

#### TypeScript 5.x
**What it is:** JavaScript with type checking. You define what shape your data has, and TypeScript catches errors before you run the code.

**What it does in this project:**
- Catches bugs at write time, not runtime ("this function expects a string but you passed a number")
- Provides autocomplete in your editor (you type `user.` and see all available fields)
- Makes refactoring safe (rename a field, TypeScript shows every place that breaks)
- Zod schemas and Prisma types flow end-to-end: database -> server -> client

**Why not plain JavaScript?** No serious project ships without TypeScript in 2026. Every hiring manager expects it. It also prevents entire categories of bugs.

---

### DATABASE

#### PostgreSQL 16
**What it is:** A relational database. Like MongoDB (which you know), but instead of flexible JSON documents, data lives in structured tables with defined columns, types, and relationships.

**What it does in this project:**
- Stores all application data: users, organizations, memberships, subscriptions, audit logs
- **Relations**: a user HAS MANY memberships, an organization HAS MANY members. These relationships are enforced by the database itself -- you can't create a membership pointing to a non-existent organization.
- **Transactions**: when creating an org + adding the owner as a member, either BOTH succeed or BOTH fail. No half-states.
- **Indexes**: make queries fast. Without an index, finding a user by email scans every row. With an index, it's instant.
- **Enums**: `MemberRole` can only be OWNER, ADMIN, or MEMBER. The database rejects anything else.

**Why not MongoDB?** You already know MongoDB -- using it again doesn't teach you anything new. PostgreSQL is what most SaaS companies use (Stripe, GitHub, Shopify, Linear all use Postgres). It's the most requested database skill in job postings. Plus, relational data (users belong to orgs, orgs have plans) maps naturally to relational tables.

**Key difference from MongoDB:** Instead of embedding data in documents, you JOIN tables. Instead of `{ user: { name: "Taha", org: { name: "MyOrg" } } }`, you have a `users` table, an `organizations` table, and an `organization_members` table that links them. This is more normalized and scales better.

---

#### Prisma ORM 6.x
**What it is:** An ORM (Object-Relational Mapper) that lets you interact with PostgreSQL using TypeScript instead of raw SQL.

**What it does in this project:**
- **Schema file** (`prisma/schema.prisma`): you define your database tables in a readable format. Prisma generates the actual SQL tables.
- **Migrations**: when you change the schema, Prisma generates SQL migration files that transform the database. These are version-controlled so any developer can recreate the exact same database.
- **Type-safe queries**: instead of writing `SELECT * FROM users WHERE email = 'x'`, you write:
  ```typescript
  const user = await db.user.findUnique({ where: { email: "x" } });
  // TypeScript knows user has .name, .email, .role etc.
  ```
- **Relations**: fetch related data easily:
  ```typescript
  const org = await db.organization.findUnique({
    where: { id: orgId },
    include: { members: { include: { user: true } } },
  });
  // org.members[0].user.name -- fully typed
  ```
- **Prisma Studio**: a GUI to browse your database (run `npx prisma studio`)

**Why not raw SQL?** Raw SQL is error-prone, not type-safe, and tedious for common operations. Prisma gives you autocompletion and catches errors at compile time.

**Why not Drizzle?** Drizzle is also good, but Prisma has better documentation, a larger community, and a gentler learning curve for someone new to relational databases.

---

#### Redis
**What it is:** An in-memory key-value store. Think of it as a super-fast dictionary that lives in RAM instead of on disk.

**What it does in this project:**
- **Rate limiting**: tracks "how many login attempts has this IP made in the last minute?" Without Redis, you'd have to query PostgreSQL for this, which is slower and adds load to your main database.
- **Caching**: stores frequently accessed data (org settings, user permissions) so you don't hit PostgreSQL on every request. Example: instead of querying the user's role from the DB on every page load, cache it in Redis for 5 minutes.
- **Session data**: fast session lookups without querying PostgreSQL.

**Why not just PostgreSQL for everything?** Redis is ~100x faster for simple reads because data is in memory. Rate limiting needs to be fast -- you're checking it on EVERY request. You don't want that hammering your main database.

**Local vs Production:** Locally, we run Redis in Docker. In production, we use Upstash (a hosted Redis service with a free tier and a REST API that works in serverless environments like Vercel).

---

### AUTHENTICATION

#### NextAuth.js v5 (Auth.js)
**What it is:** The standard authentication library for Next.js. Handles login, registration, sessions, OAuth -- all the auth plumbing.

**What it does in this project:**
- **Credentials login**: email + password authentication. It handles session creation, cookie management, and token rotation.
- **OAuth login**: "Sign in with Google" and "Sign in with GitHub" buttons. NextAuth handles the entire OAuth flow (redirect to Google, get token back, create user, link accounts).
- **Session management**: after login, a session cookie is set. NextAuth provides `auth()` to get the current user in any server component or server action.
- **Prisma Adapter**: NextAuth stores users, sessions, and accounts directly in your PostgreSQL database through Prisma. No separate auth database needed.
- **JWT callbacks**: we customize the token to include the user's active organization and role, so we don't have to query the database for every permission check.

**Why not build auth from scratch?** Auth is the most security-critical part of any app. Getting it wrong means leaked passwords, session hijacking, CSRF attacks. NextAuth is battle-tested by thousands of production apps. It handles edge cases you'd never think of.

**Why not Clerk/Auth0?** Those are paid services and lock you in. NextAuth is open-source, free, and you own the data. For a boilerplate, this matters -- users forking ShipKit shouldn't need a paid auth service.

---

### PAYMENTS

#### Stripe
**What it is:** The industry-standard payment processing platform. Handles credit cards, subscriptions, invoices, and billing portal.

**What it does in this project:**
- **Checkout Sessions**: when a user selects a plan, we create a Stripe Checkout Session. Stripe hosts the actual payment page -- we never touch credit card numbers (this handles PCI compliance for us).
- **Subscriptions**: recurring monthly billing. Stripe handles charging the card each month, retrying failed payments, and managing trial periods.
- **Customer Portal**: a Stripe-hosted page where users can update their payment method, view invoices, or cancel. We just redirect them there.
- **Webhooks**: Stripe sends events to our server when things happen (payment succeeded, subscription canceled, invoice created). We listen at `/api/webhooks/stripe` and update our database accordingly.
- **Test Mode**: Stripe has a complete test environment. Use test API keys and card number `4242 4242 4242 4242` to simulate payments. No real money involved.

**Key Stripe concepts:**
| Concept | What it is |
|---|---|
| Customer | A Stripe record linked to our Organization |
| Price | A recurring charge ($29/month for Pro plan) |
| Subscription | A customer subscribed to a price |
| Checkout Session | A temporary payment page |
| Billing Portal | Customer self-service page |
| Webhook | Stripe calling our server with events |

**Why not PayPal/Razorpay?** Stripe is what 90% of SaaS companies use. It's the most requested payment skill in job postings. The developer experience is the best in the industry.

---

### UI

#### Tailwind CSS 4.x
**What it is:** A utility-first CSS framework. Instead of writing CSS in separate files, you apply small utility classes directly on HTML elements.

**What it does in this project:**
```html
<!-- Instead of writing a .card class with 8 CSS properties: -->
<div class="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-900">

<!-- Instead of media queries in a CSS file: -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```
- Responsive design (mobile-first, then `md:`, `lg:` breakpoints)
- Dark mode (prefix with `dark:`)
- No CSS file bloat -- only used classes end up in the final bundle
- Consistent spacing, colors, and sizes from the design system

**Why not plain CSS/SCSS?** Faster development, enforced consistency, no naming debates, tiny production CSS bundle. You already know Tailwind from your resume.

---

#### shadcn/ui
**What it is:** NOT a component library you install. It's a collection of beautifully designed components that you copy into your project. You own the code -- you can modify anything.

**What it does in this project:**
- Provides pre-built components: Button, Input, Dialog, Table, Card, Dropdown Menu, Tabs, etc.
- Each component uses Tailwind CSS and Radix UI (accessible primitives)
- You add components individually: `npx shadcn@latest add button` copies a button component into `src/components/ui/button.tsx`
- You can then customize the component's code directly -- it's YOUR file

**Why not Material UI / Ant Design / Chakra?** Those are heavy libraries that ship their own styling system. shadcn/ui uses Tailwind (which we already have), generates small components, and gives you full control. It's also what the Next.js community has standardized on.

---

#### Recharts
**What it is:** A React charting library for data visualization.

**What it does in this project:**
- Dashboard revenue/activity charts
- Line charts, bar charts, area charts
- Responsive and works with dark mode

**Why not Chart.js/D3?** Recharts is built specifically for React with a component-based API. D3 is too low-level for our needs. Chart.js needs canvas which doesn't SSR well.

---

### EMAIL

#### React Email
**What it is:** A library for building email templates using React components instead of raw HTML tables.

**What it does in this project:**
- Build email templates as React components (just like building a page)
- Templates for: welcome, verify email, reset password, invite member, payment confirmation
- Preview server: run `npx email dev` and see your emails in a browser before sending
- Outputs compatible HTML that works in Gmail, Outlook, Apple Mail, etc.

**Why not raw HTML emails?** Email HTML is stuck in the 1990s -- you have to use `<table>` layouts, inline styles, and test across dozens of email clients. React Email abstracts all of that.

---

#### Resend
**What it is:** An email sending API. You give it an email, it delivers it.

**What it does in this project:**
- Actually sends the emails that React Email builds
- API call: `resend.emails.send({ to, subject, react: <WelcomeEmail /> })`
- Free tier: 100 emails/day (plenty for development and early users)
- Good deliverability (emails don't end up in spam)

**Why not SendGrid/Mailgun?** Resend was built by the same people who built React Email. They integrate perfectly together. The API is simpler and the free tier is generous.

---

### BACKGROUND JOBS

#### Inngest
**What it is:** A background job/workflow engine. Lets you run code outside of the HTTP request cycle.

**What it does in this project:**
- **Email sending**: when a user registers, we don't send the email in the same request (that adds 1-2 seconds of latency). Instead, we fire an event and Inngest sends the email in the background.
- **Stripe webhook processing**: acknowledge the webhook immediately (200 response), then process it in the background. This prevents Stripe from timing out.
- **Scheduled jobs**: run daily tasks like cleaning up expired invitations or sending trial-ending reminders.
- **Automatic retries**: if an email fails to send, Inngest retries it 3 times with exponential backoff. You don't write any retry logic.

**Why not BullMQ?** BullMQ requires you to run a separate worker process and manage Redis queues yourself. Inngest is serverless-friendly (works on Vercel), has a dashboard UI, and handles retries/scheduling out of the box. Less infrastructure to manage.

**Why not just do everything in the request?** If sending an email takes 2 seconds and you do it in the request, every registration takes 2+ seconds. Move it to a background job and registration is instant. This is how production apps work.

---

### VALIDATION

#### Zod
**What it is:** A TypeScript-first schema validation library. Define the shape of your data, and Zod validates it at runtime.

**What it does in this project:**
```typescript
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Too short"),
});

// In a server action:
const result = loginSchema.safeParse(formData);
if (!result.success) {
  return { error: result.error.flatten() };
}
// result.data is now typed AND validated
```
- Validates every form submission and API input
- Returns user-friendly error messages
- TypeScript types are inferred from the schema (write once, get both validation AND types)
- Validates environment variables at startup

**Why not Yup/Joi?** Zod is TypeScript-native -- it infers types from schemas. Yup and Joi require separate type definitions. Zod is also smaller and faster.

---

### UTILITIES

#### date-fns
**What it is:** A lightweight date utility library. Like Moment.js but tree-shakeable (you only import what you use).

**What it does in this project:**
- `formatDistanceToNow(date)` -> "3 hours ago" (for activity feeds)
- `format(date, "MMM d, yyyy")` -> "Aug 17, 2026" (for invoice dates)
- `addDays(date, 14)` -> trial end date calculation

---

#### lucide-react
**What it is:** A beautifully consistent icon library with 1000+ icons as React components.

**What it does in this project:**
- Sidebar navigation icons
- Button icons (Plus, Trash, Settings, etc.)
- Status indicators
- Every shadcn/ui example uses Lucide, so they integrate perfectly

---

#### nuqs
**What it is:** Type-safe URL search parameter state management for Next.js.

**What it does in this project:**
- Table filters stored in the URL: `/members?role=ADMIN&page=2`
- User can bookmark/share filtered views
- Browser back button works with filters
- Better than React state for filters because the state survives page refresh

---

#### sonner
**What it is:** A toast notification library. Shows small popup messages at the bottom of the screen.

**What it does in this project:**
- Success messages: "Member invited successfully"
- Error messages: "Failed to update organization"
- These are temporary notifications that auto-dismiss after a few seconds

---

#### cmdk
**What it is:** A command palette component (like the Cmd+K / Ctrl+K menu in VS Code, GitHub, Linear).

**What it does in this project:**
- Press Cmd+K anywhere in the dashboard
- Search for: pages (Settings, Billing), actions (Invite Member, Create API Key), members
- Navigate instantly without clicking through menus
- This is a "wow factor" feature that shows attention to UX detail

---

#### next-themes
**What it is:** A theme management library for Next.js. Handles dark mode / light mode toggle.

**What it does in this project:**
- Toggle between light, dark, and system themes
- Persists preference in localStorage
- No flash of wrong theme on page load (handles SSR correctly)
- All shadcn/ui components already support dark mode via Tailwind's `dark:` classes

---

### DEVELOPMENT TOOLS

#### Docker & Docker Compose
**What it is:** Containerization. Packages software into standardized units that run the same everywhere.

**What it does in this project:**
- `docker compose up -d` starts PostgreSQL + Redis locally with one command
- No need to install PostgreSQL or Redis on your machine
- Every developer gets the exact same database version and config
- Production Dockerfile creates a minimal container for deployment

**You already know Docker** from your resume -- this is straightforward.

---

#### Vitest
**What it is:** A fast test runner built for modern JavaScript/TypeScript projects.

**What it does in this project:**
- Unit tests: test individual functions (permissions, billing limits, utilities)
- Integration tests: test server actions with a real test database
- `vitest --watch` reruns tests as you save files
- Compatible with Jest API (same `describe`, `it`, `expect` syntax)

**Why not Jest?** Vitest is 10-20x faster, understands TypeScript natively (no `ts-jest` config), and works with Vite/Next.js out of the box.

---

#### Playwright
**What it is:** A browser automation framework for end-to-end testing.

**What it does in this project:**
- Opens a real browser and interacts with your app like a user would
- Tests: "go to /register, fill in the form, click submit, verify redirect to /onboarding"
- Tests across Chrome, Firefox, Safari
- Catches bugs that unit tests miss (broken layouts, missing buttons, navigation issues)

---

#### ESLint + Prettier
**What they are:** Code quality tools.
- **ESLint**: finds problematic code patterns (unused variables, missing dependencies in hooks, etc.)
- **Prettier**: formats code consistently (indentation, quotes, semicolons)

**What they do in this project:**
- ESLint catches bugs and enforces Next.js best practices
- Prettier ensures every file has consistent formatting
- Combined with Husky (pre-commit hooks), they run automatically before every commit
- CI pipeline also runs them -- broken code doesn't get merged

---

#### Husky + lint-staged
**What they are:** Git hook tools.
- **Husky**: runs scripts before git commit
- **lint-staged**: only runs linters on the files you're committing (not the whole project)

**What they do in this project:**
- Before every commit: ESLint checks your changed files, Prettier formats them
- If lint fails, the commit is blocked -- forces you to fix issues immediately
- Keeps the entire codebase clean without manual effort

---

#### GitHub Actions
**What it is:** CI/CD (Continuous Integration / Continuous Deployment) built into GitHub.

**What it does in this project:**
- On every pull request: runs lint, type-check, and tests automatically
- If any step fails, the PR shows a red X -- can't merge broken code
- On merge to main: builds the project and can auto-deploy
- Free for public repositories

---

### HOW EVERYTHING CONNECTS (Request Flow)

```
User clicks "Invite Member" button
  │
  ├─ Client Component calls inviteMember() server action
  │
  ├─ Server Action:
  │   ├─ 1. Rate limiter checks Redis (too many requests?)
  │   ├─ 2. NextAuth checks session (logged in?)
  │   ├─ 3. RBAC checks permission (is user OWNER or ADMIN?)
  │   ├─ 4. Zod validates input (valid email? valid role?)
  │   ├─ 5. Prisma creates Invitation in PostgreSQL
  │   ├─ 6. Inngest fires "email/send" event (background)
  │   ├─ 7. Audit log created in PostgreSQL
  │   └─ 8. Returns { success: true } to client
  │
  ├─ Inngest (background):
  │   ├─ Picks up "email/send" event
  │   ├─ React Email renders the invite template
  │   └─ Resend delivers the email
  │
  └─ Client shows toast: "Invitation sent!"
```

This flow demonstrates 10 different technologies working together
in a single user action. That's what makes the project impressive.
