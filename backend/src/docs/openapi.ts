import { OpenAPIRegistry, OpenApiGeneratorV31, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"
import { z, type ZodType } from "zod"

import { SESSION_COOKIE } from "@/config/cookies"
import { getBudgetsQuery, saveBudgetsBody } from "@/validators/budget.validator"
import {
  allCategoriesQuery,
  categoryIdParams,
  createCategoryBody,
  listCategoriesQuery,
  updateCategoryBody,
  updateCategoryStatusBody,
} from "@/validators/category.validator"
import { incomeVsExpensesQuery, periodQuery, recentTransactionsQuery } from "@/validators/dashboard.validator"
import {
  createTransactionBody,
  listTransactionsQuery,
  transactionIdParams,
} from "@/validators/transaction.validator"

// API docs (OpenAPI 3.1), served by Swagger UI at /api/docs in development.
// Requests reuse the real zod validators, so the docs always match validation.
// Responses are described here, wrapped in the usual { status, message, data }.

extendZodWithOpenApi(z)

const registry = new OpenAPIRegistry()

// ---------- Auth: the login cookie ----------
const cookieAuth = registry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: SESSION_COOKIE,
  description: "Set by the Google login (httpOnly JWT). Log in at /api/v1/auth/google in the same browser.",
})
const secured = [{ [cookieAuth.name]: [] }]

// ---------- Response shapes ----------
const success = (data?: ZodType) =>
  z.object({
    status: z.literal(true),
    message: z.string(),
    ...(data && { data }),
  })

const ErrorResponse = registry.register(
  "ErrorResponse",
  z.object({ status: z.literal(false), message: z.string() }).openapi({
    example: { status: false, message: "Please log in to continue" },
  })
)

const errors = {
  400: { description: "Invalid input", content: { "application/json": { schema: ErrorResponse } } },
  401: {
    description: "Not logged in / session expired",
    content: { "application/json": { schema: ErrorResponse } },
  },
  404: {
    description: "Not found (or belongs to another user)",
    content: { "application/json": { schema: ErrorResponse } },
  },
  409: { description: "Duplicate", content: { "application/json": { schema: ErrorResponse } } },
  429: { description: "Too many requests", content: { "application/json": { schema: ErrorResponse } } },
}

const json = (description: string, schema: ZodType) => ({
  description,
  content: { "application/json": { schema } },
})

const money = z.number().openapi({ example: 1200.5 })
const typeField = z.union([z.literal(1), z.literal(2)]).openapi({ description: "1 = income, 2 = expense" })
const statusField = z.union([z.literal(0), z.literal(1)]).openapi({ description: "0 = inactive, 1 = active" })

const Pagination = registry.register(
  "Pagination",
  z.object({ page: z.number(), limit: z.number(), total: z.number(), totalPages: z.number() })
)

const User = registry.register(
  "User",
  z.object({
    id: z.number(),
    email: z.string(),
    name: z.string(),
    avatarUrl: z.string().nullable(),
    timezone: z.string().openapi({ example: "Asia/Kolkata" }),
    createdAt: z.string().openapi({ format: "date-time" }),
  })
)

const Category = registry.register(
  "Category",
  z.object({
    id: z.number(),
    name: z.string(),
    type: typeField,
    status: statusField,
    colourCode: z.string().openapi({ example: "#F97316" }),
    createdAt: z.string().openapi({ format: "date-time" }),
    updatedAt: z.string().openapi({ format: "date-time" }),
  })
)

const Transaction = registry.register(
  "Transaction",
  z.object({
    id: z.number(),
    type: typeField,
    paymentMethod: z.number().openapi({ description: "1 = UPI, 2 = Card, 3 = Cash, 4 = Bank" }),
    title: z.string(),
    amount: money,
    date: z.string().openapi({ example: "2026-10-05" }),
    time: z.string().openapi({ example: "13:45:00" }),
    year: z.number(),
    month: z.number(),
    categoryId: z.number(),
    categoryName: z.string(),
    colourCode: z.string(),
    createdAt: z.string().openapi({ format: "date-time" }),
  })
)

const BudgetItem = registry.register(
  "BudgetItem",
  z.object({
    categoryId: z.number(),
    categoryName: z.string(),
    colourCode: z.string(),
    categoryStatus: statusField,
    budgetId: z.number().nullable().openapi({ description: "null = no budget saved for this month" }),
    amount: money,
    spent: money,
  })
)

const SavedBudget = registry.register(
  "SavedBudget",
  z.object({
    budgetId: z.number(),
    categoryId: z.number(),
    categoryName: z.string(),
    colourCode: z.string(),
    amount: money,
    spent: money,
  })
)

