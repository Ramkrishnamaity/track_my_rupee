import type { CategoryType } from "@/api/category.apis"
import { api, type ApiClient, type Paginated } from "@/lib/api"

// Transaction APIs. Every function uses the browser client by default; on the
// Next.js server pass `await getServerApi()` as the last argument.

/** 1 = UPI, 2 = Card, 3 = Cash, 4 = Bank */
export const PAYMENT_METHOD = { upi: 1, card: 2, cash: 3, bank: 4 } as const
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  1: "UPI",
  2: "Card",
  3: "Cash",
  4: "Bank",
}

export type Transaction = {
  id: number
  /** 1 = income, 2 = expense */
  type: CategoryType
  paymentMethod: PaymentMethod
  title: string
  amount: number
  /** "2026-10-05" (the user's own date) */
  date: string
  /** "13:45:00" (the user's own time) */
  time: string
  year: number
  month: number
  categoryId: number
  categoryName: string
  colourCode: string
  createdAt: string
}

export type GetTransactionsParams = {
  year: number
  month: number
  type?: CategoryType
  categoryId?: number
  page?: number
  limit?: number
}

/** GET /transactions: one page of a month, newest first */
export const getTransactions = (params: GetTransactionsParams, client: ApiClient = api) =>
  client.get<Paginated<Transaction>>("/transactions", { params })

/** POST /transactions: also updates balances and budgets on the server */
export const createTransaction = (
  body: {
    type: CategoryType
    categoryId: number
    paymentMethod: PaymentMethod
    title: string
    amount: number
    /** "2026-10-05" */
    date: string
    /** "13:45" */
    time: string
  },
  client: ApiClient = api
) => client.post<Transaction>("/transactions", body)

/** DELETE /transactions/:id: also reverses balances and budgets on the server */
export const deleteTransaction = (id: number, client: ApiClient = api) => client.delete(`/transactions/${id}`)
