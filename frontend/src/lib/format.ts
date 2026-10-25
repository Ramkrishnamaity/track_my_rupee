const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
})

/** 125400 → "₹1,25,400", 1200.5 → "₹1,200.5" (Indian digit grouping, paise kept). */
export function formatINR(amount: number) {
  return inrFormatter.format(amount)
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** "2026-10-05" → "5 Oct 2026" (shown exactly as the user entered it, no time zone shift). */
export function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number)
  return `${day} ${MONTHS_SHORT[month - 1]} ${year}`
}

/** "13:45:00" → "1:45 PM" */
export function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  const suffix = hours >= 12 ? "PM" : "AM"
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`
}
