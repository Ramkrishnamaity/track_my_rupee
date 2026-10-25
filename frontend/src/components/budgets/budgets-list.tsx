import { redirect } from "next/navigation"

import { getBudgets, type BudgetMonth } from "@/api/budget.apis"
import { BudgetEditor } from "@/components/budgets/budget-editor"
import { ApiError } from "@/lib/api"
import { getServerApi } from "@/lib/api-server"
import { withMinLoading } from "@/lib/min-loading"

/** Loads one month of budgets on the server, then renders the editable table. */
export async function BudgetsList({ year, month }: { year: number; month: number }) {
  let data: BudgetMonth | undefined
  try {
    data = (await withMinLoading(getBudgets({ year, month }, await getServerApi()))).data
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 401) redirect("/") // session expired
    return <BudgetEditor year={year} month={month} loadFailed />
  }

  return <BudgetEditor year={year} month={month} items={data?.items ?? []} />
}
