import { rateLimit } from "express-rate-limit"

import { ApiResponse } from "@/utils/api-response"

// Counts requests per client IP in a 15-minute window; over the limit → 429.
// Counts are kept in memory, which is fine for one API server. With several
// servers, switch to a shared store (e.g. Redis) so they share the counts.

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

/** Whole API: 300 requests per IP per 15 minutes (health check not counted). */
export const apiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 300,
  standardHeaders: "draft-8", // RateLimit headers: limit, remaining, reset
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
  handler: (_req, res) => {
    ApiResponse.error(res, "Too many requests, please slow down and try again in a few minutes", 429)
  },
})

/** Google login start + callback: 20 per IP per 15 minutes. */
export const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(res, "Too many login attempts, please try again in a few minutes", 429)
  },
})
