import { ArrowLeftRight, Bot, LayoutDashboard, Settings, Tags, Target, type LucideIcon } from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
}

export const appNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { title: "Budgets", href: "/budgets", icon: Target },
  { title: "Categories", href: "/categories", icon: Tags },
  { title: "AI Assistant", href: "/assistant", icon: Bot },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function findNavItem(pathname: string) {
  return appNav.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
}
