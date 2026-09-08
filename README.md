# ShipKit

Production-ready SaaS starter kit built with Next.js, Prisma, and Stripe.

## Features

- **Authentication** — NextAuth v5 with credentials + Google/GitHub OAuth, email verification, password reset
- **Multi-Tenancy** — Organization-based with team roles (Owner, Admin, Member), org switcher, invitations
- **RBAC** — Granular permissions (11 actions) enforced across API routes and UI
- **Billing** — Stripe integration with Free/Pro/Enterprise plans, checkout, webhooks, customer portal, trial support
- **Email** — Resend + React Email templates (welcome, verification, reset, invitation, notification, subscription reminder)
- **Dashboard** — Stats cards, activity feed, audit logging
- **File Uploads** — Uploadthing with per-plan storage limits, avatars, org logos, drag-and-drop
- **Notifications** — In-app + email with per-type preferences, bell popover, cursor-paginated list
- **Admin Panel** — Super Admin dashboard with user/org management, audit log, impersonation, ban/delete
- **Background Jobs** — Inngest for async emails, cron cleanup, trial reminders (with graceful fallback)
- **Rate Limiting** — Upstash Redis with sliding window presets, in-memory fallback
- **Testing** — Vitest with 102 unit tests across 5 suites
- **Docker** — Multi-stage Dockerfile with standalone output
- **CI/CD** — GitHub Actions (lint, typecheck, test, build), Husky pre-commit with lint-staged

## Tech Stack

| Layer              | Technology                 |
| ------------------ | -------------------------- |
| Framework          | Next.js 16 (App Router)    |
| Language           | TypeScript 5               |
| Database           | PostgreSQL 16 + Prisma 7   |
| Auth               | NextAuth v5                |
| Payments           | Stripe                     |
| Email              | Resend + React Email       |
| Uploads            | Uploadthing                |
| Background Jobs    | Inngest                    |
| Cache / Rate Limit | Upstash Redis              |
| UI                 | Tailwind CSS 4 + shadcn/ui |
| Testing            | Vitest                     |
| CI/CD              | GitHub Actions + Husky     |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)
- Stripe account (test mode)
- Resend account

### 1. Clone and Install

```bash
git clone https://github.com/muhammad-taha-1/shipkit.git
cd shipkit
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Fill in the required values in `.env`:

| Variable                                | Required | Notes                                                                |
| --------------------------------------- | -------- | -------------------------------------------------------------------- |
| `DATABASE_URL`                          | Yes      | PostgreSQL connection string                                         |
| `AUTH_SECRET`                           | Yes      | Generate with `openssl rand -base64 32`                              |
| `STRIPE_SECRET_KEY`                     | Yes      | From Stripe Dashboard (test mode)                                    |
| `STRIPE_WEBHOOK_SECRET`                 | Yes      | From `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`    | Yes      | From Stripe Dashboard                                                |
| `RESEND_API_KEY`                        | Yes      | From Resend Dashboard                                                |
| `EMAIL_FROM`                            | Yes      | Verified sender address                                              |
| `UPLOADTHING_TOKEN`                     | Yes      | From Uploadthing Dashboard                                           |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No       | For Google OAuth                                                     |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | No       | For GitHub OAuth                                                     |
| `UPSTASH_REDIS_REST_URL` / `TOKEN`      | No       | For production rate limiting (falls back to in-memory)               |
| `INNGEST_EVENT_KEY` / `SIGNING_KEY`     | No       | For background jobs (falls back to direct send)                      |

### 3. Start Database

```bash
# Using Docker
npm run db:up

