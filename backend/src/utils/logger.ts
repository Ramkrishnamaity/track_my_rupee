import path from "node:path"
import type { Request } from "express"
import { pino } from "pino"
import { pinoHttp } from "pino-http"

// Terminal: every log, one line. File: only "error" (status ≥ 500), one file per day.
export const logger = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        level: "info",
        options: { translateTime: "HH:MM:ss", ignore: "pid,hostname,req,res,responseTime,err" },
      },
      {
        target: "pino-roll",
        level: "error",
        options: {
          file: path.join(process.cwd(), "logs", "error"),
          frequency: "daily",
          dateFormat: "yyyy-MM-dd",
          extension: ".log",
          mkdir: true,
          limit: { count: 30 },
        },
      },
    ],
  },
})

// One line per request: info (< 400), warn (4xx), error (≥ 500).
export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.id,
  customLogLevel: (_req, res) => (res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info"),
  // originalUrl = full path (req.url is shortened inside routers).
  // req.id is always our UUID string (pino-http types it loosely).
  customSuccessMessage: (req, res, ms) => {
    const { id, method, originalUrl } = req as Request
    return `${id as string} ${method} ${originalUrl} ${res.statusCode} ${ms}ms`
  },
  customErrorMessage: (req, res) => {
    const { id, method, originalUrl } = req as Request
    return `${id as string} ${method} ${originalUrl} ${res.statusCode}`
  },
  serializers: {
    req: (req: { id: string }) => ({ id: req.id }),
    res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
  },
})
