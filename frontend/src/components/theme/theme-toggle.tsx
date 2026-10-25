"use client"

import { useLayoutEffect } from "react"
import { Moon, Sun } from "lucide-react"

import { THEME_STORAGE_KEY } from "@/components/theme/theme-script"
import { cn } from "@/lib/utils"

type Theme = "light" | "dark"

function getPreferredTheme(): Theme {
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  if (saved === "light" || saved === "dark") return saved
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function setTheme(theme: Theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme)
  document.documentElement.classList.toggle("dark", theme === "dark")
}

// The active option is styled with `dark:` variants, so it always matches the
// class on <html> without extra React state.
const option =
  "flex size-8 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40 [&_svg]:size-4"
const active = "bg-card text-primary shadow-sm"
const inactive = "text-muted-foreground hover:text-foreground"

/** Segmented light/dark switch: [☀ | ☾] */
export function ThemeToggle({ className }: { className?: string }) {
  // Re-apply after React's dev Strict Mode remount clears the class on <html>.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", getPreferredTheme() === "dark")
  }, [])

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={cn("flex items-center gap-0.5 rounded-xl bg-muted p-1", className)}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label="Light mode"
        className={cn(
          option,
          active,
          "dark:bg-transparent dark:text-muted-foreground dark:shadow-none dark:hover:text-foreground"
        )}
      >
        <Sun />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label="Dark mode"
        className={cn(
          option,
          inactive,
          "dark:bg-card dark:text-primary dark:shadow-sm dark:hover:text-primary"
        )}
      >
        <Moon />
      </button>
    </div>
  )
}
