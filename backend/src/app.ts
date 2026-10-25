import compression from "compression"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import swaggerUi from "swagger-ui-express"

import { env, isProduction } from "@/config/env"
import { openApiDocument } from "@/docs/openapi"
import { errorHandler } from "@/middlewares/error-handler"
import { notFound } from "@/middlewares/not-found"
import { apiLimiter } from "@/middlewares/rate-limit"
import { requestId } from "@/middlewares/request-id"
import { apiRouter } from "@/routes"
import { httpLogger } from "@/utils/logger"
import type { WebHandler } from "@/web"

/**
 * Builds the Express app (kept separate from server.ts so tests can import it).
 * `web` (production): the Next.js frontend, which gets every request outside /api.
 */
export function createApp(web?: WebHandler) {
  const app = express()

  // Production runs behind one proxy/load balancer (HTTPS): read the real client IP
  // from it, otherwise every user would share the proxy's IP in the rate limit.
  if (isProduction) app.set("trust proxy", 1)

  // API-only middleware: pages and their files (served by Next.js) skip all of these.
  // helmet's default headers would block the inline scripts Next.js pages need.
  app.use(
    "/api",
    requestId, // first, so everything after can use req.id
    httpLogger, // one log line per request (uses req.id)
    compression(), // gzip/brotli responses over 1 KB; the browser decompresses automatically
    helmet(),
    cors({ origin: env.CORS_ORIGIN, credentials: true }),
    express.json({ limit: "1mb" }),
    cookieParser()
  )

  // API docs (Swagger UI) in development only: /api/docs, raw spec at /api/docs.json
  if (!isProduction) {
    app.get("/api/docs.json", (_req, res) => res.json(openApiDocument))
    app.use(
      "/api/docs",
      swaggerUi.serve,
      swaggerUi.setup(openApiDocument, { customSiteTitle: "TrackMyRupee API" })
    )
  }

  app.use("/api/v1", apiLimiter, apiRouter)

  app.use("/api", notFound)
  if (web) app.use((req, res) => web(req, res)) // everything else: the frontend pages
  app.use(errorHandler)

  return app
}
