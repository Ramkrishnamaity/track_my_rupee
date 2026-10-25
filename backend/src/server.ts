import { createApp } from "@/app"
import { env, isProduction } from "@/config/env"
import { pool } from "@/db"
import { logger } from "@/utils/logger"
import { loadFrontend } from "@/web"

// Production: this server also serves the frontend. Development: run `pnpm dev` in frontend/ as well.
const web = isProduction ? await loadFrontend() : undefined

const server = createApp(web).listen(env.PORT, async () => {
  logger.info(`TrackMyRupee ${web ? "app" : "API"} running on http://localhost:${env.PORT} (${env.NODE_ENV})`)
  try {
    await pool.query("SELECT 1")
    logger.info("Database connected")
  } catch (err) {
    logger.error({ err }, "Database connection failed")
  }
})

// Finish in-flight requests and close DB connections before exiting.
function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down…`)
  server.close(async () => {
    await pool.end()
    // Write out any buffered log lines before the process ends.
    logger.flush(() => process.exit(0))
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))
