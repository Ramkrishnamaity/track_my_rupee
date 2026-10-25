import { ArrowDown, Check, Sparkles } from "lucide-react"

import { formatINR } from "@/lib/format"

const parsedFields = [
  { label: "Amount", value: formatINR(1200), mono: true },
  { label: "Type", value: "Expense" },
  { label: "Category", value: "Rent & Bills" },
  { label: "Paid via", value: "UPI" },
  { label: "Date", value: "Yesterday" },
  { label: "Note", value: "Electricity bill" },
]

const examples = [
  "Got 15k from freelance project today",
  "Spent 250 on lunch at Swiggy",
  "Netflix 649 card monthly",
  "Received rent 18000 from tenant",
]

export function SmartEntry() {
  return (
    <section id="smart-entry" className="scroll-mt-20 bg-surface py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-primary">Smart entry</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Just type it. We&apos;ll fill in the details.
          </h2>
          <p className="mt-4 text-muted-foreground text-pretty">
            No more tapping through five fields for a cup of chai. Write a sentence the way you&apos;d text a
            friend, and TrackMyRupee turns it into a neat entry you can review before saving. Prefer forms?
            Those are always there too.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {examples.map((e) => (
              <li key={e} className="rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground">
                &ldquo;{e}&rdquo;
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border bg-card p-5 shadow-xl shadow-primary/5 sm:p-6">
          <p className="text-xs font-medium text-muted-foreground">Add an entry</p>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border bg-background px-4 py-3.5">
            <Sparkles className="size-4 shrink-0 text-primary" />
            <p className="text-sm sm:text-base">
              Paid 1200 for electricity bill via UPI yesterday
              <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-foreground" />
            </p>
          </div>

          <div className="my-4 flex justify-center text-muted-foreground">
            <ArrowDown className="size-4" />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {parsedFields.map((f) => (
              <div key={f.label} className="rounded-2xl bg-muted/60 px-3.5 py-3">
                <p className="text-[11px] text-muted-foreground">{f.label}</p>
                <p className={f.mono ? "amount mt-0.5 font-semibold" : "mt-0.5 font-medium"}>{f.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-income/10 px-4 py-3 text-sm">
            <span className="flex items-center gap-2 font-medium text-income">
              <Check className="size-4" /> Looks right? Save in one tap
            </span>
            <span className="rounded-full bg-income px-3 py-1 text-xs font-semibold text-income-foreground">
              Save
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
