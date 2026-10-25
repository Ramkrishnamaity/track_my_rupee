import { createRequire } from "node:module"
import path from "node:path"
import type { IncomingMessage, ServerResponse } from "node:http"

/** Handles one page request (Next.js request handler). */
export type WebHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>

type NextFactory = (options: { dir: string; dev: boolean }) => {
  prepare: () => Promise<void>
  getRequestHandler: () => WebHandler
}

/**
 * Production: the built Next.js frontend, served by this same server (one domain, so the
 * login cookie is shared). Uses frontend/'s own `next` package, so there's one copy of it.
 * Needs `pnpm build` in frontend/ first.
 */
export async function loadFrontend(): Promise<WebHandler> {
  // src/ (tsx) and dist/ (built) both sit one level inside backend/
  const dir = path.resolve(import.meta.dirname, "../../frontend")
  const mod = createRequire(path.join(dir, "package.json"))("next") as NextFactory & { default?: NextFactory }
  const next = (mod.default ?? mod)({ dir, dev: false })
  await next.prepare()
  return next.getRequestHandler()
}
