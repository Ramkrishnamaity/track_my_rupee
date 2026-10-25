import { Bot, ChartPie, Landmark, MessageSquareText, ShieldCheck, Tags, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type Feature = {
  icon: LucideIcon
  title: string
  description: string
  tone: string
  badge?: string
}

const features: Feature[] = [
  {
    icon: Landmark,
    title: "Income from every source",
    description:
      "Salary, freelance, business, rent, interest: log money from wherever it comes and see what earns the most.",
    tone: "bg-income/12 text-income",
  },
  {
    icon: MessageSquareText,
    title: "Add expenses your way",
    description:
      "Use a quick form, or just type “paid 1200 for electricity via UPI”. We pull out the amount, category and date.",
    tone: "bg-primary/12 text-primary",
  },
  {
    icon: ChartPie,
    title: "A dashboard that explains itself",
    description: "Pie charts, monthly trends and cash-flow views show where your money goes at a glance.",
    tone: "bg-warning/18 text-warning-foreground dark:text-warning",
  },
  {
    icon: Tags,
    title: "Categories & budgets",
    description:
      "Organise spending into categories that make sense to you and set monthly limits to stay on track.",
    tone: "bg-chart-5/12 text-chart-5",
  },
  {
    icon: Bot,
    title: "Ask your money anything",
    description:
      "“How much did I spend on food last month?” An AI assistant that answers from your own data.",
    tone: "bg-expense/12 text-expense",
    badge: "Coming soon",
  },
  {
    icon: ShieldCheck,
    title: "Secure Google sign-in",
    description:
      "No new passwords to remember. Sign in with Google and your data stays private to your account.",
    tone: "bg-income/12 text-income",
  },
]

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">Features</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Everything you need to manage your money
          </h2>
          <p className="mt-4 text-muted-foreground text-pretty">
            Built for how people in India actually earn and spend: UPI, cash, cards and more, all in rupees.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between">
                <span className={cn("flex size-11 items-center justify-center rounded-2xl", f.tone)}>
                  <f.icon className="size-5" />
                </span>
                {f.badge && (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    {f.badge}
                  </span>
                )}
              </div>
              <h3 className="mt-5 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
