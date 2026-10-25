# TrackMyRupee

Track your income and expenses in ₹: categories, monthly budgets, transactions, and a dashboard with charts.
Login is with Google only.

```
TrackMyRupee/
├── frontend/   Next.js 16 app (UI)              → http://localhost:3000
└── backend/    Express 5 REST API + PostgreSQL  → http://localhost:4000/api/v1
```

## Tech stack

| Part     | Tech                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui, Recharts, axios, sonner |
| Backend  | Express 5, TypeScript, Drizzle ORM, PostgreSQL, zod, jose (JWT), pino, Swagger        |
| Auth     | Google OAuth (backend redirect flow) → JWT in an httpOnly cookie (`tmr_session`)      |
| Tooling  | pnpm, ESLint, Prettier (same style in both apps)                                      |

## Requirements

- Node.js 24+
- pnpm 12+
- PostgreSQL (e.g. in Docker)
- A Google OAuth client (Google Cloud Console → Clients)

## Setup

### 1. Backend

```bash
cd backend
pnpm install
cp .env.example .env.dev      # then fill in the values
pnpm db:migrate               # create the tables
pnpm dev                      # API on http://localhost:4000
```

Env files (never committed):

| File        | Used by                                 |
| ----------- | --------------------------------------- |
| `.env.dev`  | `pnpm dev`, `start:dev`, `db:*` scripts |
| `.env.prod` | `start:prod`, `db:migrate:prod`         |

API docs (development only): http://localhost:4000/api/docs

### 2. Frontend

```bash
cd frontend
pnpm install
cp .env.example .env.dev      # NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
pnpm dev                      # app on http://localhost:3000
```

Env files (never committed), loaded by `next.config.ts`; a missing `NEXT_PUBLIC_API_URL` stops the app with an error:

| File        | Used by                    |
| ----------- | -------------------------- |
| `.env.dev`  | `pnpm dev`                 |
| `.env.prod` | `pnpm build`, `pnpm start` |

`NEXT_PUBLIC_*` values are built into the app, so set `.env.prod` **before** `pnpm build`.

## Scripts

Both apps have the same quality scripts:

| Script              | What it does                     |
| ------------------- | -------------------------------- |
| `pnpm dev`          | Run in development (auto-reload) |
| `pnpm build`        | Production build                 |
| `pnpm typecheck`    | TypeScript check                 |
| `pnpm lint`         | ESLint (`lint:fix` to auto-fix)  |
| `pnpm format`       | Format with Prettier             |
| `pnpm format:check` | Check formatting only            |

Backend only:

| Script                     | What it does                                    |
| -------------------------- | ----------------------------------------------- |
| `pnpm start:dev` / `:prod` | Run the built API with `.env.dev` / `.env.prod` |
| `pnpm db:generate`         | Create a migration from schema changes (dev)    |
| `pnpm db:migrate`          | Apply migrations (`db:migrate:prod` for prod)   |
| `pnpm db:studio`           | Browse the database (dev)                       |

Frontend only: `pnpm start` runs the production build.

## Project structure

```
backend/src/
├── routes/        one router per feature (auth, categories, budgets, transactions, dashboard, settings)
├── validators/    zod schemas per feature
├── middlewares/   auth, validation, DB checks per feature, rate limit, errors
├── controllers/   thin request handlers
├── models/        database queries (Drizzle)
├── db/            connection + schema
└── docs/          OpenAPI (Swagger)

frontend/src/
├── app/           pages: home (/) and the logged-in app in (app)/
├── api/           one file per backend feature, e.g. category.apis.ts
├── components/    UI, grouped by page; shared pieces in app/ and ui/
└── lib/           API client, formatting, month helpers
```

## Status

- Done: Google login, Categories, Budgets, Transactions, Dashboard, Settings (reset / delete account)
- Under development: AI Quick add and AI Assistant (shown, but blocked in the UI)
