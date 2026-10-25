import { api, type ApiClient } from "@/lib/api"

// Settings (danger zone) APIs. Both act on the logged-in user, so they take no input.

/** POST /settings/reset-account: deletes all data, keeps the account (stays logged in) */
export const resetAccount = (client: ApiClient = api) => client.post("/settings/reset-account")

/** DELETE /settings/account: deletes the account and all data; the server also logs out */
export const deleteAccount = (client: ApiClient = api) => client.delete("/settings/account")
