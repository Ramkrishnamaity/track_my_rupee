// All env values the app uses, in one place (like backend/src/config/env.ts).
// Server-only: read on the Next.js server, never in the browser.
// next.config.ts loads .env.dev / .env.prod and stops the app if a value is missing.

export const env = {
  /** Backend URL for the Next.js server, e.g. http://localhost:4000/api/v1 (the browser uses /api/v1). */
  API_URL: process.env.API_URL!,
}
