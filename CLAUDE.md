# TrackMyRupee

Personal income and expense tracker in ₹: categories, monthly budgets, transactions, and a dashboard with charts.
Login is Google only, with no separate login or signup pages. See README.md for setup and scripts.

- `frontend/`: Next.js 16 (App Router), React 19, Tailwind 4, shadcn/ui, runs on :3000
- `backend/`: Express 5 REST API under `/api/v1`, Drizzle ORM, PostgreSQL, runs on :4000. Swagger is at `/api/docs` (development only)
- pnpm in both apps. Each app is its own package, so run commands inside `frontend/` or `backend/`

## Before finishing any change

Run these in each app you touched, and report the real results:

```bash
pnpm format && pnpm typecheck && pnpm lint
```

Prettier style (same in both apps): no semicolons, double quotes, trailing commas (es5), line width 110.

## Working with the user

- Keep it minimal: no extra env variables, config options, conditions or abstractions, and no extra UI widgets or decoration. Offer extras as options instead of adding them.
- Explain commands and steps before installing packages or adding setup or config files.
- When the user asks for design ideas, show options and wait. Don't rewrite a working design unless asked.
- When asked to "remove what you added", undo only the latest change, not the whole feature.
- Database changes: `pnpm db:generate` → show the SQL for review → `pnpm db:migrate`. Never edit applied migrations.
- Never print or paste secret values (`.env.dev`, `.env.prod`). Use placeholders in examples.
- Don't kill the user's running dev servers on :3000 and :4000. Test on other ports and avoid broad `pkill` patterns.
- Test data you create in the database must be deleted afterwards.
- No git commits or pushes unless asked.

## Backend rules (`backend/src`)

Layout: `routes/` → `validators/` (zod) → `middlewares/` → `controllers/` → `models/` (Drizzle queries). Schema lives in `db/schema/`.

- Route shape: call `router.use(authenticate)` once at the top of a feature router. Then each route runs `validate({ body, query, params })` → DB-check middlewares → a thin controller. The DB checks return 404 (not found) or 409 (duplicate) and pass found data on through `res.locals`.
- One `validators/<feature>.validator.ts` and one `middlewares/<feature>.middleware.ts` per feature.
- Every response is `{ status: boolean, message, data? }`. Send it with `ApiResponse.success(res, message, data)`, and fail with `throw new ApiError(statusCode, message)`. Express 5 forwards async errors to `error-handler.ts`.
- Every query is scoped to the logged-in user (`req.user!.id`). Another user's ID must return 404.
- IDs are bigint identity `id`. Codes:
  - type: 1 = income, 2 = expense
  - status: 0 = inactive, 1 = active
  - payment method: 1 = UPI, 2 = Card, 3 = Cash, 4 = Bank
- Money columns are `numeric`.
- Transactions are only added or deleted, never edited. Adding or deleting one updates `balances` (income/expense; `saving` is a generated column) and `budgets.spent` in the same DB transaction.
- `transactions.date` / `time` are the user's own clock. `year` / `month` come from `date`.
- Raw SQL only through the `sql` template with placeholders. Never use `sql.raw` with input.
- Env: add new values to `config/env.ts` (zod). Files: `.env.dev` (dev, `db:*`) and `.env.prod` (`start:prod`, `db:migrate:prod`).
- Logging: pino. Errors with status ≥ 500 go to `logs/error.<date>.log`. The request ID is always generated on the server.

## Frontend rules (`frontend/src`)

- Next 16 APIs differ from older versions. Check `node_modules/next/dist/docs/` before using a Next.js API (for example, `error.tsx` gets `retry`).
- API calls live in `api/<feature>.apis.ts`. Each function takes an optional `client`: the browser uses `api` by default, and server code passes `await getServerApi()` (it forwards the session cookie).
- Server data loading: wrap each section in `<Suspense key={…} fallback={<X loading />}>` and load it with `loadOnServer()` from `lib/server-load.ts`. That helper handles the 500 ms minimum loader time, sends an expired session (401) home, and returns `null` on error.
- Loaders appear only inside tables and cards: use `TableLoaderRow`, or `PageLoader` inside a card. There is no full-page loader. Dashboard stat cards and charts have no loader.
- Shared pieces live in `components/app/`:
  - `EmptyState` / `TableEmptyRow`: icon and title only, no description
  - `LoadingButton`: for submits
  - `RetryButton`
  - `BlockedSection`: for features not built yet
  - sonner `toast` after mutations, then `router.refresh()`
- Filters, month and page are stored in the URL `searchParams`, and default values are left out of the URL.
- Env: read values only through `config/env.ts`, writing each `process.env.NEXT_PUBLIC_*` out literally. `next.config.ts` loads `.env.dev` (`next dev`) or `.env.prod` (`next build` / `start`) and fails if a value is missing.
- Colours come from tokens in `app/globals.css` (light and dark).
- `lib/landing-data.ts` holds the sample numbers for the home page only. The app itself uses real API data.

## Status

- Done: auth, categories, budgets, transactions, dashboard, settings (reset or delete account). All are connected end to end.
- Blocked in the UI until the AI work: Quick add (header popup) and the AI Assistant page.
- Pending:
  - backend tests (Vitest + Supertest with a separate test database)
  - deployment, including the cookie and domain decision (SameSite)
  - AI features
  - docs (BRD, coding standards)
