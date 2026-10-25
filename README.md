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
cp .env.example .env.dev      # API_URL=http://localhost:4000/api/v1
pnpm dev                      # app on http://localhost:3000
```

The browser always calls `/api/v1` on the app's own address; in development `next.config.ts` forwards it to
`API_URL`. Env files (never committed) are loaded by `next.config.ts`, and a missing `API_URL` stops the app:

| File        | Used by                  |
| ----------- | ------------------------ |
| `.env.dev`  | `pnpm dev`               |
| `.env.prod` | `pnpm build`, production |

## Production: one server

In production the backend also serves the built frontend, so the whole app runs on one address
(one domain, so the login cookie works for both). `/api/*` goes to the API; every other path goes to Next.js.

```bash
cd frontend && pnpm install && pnpm build    # API_URL=http://localhost:<PORT>/api/v1
cd ../backend && pnpm install && pnpm build
pnpm start:prod                              # NODE_ENV=production → serves API + frontend on PORT
```

Hosting: one Render web service (build both apps, start `backend`) and Neon for PostgreSQL. Run
`pnpm db:migrate:prod` from your machine against Neon before deploying schema changes.

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
