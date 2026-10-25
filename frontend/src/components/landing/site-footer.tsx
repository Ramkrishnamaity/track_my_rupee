import { Logo } from "@/components/brand/logo"

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <Logo markClassName="size-7" className="[&>span:last-child]:text-base" />
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} TrackMyRupee. Made in India.
        </p>
      </div>
    </footer>
  )
}
