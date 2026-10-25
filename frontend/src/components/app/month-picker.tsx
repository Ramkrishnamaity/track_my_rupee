"use client"

import { useState } from "react"
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useUpdateSearchParams } from "@/hooks/use-update-search-params"
import {
  MONTH_NAMES,
  compareYearMonth,
  formatYearMonthLabel,
  formatYearMonthParam,
  type YearMonth,
} from "@/lib/month"
import { cn } from "@/lib/utils"

const YEARS_PER_PAGE = 12

type MonthPickerProps = {
  value: YearMonth
  /** Latest selectable month (usually the current month). */
  max: YearMonth
}

/** Month + year picker. The selection lives in the URL as ?month=YYYY-MM. */
export function MonthPicker({ value, max }: MonthPickerProps) {
  const updateSearchParams = useUpdateSearchParams()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<"months" | "years">("months")
  const [viewYear, setViewYear] = useState(value.year)

  const yearPageStart = viewYear - (viewYear % YEARS_PER_PAGE)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setView("months")
      setViewYear(value.year)
    }
  }

  function select(next: YearMonth) {
    setOpen(false)
    updateSearchParams({ month: formatYearMonthParam(next), page: null })
  }

  function step(direction: -1 | 1) {
    setViewYear((y) => y + direction * (view === "years" ? YEARS_PER_PAGE : 1))
  }

  const nextDisabled = view === "years" ? yearPageStart + YEARS_PER_PAGE > max.year : viewYear >= max.year

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10 self-start rounded-xl bg-card sm:self-auto">
          <CalendarDays />
          {formatYearMonthLabel(value)}
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 rounded-2xl p-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => step(-1)}
            aria-label={view === "years" ? "Previous years" : "Previous year"}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="amount font-semibold"
            onClick={() => setView(view === "months" ? "years" : "months")}
            aria-label={view === "months" ? "Choose a year" : "Back to months"}
          >
            {view === "months" ? viewYear : `${yearPageStart} – ${yearPageStart + YEARS_PER_PAGE - 1}`}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => step(1)}
            disabled={nextDisabled}
            aria-label={view === "years" ? "Next years" : "Next year"}
          >
            <ChevronRight />
          </Button>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {view === "months"
            ? MONTH_NAMES.map((name, i) => {
                const option = { year: viewYear, month: i + 1 }
                const selected = compareYearMonth(option, value) === 0
                const isCurrent = compareYearMonth(option, max) === 0
                return (
                  <Button
                    key={name}
                    variant={selected ? "default" : "ghost"}
                    disabled={compareYearMonth(option, max) > 0}
                    onClick={() => select(option)}
                    className={cn(
                      "h-10 rounded-xl",
                      isCurrent && !selected && "text-primary ring-1 ring-primary/30"
                    )}
                  >
                    {name.slice(0, 3)}
                  </Button>
                )
              })
            : Array.from({ length: YEARS_PER_PAGE }, (_, i) => {
                const year = yearPageStart + i
                return (
                  <Button
                    key={year}
                    variant={year === value.year ? "default" : "ghost"}
                    disabled={year > max.year}
                    onClick={() => {
                      setViewYear(year)
                      setView("months")
                    }}
                    className={cn(
                      "amount h-10 rounded-xl",
                      year === max.year && year !== value.year && "text-primary ring-1 ring-primary/30"
                    )}
                  >
                    {year}
                  </Button>
                )
              })}
        </div>

        <div className="mt-3 border-t pt-3">
          <Button
            variant="secondary"
            className="w-full rounded-xl"
            disabled={compareYearMonth(value, max) === 0}
            onClick={() => select(max)}
          >
            Jump to this month
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
