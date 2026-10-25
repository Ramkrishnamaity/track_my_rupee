"use client"

import { useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useUpdateSearchParams } from "@/hooks/use-update-search-params"
import {
  MAX_RANGE_MONTHS,
  MONTH_NAMES,
  addMonths,
  compareYearMonth,
  formatRangeLabel,
  formatYearMonthParam,
  type MonthRange,
  type YearMonth,
} from "@/lib/month"
import { cn } from "@/lib/utils"

type MonthRangePickerProps = {
  value: MonthRange
  /** Latest selectable month (usually the current month). */
  max: YearMonth
}

function presetsFor(max: YearMonth): { label: string; range: MonthRange }[] {
  return [
    { label: "Last 3 months", range: { from: addMonths(max, -2), to: max } },
    { label: "Last 6 months", range: { from: addMonths(max, -5), to: max } },
    { label: "Last 12 months", range: { from: addMonths(max, -11), to: max } },
    { label: "This year", range: { from: { year: max.year, month: 1 }, to: max } },
    {
      label: "Last year",
      range: {
        from: { year: max.year - 1, month: 1 },
        to: { year: max.year - 1, month: 12 },
      },
    },
  ]
}

const sameRange = (a: MonthRange, b: MonthRange) =>
  compareYearMonth(a.from, b.from) === 0 && compareYearMonth(a.to, b.to) === 0

/**
 * Pick a start month, then an end month (max 12 months apart).
 * The selection lives in the URL as ?from=YYYY-MM&to=YYYY-MM.
 */
export function MonthRangePicker({ value, max }: MonthRangePickerProps) {
  const updateSearchParams = useUpdateSearchParams()
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(value.to.year)
  const [start, setStart] = useState<YearMonth | null>(null)
  const [hovered, setHovered] = useState<YearMonth | null>(null)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setViewYear(value.to.year)
      setStart(null)
      setHovered(null)
    }
  }

  function apply(range: MonthRange) {
    setOpen(false)
    updateSearchParams({
      from: formatYearMonthParam(range.from),
      to: formatYearMonthParam(range.to),
    })
  }

  function pick(month: YearMonth) {
    if (!start) {
      setStart(month)
      return
    }
    const [from, to] = compareYearMonth(month, start) < 0 ? [month, start] : [start, month]
    apply({ from, to })
  }

  // What to highlight: the range being picked, or the current one.
  const preview: MonthRange | null = start
    ? hovered
      ? compareYearMonth(hovered, start) < 0
        ? { from: hovered, to: start }
        : { from: start, to: hovered }
      : { from: start, to: start }
    : value

  function isDisabled(month: YearMonth) {
    if (compareYearMonth(month, max) > 0) return true
    if (start) return Math.abs(compareYearMonth(month, start)) >= MAX_RANGE_MONTHS
    return false
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" className="rounded-full">
          {formatRangeLabel(value)}
          <ChevronDown data-icon="inline-end" className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-auto rounded-2xl p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Presets */}
          <div className="flex gap-1 overflow-x-auto border-b p-2 sm:w-36 sm:flex-col sm:border-r sm:border-b-0">
            {presetsFor(max).map((p) => (
              <Button
                key={p.label}
                variant={sameRange(p.range, value) ? "secondary" : "ghost"}
                size="sm"
                className="shrink-0 justify-start rounded-lg"
                onClick={() => apply(p.range)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          {/* Month grid */}
          <div className="w-72 p-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setViewYear((y) => y - 1)}
                aria-label="Previous year"
              >
                <ChevronLeft />
              </Button>
              <span className="amount text-sm font-semibold">{viewYear}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setViewYear((y) => y + 1)}
                disabled={viewYear >= max.year}
                aria-label="Next year"
              >
                <ChevronRight />
              </Button>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-y-1.5" onMouseLeave={() => setHovered(null)}>
              {MONTH_NAMES.map((name, i) => {
                const month = { year: viewYear, month: i + 1 }
                const inRange =
                  preview &&
                  compareYearMonth(month, preview.from) >= 0 &&
                  compareYearMonth(month, preview.to) <= 0
                const isEdge =
                  preview &&
                  (compareYearMonth(month, preview.from) === 0 || compareYearMonth(month, preview.to) === 0)
                return (
                  <Button
                    key={name}
                    variant="ghost"
                    disabled={isDisabled(month)}
                    onClick={() => pick(month)}
                    onMouseEnter={() => start && setHovered(month)}
                    className={cn(
                      "h-10 rounded-none",
                      inRange && "bg-primary/10 text-primary hover:bg-primary/15",
                      isEdge &&
                        "rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                      !inRange && "rounded-xl"
                    )}
                  >
                    {name.slice(0, 3)}
                  </Button>
                )
              })}
            </div>

            <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
              {start
                ? `Now pick the end month (up to ${MAX_RANGE_MONTHS} months).`
                : "Pick a start month, then an end month."}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
