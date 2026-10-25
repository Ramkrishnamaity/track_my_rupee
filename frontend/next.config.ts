import path from "node:path"
import type { NextConfig } from "next"

// Load our env file (Next.js only reads .env.development/.env.production by itself).
// `next dev` → .env.dev; `next build` / production → .env.prod. Same idea as backend/drizzle.config.ts.
// From this folder: in production the backend server starts Next.js from backend/.
const envFile = process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev"
try {
  process.loadEnvFile(path.join(__dirname, envFile))
} catch {
  // File missing (e.g. on Render, which injects variables): use the environment as is.
}

// Fail fast instead of running an app that calls the wrong API.
const apiUrl = process.env.API_URL
if (!apiUrl) {
  throw new Error(`API_URL is missing: add it to frontend/${envFile}`)
}

const nextConfig: NextConfig = {
  // The browser calls /api/v1 on this same site. In production the backend serves both, so
  // these requests never reach Next.js; in development this forwards them to the API on :4000.
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${apiUrl}/:path*` }]
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
