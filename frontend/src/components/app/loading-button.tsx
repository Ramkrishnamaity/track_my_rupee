import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  /** While true: shows a spinner, swaps the label and blocks clicks. */
  loading?: boolean
  /** Label while loading, e.g. "Saving…" (defaults to the normal label). */
  loadingText?: React.ReactNode
}

/**
 * A Button for actions (save, submit, delete…):
 *   <LoadingButton loading={saving} loadingText="Saving…">Save</LoadingButton>
 */
export function LoadingButton({
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading ? (
        <>
          <Spinner />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
