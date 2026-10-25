"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Logo, LogoMark } from "@/components/brand/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { appNav, type NavItem } from "@/lib/navigation"

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const { setOpenMobile } = useSidebar()
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.title}
        className="h-10 rounded-lg group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center data-active:bg-primary/10 data-active:font-semibold data-active:text-primary data-active:hover:bg-primary/15 data-active:hover:text-primary"
      >
        <Link href={item.href} onClick={() => setOpenMobile(false)}>
          <item.icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
      {item.badge && (
        <SidebarMenuBadge className="top-1/2! -translate-y-1/2 rounded-full bg-primary/10 px-1.5 text-[10px] text-primary peer-data-active/menu-button:hidden">
          {item.badge}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center px-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <Link href="/" aria-label="TrackMyRupee home">
          <Logo className="group-data-[collapsible=icon]:hidden" />
          <LogoMark className="hidden size-10 group-data-[collapsible=icon]:block" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
              {appNav.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
