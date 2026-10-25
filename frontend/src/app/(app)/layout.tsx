import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { AppHeader } from "@/components/app/app-header"
import { AppSidebar } from "@/components/app/app-sidebar"
import { UserProvider } from "@/components/app/user-provider"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { getCurrentUser } from "@/lib/auth"

// Shell for every logged-in page: sidebar + top header.
// Not logged in (or session expired) → back to the home page.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser()
  if (!user) redirect("/")

  const cookieStore = await cookies()
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <UserProvider user={user}>
      <TooltipProvider delayDuration={0}>
        <SidebarProvider
          defaultOpen={sidebarOpen}
          // Collapsed (icon-only) sidebar width; shadcn's default is 3rem.
          style={{ "--sidebar-width-icon": "4.5rem" } as React.CSSProperties}
        >
          <AppSidebar />
          <SidebarInset className="min-w-0">
            <AppHeader />
            <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </UserProvider>
  )
}
