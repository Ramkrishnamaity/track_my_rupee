import type { NextConfig } from "next"

// Load our env file (Next.js only reads .env.development/.env.production by itself).
// `next dev` → .env.dev; `next build` / `next start` → .env.prod. Same idea as backend/drizzle.config.ts.
const envFile = process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev"
try {
  process.loadEnvFile(envFile)
} catch {
  // File missing (e.g. on a host that injects variables): use the environment as is.
}

// Fail fast instead of shipping an app that calls the wrong API.
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(`NEXT_PUBLIC_API_URL is missing: add it to frontend/${envFile}`)
}

const nextConfig: NextConfig = {
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
