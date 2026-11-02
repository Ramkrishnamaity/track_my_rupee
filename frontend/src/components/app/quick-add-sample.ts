// Design phase: a simple rule-based reading of the Quick add text, so the popup can be tried
// before the real AI exists. The real AI parser (Claude + the user's categories) replaces it later.

export type QuickAddResult = {
  amount: number | null
  type: "income" | "expense"
  category: string
  method: "UPI" | "Card" | "Cash" | "Bank"
  date: "Today" | "Yesterday"
  note: string
}

const CATEGORIES: [RegExp, string, QuickAddResult["type"]][] = [
  [/salary/, "Salary", "income"],
  [/freelance|client|project/, "Freelance", "income"],
  [/rent from|tenant/, "Rental", "income"],
  [/lunch|dinner|breakfast|swiggy|zomato|food|coffee|chai|tea|restaurant|cafe/, "Food & Dining", "expense"],
  [/grocer|vegetable|milk|blinkit|zepto|bigbasket/, "Groceries", "expense"],
  [/rent|electricity|bill|wifi|internet|recharge|gas/, "Rent & Bills", "expense"],
  [/uber|ola|cab|auto|metro|bus|train|flight|petrol|fuel/, "Travel", "expense"],
  [/netflix|spotify|prime|hotstar|youtube|subscription/, "Subscriptions", "expense"],
  [/amazon|flipkart|myntra|clothes|shoes|shopping/, "Shopping", "expense"],
  [/doctor|medicine|pharmacy|hospital|gym/, "Health", "expense"],
]

const INCOME_WORDS = /\b(got|received|earned|credited|salary|income|refund)\b/
const FILLER =
  /\b(spent|spend|paid|pay|got|received|earned|credited|for|on|from|via|by|with|using|upi|card|cash|bank|today|yesterday|rs|inr|rupees?|monthly)\b|₹|\d+(\.\d+)?\s*k?\b/gi

/** "Spent 250 on lunch at Swiggy yesterday" → amount 250, Food & Dining, UPI, Yesterday, "Lunch at Swiggy". */
export function readQuickAdd(text: string): QuickAddResult {
  const lower = text.toLowerCase()

  const num = lower.match(/(\d+(?:\.\d{1,2})?)\s*(k)?\b/)
  const amount = num ? Number(num[1]) * (num[2] ? 1000 : 1) : null

  const match = CATEGORIES.find(([pattern]) => pattern.test(lower))
  const type = match?.[2] ?? (INCOME_WORDS.test(lower) ? "income" : "expense")
  const category = match?.[1] ?? "Others"

  const method = /\bcard\b/.test(lower)
    ? "Card"
    : /\bcash\b/.test(lower)
      ? "Cash"
      : /\bbank|neft|imps|transfer\b/.test(lower) || type === "income"
        ? "Bank"
        : "UPI"

  const note = text.replace(FILLER, " ").replace(/\s+/g, " ").trim().slice(0, 50)

  return {
    amount,
    type,
    category,
    method,
    date: lower.includes("yesterday") ? "Yesterday" : "Today",
    note: note ? note[0].toUpperCase() + note.slice(1) : category,
  }
}
