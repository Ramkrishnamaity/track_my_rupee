import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { AuthCtaButton } from "@/components/landing/auth-cta-button"

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#smart-entry", label: "Smart entry" },
  { href: "#how-it-works", label: "How it works" },
]

export function SiteHeader({ loggedIn }: { loggedIn: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="TrackMyRupee home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <AuthCtaButton loggedIn={loggedIn} label="Login with Google" dashboardLabel="Dashboard" compact />
        </div>
      </div>
    </header>
  )
}
