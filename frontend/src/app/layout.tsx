import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeScript } from "@/components/theme/theme-script"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "TrackMyRupee: Track every rupee, effortlessly",
    template: "%s · TrackMyRupee",
  },
  description:
    "Manage your income and expenses in one place. Add entries with a form or plain language, and see where your money goes with clear charts.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full antialiased", inter.variable, geistMono.variable)}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="top-right" closeButton />
      </body>
    </html>
  )
}
