import { z } from "zod"

// Validates process.env once at startup, so a missing/invalid value fails fast
// with a clear message instead of breaking later at runtime.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.url(),

  /** Where the browser goes after login / on login errors. */
  FRONTEND_URL: z.url().default("http://localhost:3000"),

  GOOGLE_CLIENT_ID: z.string().min(1, "Set it from Google Cloud Console > Clients"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "Set it from Google Cloud Console > Clients"),
  GOOGLE_REDIRECT_URI: z.url().default("http://localhost:4000/api/v1/auth/google/callback"),

  JWT_SECRET: z.string().min(32, "Use at least 32 characters (openssl rand -base64 48)"),
  /** Login session length, e.g. "7d", "12h". */
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]$/, 'Use a number + s/m/h/d, e.g. "7d"')
    .default("1h"),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("Invalid environment variables:", z.flattenError(parsed.error).fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export const isProduction = env.NODE_ENV === "production"
