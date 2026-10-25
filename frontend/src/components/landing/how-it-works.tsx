const steps = [
  {
    title: "Sign in with Google",
    description: "One tap and you're in. No forms, no passwords.",
  },
  {
    title: "Add income & expenses",
    description: "Use the form or type a sentence. It takes seconds.",
  },
  {
    title: "See where it all goes",
    description: "Your dashboard updates instantly with charts and trends.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Up and running in under a minute
          </h2>
        </div>

        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-3xl border bg-card p-6">
              <span className="amount flex size-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
