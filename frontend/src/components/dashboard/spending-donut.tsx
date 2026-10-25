"use client"

import { CircleAlert, PieChart as PieChartIcon } from "lucide-react"
import { Pie, PieChart } from "recharts"

import type { CategorySpending } from "@/api/dashboard.apis"
import { EmptyState } from "@/components/app/empty-state"
import { RetryButton } from "@/components/app/retry-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatINR } from "@/lib/format"

/** Biggest categories shown on their own; the rest are summed into "Others". */
const TOP_CATEGORIES = 5
const OTHERS_COLOUR = "#94A3B8"

type Slice = { key: string; name: string; amount: number; fill: string }

function toSlices(items: CategorySpending[]): Slice[] {
  const slices = items.slice(0, TOP_CATEGORIES).map((c) => ({
    key: String(c.categoryId),
    name: c.categoryName,
    amount: c.amount,
    fill: c.colourCode,
  }))
  const rest = items.slice(TOP_CATEGORIES).reduce((sum, c) => sum + c.amount, 0)
  if (rest > 0) slices.push({ key: "others", name: "Others", amount: rest, fill: OTHERS_COLOUR })
  return slices
}

type SpendingDonutProps = {
  /** e.g. "This month" or "March 2025" */
  periodLabel: string
  /** undefined while loading (empty ring), null when loading failed */
  spending?: { total: number; items: CategorySpending[] } | null
}

export function SpendingDonut({ periodLabel, spending }: SpendingDonutProps) {
  const data = toSlices(spending?.items ?? [])
  const total = spending?.total ?? 0
  const chartConfig = Object.fromEntries(
    data.map((s) => [s.key, { label: s.name, color: s.fill }])
  ) satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Spending by category</CardTitle>
        <CardDescription>{periodLabel}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 gap-5">
        {spending === null ? (
          <EmptyState
            icon={CircleAlert}
            tone="error"
            title="Couldn't load spending"
            action={<RetryButton />}
            className="flex-1"
          />
        ) : spending && data.length === 0 ? (
          <EmptyState icon={PieChartIcon} title="No spending yet" className="flex-1" />
        ) : (
          <>
            <div className="relative mx-auto aspect-square w-full max-w-[220px]">
              {/* Plain ring while loading; the chart draws itself in when the data arrives. */}
              {!spending && <div className="absolute inset-0 rounded-full border-[18px] border-muted" />}
              <ChartContainer config={chartConfig} className="aspect-square w-full">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="key"
                        hideLabel
                        formatter={(value, _name, item) => (
                          <div className="flex w-full items-center justify-between gap-4">
                            <span className="text-muted-foreground">{(item.payload as Slice).name}</span>
                            <span className="amount font-medium text-foreground">
                              {formatINR(Number(value))}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="key"
                    innerRadius="64%"
                    outerRadius="100%"
                    paddingAngle={2}
                    cornerRadius={6}
                    strokeWidth={0}
                  />
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground">Total spent</span>
                <span className="amount text-lg font-semibold">{spending ? formatINR(total) : "—"}</span>
              </div>
            </div>

            <ul className="grid gap-2.5">
              {data.map((s) => (
                <li key={s.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-2.5 rounded-full" style={{ background: s.fill }} />
                    {s.name}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="amount font-medium">{formatINR(s.amount)}</span>
                    <span className="w-9 text-right text-xs text-muted-foreground">
                      {Math.round((s.amount / total) * 100)}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}
