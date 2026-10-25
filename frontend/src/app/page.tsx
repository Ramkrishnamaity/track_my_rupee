import { Cta } from "@/components/landing/cta"
import { Features } from "@/components/landing/features"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { LoginErrorBanner } from "@/components/landing/login-error-banner"
import { MoneyFlow } from "@/components/landing/money-flow"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { SmartEntry } from "@/components/landing/smart-entry"
import { getCurrentUser } from "@/lib/auth"

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { login_error } = await searchParams
  // Logged-in users can still visit; their buttons say "Go to dashboard".
  const loggedIn = (await getCurrentUser()) !== null

  return (
    <>
      <SiteHeader loggedIn={loggedIn} />
      <LoginErrorBanner code={typeof login_error === "string" ? login_error : undefined} />
      <main className="flex-1">
        <Hero loggedIn={loggedIn} />
        <Features />
        <SmartEntry />
        <MoneyFlow />
        <HowItWorks />
        <Cta loggedIn={loggedIn} />
      </main>
      <SiteFooter />
    </>
  )
}
