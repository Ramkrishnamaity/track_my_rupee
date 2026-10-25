// Sample numbers for the home (landing) page previews only. The logged-in app uses real API data.

type SampleTransaction = {
  id: string
  title: string
  category: string
  method: "UPI" | "Card" | "Cash" | "Bank"
  type: "income" | "expense"
  amount: number
  date: string
}

export const summary = {
  income: { amount: 125400, change: 12 },
  expenses: { amount: 48250, change: -8 },
  balance: { amount: 77150, change: 18 },
}

export const monthlyTrend = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  income: [92000, 98000, 95000, 110000, 104000, 118000, 125400],
  expenses: [52000, 56000, 61000, 54000, 63000, 57000, 48250],
}

export const spendingByCategory = [
  { name: "Food & Dining", value: 32, color: "var(--chart-1)" },
  { name: "Rent & Bills", value: 28, color: "var(--chart-2)" },
  { name: "Travel", value: 18, color: "var(--chart-3)" },
  { name: "Shopping", value: 14, color: "var(--chart-4)" },
  { name: "Others", value: 8, color: "var(--chart-5)" },
]

export const recentTransactions: SampleTransaction[] = [
  {
    id: "t1",
    title: "Salary – Acme Corp",
    category: "Salary",
    method: "Bank",
    type: "income",
    amount: 95000,
    date: "Today",
  },
  {
    id: "t2",
    title: "Lunch at Swiggy",
    category: "Food & Dining",
    method: "UPI",
    type: "expense",
    amount: 250,
    date: "Today",
  },
  {
    id: "t3",
    title: "Electricity bill",
    category: "Rent & Bills",
    method: "UPI",
    type: "expense",
    amount: 1200,
    date: "Yesterday",
  },
  {
    id: "t4",
    title: "Freelance – Logo design",
    category: "Freelance",
    method: "Bank",
    type: "income",
    amount: 15000,
    date: "21 Oct",
  },
]

export const incomeSources = [
  "Salary",
  "Freelance",
  "Business",
  "Investments",
  "Rental",
  "Interest",
  "Gifts",
  "Refunds",
]

export const expenseCategories = [
  "Food & Dining",
  "Rent & Bills",
  "Groceries",
  "Travel",
  "Shopping",
  "Health",
  "Education",
  "Entertainment",
  "EMIs & Loans",
  "Subscriptions",
]
