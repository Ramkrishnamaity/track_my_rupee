import { formatINR } from "@/lib/format"
import { MONTH_NAMES, addMonths, currentYearMonth } from "@/lib/month"

// Design phase: canned answers with sample numbers, so the chat can be tried before the real
// AI assistant exists. The real assistant (Claude + the user's data) replaces `sampleAnswer` later.

export const SUGGESTED_QUESTIONS = [
  "Check my last month's expenses and give me suggestions",
  "How much salary was credited last month?",
  "Compare my spending this month vs last month",
  "Where can I cut down my spending?",
]

const monthName = (offset: number) => MONTH_NAMES[addMonths(currentYearMonth(), offset).month - 1]

function expenseAnalysis() {
  const last = monthName(-1)
  return `You spent ${formatINR(48250)} in ${last}. Here's where it went:

• Food & Dining: ${formatINR(15440)} (32%)
• Rent & Bills: ${formatINR(13510)} (28%)
• Travel: ${formatINR(8685)} (18%)
• Shopping: ${formatINR(6755)} (14%)
• Others: ${formatINR(3860)} (8%)

Suggestions:
• Food & Dining is your biggest expense. A weekly limit of about ${formatINR(3300)} could save you around ${formatINR(2300)} a month.
• You went over your Shopping budget by ${formatINR(755)}. Try planning bigger purchases at the start of the month.
• Move a fixed amount to savings on payday, so it's set aside before spending starts.`
}

function salaryAnswer() {
  const last = monthName(-1)
  return `In ${last}, a total of ${formatINR(95000)} was credited as salary:

• Salary – Acme Corp: ${formatINR(95000)} (Bank, 1 ${last})

That's the same as the month before. Together with ${formatINR(15000)} from freelance work, your total income for ${last} was ${formatINR(110000)}.`
}

function compareAnswer() {
  const last = monthName(-1)
  return `So far this month you've spent ${formatINR(31480)}, compared with ${formatINR(48250)} in all of ${last}.

At your current pace you'll end the month at about ${formatINR(44900)}, which is 7% less than ${last}.

• Food & Dining is down 12%, nice work.
• Travel is up 18%, mostly two cab rides to the airport.
• Bills are about the same.`
}

function savingTips() {
  return `Based on the last three months, these are your best places to save:

• Food delivery: ${formatINR(6200)} a month on average. Cooking two more meals a week could save about ${formatINR(1800)}.
• Subscriptions: you pay for 4 streaming services (${formatINR(1150)} a month). Keeping two saves ${formatINR(550)}.
• Cabs: ${formatINR(3900)} a month. A metro pass for regular trips could cut this by a third.

Together that's roughly ${formatINR(3600)} a month, or ${formatINR(43200)} a year.`
}

function budgetAnswer() {
  return `Here's how your budgets look this month:

• Food & Dining: ${formatINR(9200)} of ${formatINR(10000)} used (92%), close to the limit.
• Travel: ${formatINR(1500)} of ${formatINR(1000)}, over by ${formatINR(500)}.
• Shopping: ${formatINR(2100)} of ${formatINR(5000)} (42%), on track.

You might want to slow down on Food & Dining for the rest of the month.`
}

function overview() {
  const now = monthName(0)
  return `Here's a quick look at ${now} so far:

• Income: ${formatINR(95000)}
• Expenses: ${formatINR(31480)}
• Balance: ${formatINR(63520)}

Your biggest spending category is Food & Dining (${formatINR(9200)}). Ask me about a category, a month, or your budgets for more detail.`
}

/** Picks a sample answer by keywords in the question. */
export function sampleAnswer(question: string): string {
  const q = question.toLowerCase()
  if (/\b(hi|hello|hey)\b/.test(q) && q.length < 20)
    return "Hi! Ask me anything about your spending, income or budgets."
  if (/salary|credited|income|earn/.test(q)) return salaryAnswer()
  if (/compare|\bvs\b|versus|than last/.test(q)) return compareAnswer()
  if (/cut|save|saving|reduce/.test(q)) return savingTips()
  if (/budget|limit/.test(q)) return budgetAnswer()
  if (/expense|spend|spent|analy|suggest/.test(q)) return expenseAnalysis()
  return overview()
}