const MonthTotals = registry.register(
  "MonthTotals",
  z.object({
    year: z.number(),
    month: z.number(),
    income: money,
    expense: money,
    saving: z.number().openapi({ description: "income − expense (can be negative)" }),
  })
)

const SpendingItem = registry.register(
  "SpendingItem",
  z.object({ categoryId: z.number(), categoryName: z.string(), colourCode: z.string(), amount: money })
)

const period = { year: z.number(), month: z.number() }
const body = (schema: ZodType) => ({ content: { "application/json": { schema } } })

// ---------- Health ----------
registry.registerPath({
  method: "get",
  path: "/api/v1/health",
  tags: ["Health"],
  summary: "Is the API up?",
  responses: { 200: json("API is running", success()) },
})

// ---------- Auth ----------
registry.registerPath({
  method: "get",
  path: "/api/v1/auth/google",
  tags: ["Auth"],
  summary: "Start Google login (open in the browser, not via Try it out)",
  request: {
    query: z.object({
      tz: z.string().optional().openapi({ example: "Asia/Kolkata", description: "Browser time zone" }),
    }),
  },
  responses: { 302: { description: "Redirects to Google" }, 429: errors[429] },
})
registry.registerPath({
  method: "get",
  path: "/api/v1/auth/google/callback",
  tags: ["Auth"],
  summary: "Google redirects back here; sets the session cookie, then redirects to the frontend",
  responses: { 302: { description: "To /dashboard, or /?login_error=cancelled|expired|failed" } },
})
registry.registerPath({
  method: "get",
  path: "/api/v1/auth/me",
  tags: ["Auth"],
  summary: "The logged-in user",
  security: secured,
  responses: { 200: json("Logged in user", success(User)), 401: errors[401] },
})
registry.registerPath({
  method: "post",
  path: "/api/v1/auth/logout",
  tags: ["Auth"],
  summary: "Log out (clears the session cookie)",
  responses: { 200: json("Logged out", success()) },
})

// ---------- Categories ----------
registry.registerPath({
  method: "get",
  path: "/api/v1/categories",
  tags: ["Categories"],
  summary: "List categories (filters + pagination)",
  security: secured,
  request: { query: listCategoriesQuery },
  responses: {
    200: json("Categories", success(z.object({ items: z.array(Category), pagination: Pagination }))),
    400: errors[400],
    401: errors[401],
  },
})
registry.registerPath({
  method: "get",
  path: "/api/v1/categories/all",
  tags: ["Categories"],
  summary: "All categories for dropdowns, no pagination (type 0 = all)",
  security: secured,
  request: { query: allCategoriesQuery },
  responses: {
    200: json("Categories", success(z.object({ items: z.array(Category) }))),
    400: errors[400],
    401: errors[401],
  },
})
registry.registerPath({
  method: "post",
  path: "/api/v1/categories",
  tags: ["Categories"],
  summary: "Create a category (starts active)",
  security: secured,
  request: { body: body(createCategoryBody) },
  responses: {
    201: json("Category created", success(Category)),
    400: errors[400],
    401: errors[401],
    409: errors[409],
  },
})
registry.registerPath({
  method: "patch",
  path: "/api/v1/categories/{id}",
  tags: ["Categories"],
  summary: "Edit name and/or colour (type can't change)",
  security: secured,
  request: { params: categoryIdParams, body: body(updateCategoryBody) },
  responses: {
    200: json("Category updated", success(Category)),
    400: errors[400],
    401: errors[401],
    404: errors[404],
    409: errors[409],
  },
})
registry.registerPath({
  method: "patch",
  path: "/api/v1/categories/{id}/status",
  tags: ["Categories"],
  summary: "Activate (1) or deactivate (0)",
  security: secured,
  request: { params: categoryIdParams, body: body(updateCategoryStatusBody) },
  responses: {
    200: json("Category activated/deactivated", success(Category)),
    400: errors[400],
    401: errors[401],
    404: errors[404],
  },
})

// ---------- Budgets ----------
registry.registerPath({
  method: "get",
  path: "/api/v1/budgets",
  tags: ["Budgets"],
  summary: "A month's budgets merged with active expense categories (missing → amount 0)",
  security: secured,
  request: { query: getBudgetsQuery },
  responses: {
    200: json("Budgets", success(z.object({ ...period, items: z.array(BudgetItem) }))),
    400: errors[400],
    401: errors[401],
  },
})
registry.registerPath({
  method: "put",
  path: "/api/v1/budgets",
  tags: ["Budgets"],
  summary: "Save a month: amount > 0 creates/updates, 0 removes. Returns the refreshed month",
  security: secured,
  request: { body: body(saveBudgetsBody) },
  responses: {
    200: json("Budgets saved", success(z.object({ ...period, items: z.array(BudgetItem) }))),
    400: errors[400],
    401: errors[401],
  },
})

