import { TrendingDown, TrendingUp } from "lucide-react"

import { expenseCategories, incomeSources } from "@/lib/landing-data"

export function MoneyFlow() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Every way money comes in, and goes out
          </h2>
          <p className="mt-4 text-muted-foreground text-pretty">
            Ready-made categories to start with. Add your own anytime.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-income/12 text-income">
                <TrendingUp className="size-5" />
              </span>
              <h3 className="text-lg font-semibold">Income sources</h3>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {incomeSources.map((s) => (
                <li
                  key={s}
                  className="rounded-full bg-income/10 px-3.5 py-1.5 text-sm font-medium text-income"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-expense/12 text-expense">
                <TrendingDown className="size-5" />
              </span>
              <h3 className="text-lg font-semibold">Expense categories</h3>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {expenseCategories.map((c) => (
                <li
                  key={c}
                  className="rounded-full bg-expense/10 px-3.5 py-1.5 text-sm font-medium text-expense"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
