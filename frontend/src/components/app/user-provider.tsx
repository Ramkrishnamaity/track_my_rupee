"use client"

import { createContext, useContext } from "react"

import type { CurrentUser } from "@/lib/auth"

const UserContext = createContext<CurrentUser | null>(null)

/** Makes the logged-in user available to client components in the app. */
export function UserProvider({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

/** The logged-in user. Only use inside the (app) layout, which guarantees a user. */
export function useCurrentUser() {
  const user = useContext(UserContext)
  if (!user) throw new Error("useCurrentUser must be used inside <UserProvider>")
  return user
}
