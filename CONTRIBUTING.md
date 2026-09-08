# Contributing to ShipKit

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in values
4. Start the database: `npm run db:up`
5. Run migrations: `npx prisma migrate dev`
6. Start the dev server: `npm run dev`

## Code Style

- TypeScript strict mode
- ESLint + Prettier enforced via pre-commit hook (Husky + lint-staged)
- Tailwind CSS for styling
- Server components by default, `"use client"` only when needed

## Project Conventions

- **Server actions** go in `src/modules/<domain>/actions.ts` with `"use server"` directive
- **Database queries** go in `src/modules/<domain>/queries.ts`
- **Business logic** stays in `src/modules/` — never in route handlers or components
- **UI components** use shadcn/ui patterns in `src/components/ui/`
- **Validation** uses Zod schemas from `src/lib/validations.ts`
- **Auth guards** use `requireAuth()` / `requireOrgAccess()` / `requirePermission()` from `src/modules/auth/guards.ts`

## Making Changes

1. Create a feature branch from `main`
2. Make your changes
3. Run checks locally:
   ```bash
   npm run lint
   npm run type-check
   npm test
   ```
4. Commit with a clear message describing the change
5. Open a pull request against `main`

## Tests

- Tests live in `tests/` using Vitest
- Run with `npm test` or `npm run test:watch`
- Server-only modules are tested by mocking `server-only` in `tests/setup.ts`

## Database Changes

- Add fields/models in `prisma/schema.prisma`
- Run `npx prisma migrate dev --name describe-your-change`
- Regenerate the client: `npm run db:generate`
