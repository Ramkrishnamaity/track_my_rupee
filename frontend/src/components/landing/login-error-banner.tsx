import Link from "next/link"
import { CircleAlert, X } from "lucide-react"

// Codes sent by the backend: /?login_error=cancelled|expired|failed
const messages: Record<string, string> = {
  cancelled: "Login was cancelled. You can try again whenever you're ready.",
  expired: "Your login took too long or the link expired. Please try again.",
  failed: "We couldn't log you in with Google. Please try again.",
}

export function LoginErrorBanner({ code }: { code: string | undefined }) {
  const message = code ? messages[code] : undefined
  if (!message) return null

  return (
    <div role="alert" className="mx-auto mt-4 max-w-6xl px-4 sm:px-6">
      <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <CircleAlert className="size-4 shrink-0" />
        <p className="flex-1">{message}</p>
        <Link href="/" aria-label="Dismiss" className="rounded-md p-1 hover:bg-destructive/10">
          <X className="size-4" />
        </Link>
      </div>
    </div>
  )
}