# Or use your own PostgreSQL instance
```

### 4. Run Migrations

```bash
npx prisma migrate dev
```

### 5. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional: Background Jobs

```bash
npm run inngest:dev
```

### Optional: Stripe Webhooks (Local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register, forgot/reset password, verify email, onboarding
│   ├── (dashboard)/     # Dashboard, billing, files, notifications, settings
│   ├── (admin)/         # Super Admin panel
│   ├── (marketing)/     # Pricing page
│   └── api/             # Auth, Stripe webhooks, Inngest, Uploadthing, health
├── components/
│   ├── ui/              # 24 reusable UI components (shadcn/ui)
│   ├── forms/           # Auth and org forms
│   ├── layouts/         # Header, sidebar, org switcher, theme toggle
│   ├── dashboard/       # Stats cards, activity feed, quick actions
│   ├── admin/           # Admin header, sidebar, impersonation banner
│   └── notifications/   # Bell popover
├── lib/
│   ├── db.ts            # Prisma client (with @prisma/adapter-pg)
│   ├── redis.ts         # Upstash Redis client
│   ├── rate-limit.ts    # Sliding window rate limiter
│   ├── inngest.ts       # Inngest client
│   ├── utils.ts         # cn, formatCurrency, generateSlug, absoluteUrl, formatBytes
│   ├── validations.ts   # Zod schemas
│   ├── constants.ts     # App constants
│   └── errors.ts        # Error handling
├── modules/
│   ├── auth/            # Auth config, actions, guards, cleanup
│   ├── billing/         # Stripe actions, plans, limits
│   ├── members/         # Invitations, permissions (RBAC)
│   ├── organizations/   # Org CRUD, queries
│   ├── notifications/   # Create, send, preferences, types
│   ├── uploads/         # Uploadthing config, actions, queries
│   ├── jobs/            # Inngest functions (5 background jobs)
│   ├── admin/           # Super Admin actions and queries
│   ├── audit/           # Audit logging
│   └── settings/        # Profile and org settings actions
├── generated/prisma/    # Generated Prisma client
└── styles/              # Global CSS
tests/
├── setup.ts             # Global test setup (server-only mock)
└── unit/                # Unit test suites
prisma/
├── schema.prisma        # Database schema
└── migrations/          # Migration history
```

## Scripts

| Command                    | Description                       |
| -------------------------- | --------------------------------- |
| `npm run dev`              | Start development server          |
| `npm run build`            | Production build                  |
| `npm start`                | Start production server           |
| `npm run lint`             | Run ESLint                        |
| `npm run type-check`       | TypeScript type checking          |
| `npm run format`           | Format with Prettier              |
| `npm test`                 | Run tests                         |
| `npm run test:watch`       | Run tests in watch mode           |
| `npm run db:up`            | Start PostgreSQL + Redis (Docker) |
| `npm run db:down`          | Stop Docker services              |
| `npm run db:migrate`       | Run Prisma migrations             |
| `npm run db:seed`          | Seed the database                 |
| `npm run db:studio`        | Open Prisma Studio                |
| `npm run db:generate`      | Regenerate Prisma client          |
| `npm run db:promote-admin` | Promote user to SUPER_ADMIN       |
| `npm run email:dev`        | Start React Email preview         |
| `npm run inngest:dev`      | Start Inngest dev server          |

## Docker

Build and run with Docker:

```bash
docker build -t shipkit .
docker run -p 3000:3000 --env-file .env shipkit
```

Or use Docker Compose for the full stack:

```bash
docker compose up -d        # PostgreSQL + Redis
npm run dev                 # App (development)
```

## Billing Plans

| Feature          | Free   | Pro ($20/mo) | Enterprise ($50/mo) |
| ---------------- | ------ | ------------ | ------------------- |
| Members          | 3      | 20           | Unlimited           |
| Storage          | 100 MB | 5 GB         | 50 GB               |
| API Keys         | 2      | 10           | Unlimited           |
| Priority Support | -      | Yes          | Yes                 |
| Custom Branding  | -      | -            | Yes                 |

## Health Check

```
GET /api/health
```

Returns database and Redis connectivity status with `200` (healthy) or `503` (degraded).

## License

MIT
