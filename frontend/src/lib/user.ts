// Small helpers for showing a user's name (safe in server and client code).
/** "Aarav Sharma" → "Aarav" */
export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name

/** "Aarav Sharma" → "AS" */
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
