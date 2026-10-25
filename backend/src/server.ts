import { createApp } from "@/app"
import { env } from "@/config/env"
import { pool } from "@/db"
import { logger } from "@/utils/logger"

const server = createApp().listen(env.PORT, async () => {
  logger.info(`TrackMyRupee API running on http://localhost:${env.PORT} (${env.NODE_ENV})`)
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
