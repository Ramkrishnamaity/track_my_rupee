// All env values the app uses, in one place (like backend/src/config/env.ts).
//
// Write each one out as `process.env.NEXT_PUBLIC_…`: the build replaces that exact text with
// the value, so it also works in the browser (where `process.env` is otherwise empty).
// next.config.ts loads .env.dev / .env.prod and stops the app if a value is missing.

export const env = {
  /** Backend base URL, e.g. http://localhost:4000/api/v1 */
  API_URL: process.env.NEXT_PUBLIC_API_URL!,
}
