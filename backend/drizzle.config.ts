import { defineConfig } from "drizzle-kit"

// drizzle-kit runs outside the app, so load the env file here (built into Node 24).
// Default: .env.dev. For production: ENV_FILE=.env.prod (see the db:migrate:prod script).
const envFile = process.env.ENV_FILE ?? ".env.dev"
try {
  process.loadEnvFile(envFile)
} catch {
  // File missing (e.g. on a host that injects variables): use the environment as is.
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema",
  out: "./migrations",
  // isActive in TypeScript ↔ is_active in the database
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL! },
})
