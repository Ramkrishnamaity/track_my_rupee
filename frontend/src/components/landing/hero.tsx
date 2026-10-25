import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardPreview } from "@/components/landing/dashboard-preview"
import { AuthCtaButton } from "@/components/landing/auth-cta-button"

export function Hero({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section className="relative overflow-hidden">
      {/* Soft brand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:pt-20 lg:pb-28">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="size-3.5 text-primary" />
            Type it like you say it: &ldquo;Spent 250 on lunch&rdquo;
          </span>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
            Track every rupee.{" "}
            <span className="bg-linear-to-r from-brand-from to-brand-to bg-clip-text text-transparent">
              Effortlessly.
            </span>
          </h1>

          <p className="mt-5 text-lg text-pretty text-muted-foreground">
            TrackMyRupee brings all your income and expenses into one clear dashboard. Add entries with a
            quick form or in plain language, and see exactly where your money goes.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <AuthCtaButton
              loggedIn={loggedIn}
              size="lg"
              label="Get started with Google"
              dashboardLabel="Go to your dashboard"
            />
            <Button asChild variant="ghost" size="lg" className="h-12 rounded-full px-5 text-base">
              <a href="#features">
                See features <ArrowRight />
              </a>
            </Button>
          </div>

          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-income" />
            Free to use · One-tap sign in · Your data stays private
          </p>
        </div>

        <DashboardPreview className="lg:translate-x-4" />
      </div>
    </section>
  )
}
