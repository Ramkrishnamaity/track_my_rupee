import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import { env } from "@/config/env"
import * as schema from "@/db/schema"
import { logger } from "@/utils/logger"

/** One shared connection pool for the whole app. */
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10, // connections at most
  connectionTimeoutMillis: 5_000, // give up connecting after 5s (default: wait forever)
  idleTimeoutMillis: 30_000, // close unused connections after 30s
  keepAlive: true, // keep idle connections healthy on cloud networks
  application_name: "trackmyrupee-api", // our connections' name in pg_stat_activity
  statement_timeout: 10_000, // Postgres cancels any query running longer than 10s
  idle_in_transaction_session_timeout: 10_000, // and closes transactions left open for 10s
})

// An idle connection can fail (e.g. Postgres restarts). Without a listener this
// error would crash the process; the pool drops that connection and opens a new one.
pool.on("error", (err) => logger.error({ err }, "Unexpected error on an idle database connection"))

/**
 * Drizzle client: `db.select().from(categories)…`
 * For raw SQL use the sql`` template (values become $1, $2… placeholders):
 *   db.execute(sql`SELECT … WHERE user_id = ${userId}`)
 */
export const db = drizzle({ client: pool, schema, casing: "snake_case" })
