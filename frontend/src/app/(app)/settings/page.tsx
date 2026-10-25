import type { Metadata } from "next"

import { UserAvatar } from "@/components/app/user-menu"
import { GoogleIcon } from "@/components/icons/google-icon"
import { DangerZone } from "@/components/settings/danger-zone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  // The (app) layout already redirected guests, so the user exists here.
  const user = (await getCurrentUser())!
  const memberSince = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: user.timezone,
  }).format(new Date(user.createdAt))

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>

      {/* Profile */}
      <Card>
        <CardContent className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <UserAvatar className="size-24" fallbackClassName="text-3xl" />
          <div className="min-w-0">
            <p className="text-xl font-semibold">{user.name}</p>
            <p className="truncate text-muted-foreground">{user.email}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs font-medium">
                <GoogleIcon className="size-3.5" />
                Signed in with Google
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                Member since {memberSince}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="ring-destructive/30">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-destructive">Danger zone</CardTitle>
          <CardDescription>These actions are permanent and can&apos;t be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <DangerZone />
        </CardContent>
      </Card>
    </div>
  )
}
