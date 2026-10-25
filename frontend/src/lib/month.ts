export type YearMonth = {
  year: number
  /** 1–12 */
  month: number
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function currentYearMonth(): YearMonth {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

/** "2026-10" -> { year: 2026, month: 10 }. Falls back to the current month. */
export function parseYearMonth(value: string | string[] | undefined): YearMonth {
  const match = typeof value === "string" && /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value)
  if (!match) return currentYearMonth()
  return { year: Number(match[1]), month: Number(match[2]) }
}

/** { year: 2026, month: 3 } -> "2026-03" (the ?month= URL value) */
export function formatYearMonthParam({ year, month }: YearMonth) {
  return `${year}-${String(month).padStart(2, "0")}`
}

/** { year: 2026, month: 3 } -> "March 2026" */
export function formatYearMonthLabel({ year, month }: YearMonth) {
  return `${MONTH_NAMES[month - 1]} ${year}`
}

export function compareYearMonth(a: YearMonth, b: YearMonth) {
  return a.year * 12 + a.month - (b.year * 12 + b.month)
}

export type MonthRange = {
  from: YearMonth
  to: YearMonth
}

/** Longest range the charts allow, in months (inclusive). */
export const MAX_RANGE_MONTHS = 12

export function addMonths({ year, month }: YearMonth, count: number): YearMonth {
  const index = year * 12 + (month - 1) + count
  return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

/** Number of months in a range, counting both ends: Jan–Mar = 3. */
export function rangeLength({ from, to }: MonthRange) {
  return compareYearMonth(to, from) + 1
}

/** Every month in the range, oldest first. */
export function monthsInRange(range: MonthRange): YearMonth[] {
  return Array.from({ length: rangeLength(range) }, (_, i) => addMonths(range.from, i))
}

/** "Jan – Jul 2026" or "Nov 2025 – Apr 2026" */
export function formatRangeLabel({ from, to }: MonthRange) {
  const short = (ym: YearMonth) => MONTH_NAMES[ym.month - 1].slice(0, 3)
  if (compareYearMonth(from, to) === 0) return `${short(from)} ${from.year}`
  if (from.year === to.year) return `${short(from)} – ${short(to)} ${to.year}`
  return `${short(from)} ${from.year} – ${short(to)} ${to.year}`
}

/**
 * Reads ?from=YYYY-MM&to=YYYY-MM. Invalid, future or too-long ranges fall back
 * to the last 6 months ending at `latest` (e.g. May–Oct).
 */
export function parseMonthRange(
  fromParam: string | string[] | undefined,
  toParam: string | string[] | undefined,
  latest: YearMonth
): MonthRange {
  const fallback = { from: addMonths(latest, -5), to: latest }
  const valid = /^\d{4}-(0[1-9]|1[0-2])$/
  if (typeof fromParam !== "string" || typeof toParam !== "string") return fallback
  if (!valid.test(fromParam) || !valid.test(toParam)) return fallback

  const range = { from: parseYearMonth(fromParam), to: parseYearMonth(toParam) }
  const length = rangeLength(range)
  if (length < 1 || length > MAX_RANGE_MONTHS) return fallback
  if (compareYearMonth(range.to, latest) > 0) return fallback
  return range
}
