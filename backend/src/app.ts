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

/** Builds the Express app (kept separate from server.ts so tests can import it). */
export function createApp() {
  const app = express()

  // Production runs behind one proxy/load balancer (HTTPS): read the real client IP
  // from it, otherwise every user would share the proxy's IP in the rate limit.
  if (isProduction) app.set("trust proxy", 1)

  app.use(requestId) // first, so everything after can use req.id
  app.use(httpLogger) // one log line per request (uses req.id)
  app.use(compression()) // gzip/brotli responses over 1 KB; the browser decompresses automatically
  app.use(helmet())
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
  app.use(express.json({ limit: "1mb" }))
  app.use(cookieParser())

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

  app.use(notFound)
  app.use(errorHandler)

  return app
}
