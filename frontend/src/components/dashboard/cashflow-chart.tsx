"use client"

import { ChartArea, CircleAlert } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { MonthTotals } from "@/api/dashboard.apis"
import { EmptyState } from "@/components/app/empty-state"
import { MonthRangePicker } from "@/components/app/month-range-picker"
import { RetryButton } from "@/components/app/retry-button"
import { Card, CardAction, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatINR } from "@/lib/format"
import { MONTH_NAMES, rangeLength, type MonthRange, type YearMonth } from "@/lib/month"

const chartConfig = {
  income: { label: "Income", color: "var(--chart-1)" },
  expenses: { label: "Expenses", color: "var(--chart-2)" },
} satisfies ChartConfig

/** Y axis: 500 → "₹500", 25000 → "₹25k", 150000 → "₹1.5L" */
function shortINR(value: number) {
  if (Math.abs(value) >= 100000) return `₹${+(value / 100000).toFixed(1)}L`
  if (Math.abs(value) >= 1000) return `₹${+(value / 1000).toFixed(1)}k`
  return `₹${value}`
}

type CashflowChartProps = {
  range: MonthRange
  /** Latest selectable month for the range picker. */
  max: YearMonth
  /** undefined while loading (empty axes), null when loading failed */
  months?: MonthTotals[] | null
}

export function CashflowChart({ range, max, months }: CashflowChartProps) {
  const count = rangeLength(range)
  const spansYears = range.from.year !== range.to.year
  const data = (months ?? []).map((m) => ({
    month: `${MONTH_NAMES[m.month - 1].slice(0, 3)}${spansYears ? ` ${String(m.year).slice(2)}` : ""}`,
    income: m.income,
    expenses: m.expense,
  }))
  const isEmpty = !!months && months.every((m) => m.income === 0 && m.expense === 0)

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Income vs Expenses</CardTitle>
        <CardDescription>{count === 1 ? "1 month" : `${count} months`}</CardDescription>
        <CardAction>
          <MonthRangePicker value={range} max={max} />
        </CardAction>
      </CardHeader>
      <CardContent>
        {months === null ? (
          <EmptyState
            icon={CircleAlert}
            tone="error"
            title="Couldn't load the chart"
            action={<RetryButton />}
            className="h-[280px] py-0"
          />
        ) : isEmpty ? (
          <EmptyState icon={ChartArea} title="No income or expenses yet" className="h-[280px] py-0" />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
            <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="fill-income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-income)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--color-income)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fill-expenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-expenses)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--color-expenses)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={shortINR} />
              <ChartTooltip
                cursor={{ strokeDasharray: "4 4" }}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span
                            className="size-2 rounded-full"
                            style={{ background: `var(--color-${name})` }}
                          />
                          {chartConfig[name as keyof typeof chartConfig]?.label}
                        </span>
                        <span className="amount font-medium text-foreground">{formatINR(Number(value))}</span>
                      </div>
                    )}
                  />
                }
              />
              <Area
                dataKey="income"
                type="monotone"
                stroke="var(--color-income)"
                strokeWidth={2.5}
                fill="url(#fill-income)"
              />
              <Area
                dataKey="expenses"
                type="monotone"
                stroke="var(--color-expenses)"
                strokeWidth={2.5}
                fill="url(#fill-expenses)"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
