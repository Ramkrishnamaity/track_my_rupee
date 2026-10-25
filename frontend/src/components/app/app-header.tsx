"use client"

import { usePathname } from "next/navigation"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { QuickAddDialog } from "@/components/app/quick-add-dialog"
import { UserMenu } from "@/components/app/user-menu"
import { findNavItem } from "@/lib/navigation"

export function AppHeader() {
  const pathname = usePathname()
  const title = findNavItem(pathname)?.title ?? "TrackMyRupee"

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur-lg sm:px-6">
      <SidebarTrigger className="-ml-1.5" />
      <h1 className="text-base font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <QuickAddDialog />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