// ---------- Transactions ----------
registry.registerPath({
  method: "get",
  path: "/api/v1/transactions",
  tags: ["Transactions"],
  summary: "A month's transactions, newest first (filters + pagination)",
  security: secured,
  request: { query: listTransactionsQuery },
  responses: {
    200: json("Transactions", success(z.object({ items: z.array(Transaction), pagination: Pagination }))),
    400: errors[400],
    401: errors[401],
  },
})
registry.registerPath({
  method: "post",
  path: "/api/v1/transactions",
  tags: ["Transactions"],
  summary: "Add a transaction (also updates balances and budgets.spent)",
  security: secured,
  request: { body: body(createTransactionBody) },
  responses: { 201: json("Transaction added", success(Transaction)), 400: errors[400], 401: errors[401] },
})
registry.registerPath({
  method: "delete",
  path: "/api/v1/transactions/{id}",
  tags: ["Transactions"],
  summary: "Delete a transaction (reverses balances and budgets.spent)",
  security: secured,
  request: { params: transactionIdParams },
  responses: {
    200: json("Transaction deleted", success()),
    400: errors[400],
    401: errors[401],
    404: errors[404],
  },
})

// ---------- Dashboard ----------
registry.registerPath({
  method: "get",
  path: "/api/v1/dashboard/summary",
  tags: ["Dashboard"],
  summary: "Income, expense and saving for a month (0s if no data)",
  security: secured,
  request: { query: periodQuery },
  responses: { 200: json("Summary", success(MonthTotals)), 400: errors[400], 401: errors[401] },
})
registry.registerPath({
  method: "get",
  path: "/api/v1/dashboard/spending-by-category",
  tags: ["Dashboard"],
  summary: "A month's expenses per category, biggest first",
  security: secured,
  request: { query: periodQuery },
  responses: {
    200: json("Spending", success(z.object({ ...period, total: money, items: z.array(SpendingItem) }))),
    400: errors[400],
    401: errors[401],
  },
})
registry.registerPath({
  method: "get",
  path: "/api/v1/dashboard/budgets",
  tags: ["Dashboard"],
  summary: "Only the budgets saved for a month (not merged)",
  security: secured,
  request: { query: periodQuery },
  responses: {
    200: json("Budgets", success(z.object({ ...period, items: z.array(SavedBudget) }))),
    400: errors[400],
    401: errors[401],
  },
})
registry.registerPath({
  method: "get",
  path: "/api/v1/dashboard/recent-transactions",
  tags: ["Dashboard"],
  summary: "Latest transactions across all months",
  security: secured,
  request: { query: recentTransactionsQuery },
  responses: {
    200: json("Recent transactions", success(z.object({ items: z.array(Transaction) }))),
    400: errors[400],
    401: errors[401],
  },
})
registry.registerPath({
  method: "get",
  path: "/api/v1/dashboard/income-vs-expenses",
  tags: ["Dashboard"],
  summary: "One item per month from `from` to `to` (max 12 months; missing months are 0s)",
  security: secured,
  request: { query: incomeVsExpensesQuery },
  responses: {
    200: json(
      "Income vs expenses",
      success(z.object({ from: z.object(period), to: z.object(period), items: z.array(MonthTotals) }))
    ),
    400: errors[400],
    401: errors[401],
  },
})

// ---------- Settings (danger zone) ----------
registry.registerPath({
  method: "post",
  path: "/api/v1/settings/reset-account",
  tags: ["Settings"],
  summary: "Delete all data (categories, transactions, budgets, balances); keep the account",
  security: secured,
  responses: { 200: json("Account reset", success()), 401: errors[401] },
})
registry.registerPath({
  method: "delete",
  path: "/api/v1/settings/account",
  tags: ["Settings"],
  summary: "Delete the account and all its data, then log out",
  security: secured,
  responses: { 200: json("Account deleted", success()), 401: errors[401] },
})

/** The generated OpenAPI document (built once at startup). */
export const openApiDocument = new OpenApiGeneratorV31(registry.definitions).generateDocument({
  openapi: "3.1.0",
  info: {
    title: "TrackMyRupee API",
    version: "1.0.0",
    description:
      "Every response is `{ status, message, data? }`. Protected routes need the login cookie: " +
      "open `/api/v1/auth/google` in this browser first, then use **Try it out**.",
  },
})
