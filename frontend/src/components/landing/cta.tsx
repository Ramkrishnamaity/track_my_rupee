import { AuthCtaButton } from "@/components/landing/auth-cta-button"

export function Cta({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-from to-brand-to px-6 py-14 text-center text-white sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -bottom-24 size-72 rounded-full bg-white/10 blur-2xl"
          />
          <h2 className="relative text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Take control of your money today
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/80 text-pretty">
            Join TrackMyRupee and know exactly where every rupee goes, starting with your very next expense.
          </p>
          <div className="relative mt-8 flex justify-center">
            <AuthCtaButton
              loggedIn={loggedIn}
              size="lg"
              className="border-transparent bg-white text-neutral-900 hover:bg-white/90 hover:text-neutral-900 dark:bg-white dark:hover:bg-white/90"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
