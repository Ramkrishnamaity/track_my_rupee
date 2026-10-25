"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { deleteAccount, resetAccount } from "@/api/settings.apis"
import { LoadingButton } from "@/components/app/loading-button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ApiError, type ApiResponse } from "@/lib/api"

const solidDestructive =
  "rounded-xl bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30"

type DangerActionProps = {
  icon: typeof Trash2
  title: string
  description: string
  buttonLabel: string
  confirmTitle: string
  confirmBody: React.ReactNode
  confirmLabel: string
  /** Shown on the confirm button while the request runs, e.g. "Resetting…" */
  busyLabel: string
  /** The API call. */
  action: () => Promise<ApiResponse>
  /** After success (the dialog is closed and a toast shown). */
  onDone: () => void
}

function DangerAction({
  icon: Icon,
  title,
  description,
  buttonLabel,
  confirmTitle,
  confirmBody,
  confirmLabel,
  busyLabel,
  action,
  onDone,
}: DangerActionProps) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleConfirm() {
    setBusy(true)
    try {
      const { message } = await action()
      toast.success(message)
      setOpen(false)
      onDone()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {/* Can't be closed while the request runs */}
      <AlertDialog open={open} onOpenChange={(next) => !busy && setOpen(next)}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="h-10 shrink-0 self-start rounded-xl sm:self-auto">
            <Icon />
            {buttonLabel}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogMedia className="rounded-2xl bg-destructive/10 text-destructive">
              <Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="grid gap-2">{confirmBody}</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={busy}>
              Cancel
            </AlertDialogCancel>
            <LoadingButton
              className={solidDestructive}
              loading={busy}
              loadingText={busyLabel}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </LoadingButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** Reset account + Delete account, each behind a confirmation. */
export function DangerZone() {
  const router = useRouter()

  return (
    <div className="divide-y">
      <DangerAction
        icon={RotateCcw}
        title="Reset account"
        description="Delete all your data and start fresh. You stay signed in."
        buttonLabel="Reset account"
        confirmTitle="Reset your account?"
        confirmBody={
          <>
            <p>
              This will permanently delete all your transactions, categories and budgets. Your account stays,
              so you can start fresh.
            </p>
            <p className="font-medium text-foreground">This can&apos;t be undone.</p>
          </>
        }
        confirmLabel="Yes, reset everything"
        busyLabel="Resetting…"
        action={() => resetAccount()}
        // Still logged in: show the now-empty dashboard.
        onDone={() => {
          router.push("/dashboard")
          router.refresh()
        }}
      />
      <DangerAction
        icon={Trash2}
        title="Delete account"
        description="Permanently delete your account and all of its data."
        buttonLabel="Delete account"
        confirmTitle="Delete your account?"
        confirmBody={
          <>
            <p>
              This will permanently delete your account and <strong>all of your data</strong>: transactions,
              categories and budgets.
            </p>
            <p>You will be logged out right away.</p>
            <p className="font-medium text-foreground">This can&apos;t be undone. Are you sure?</p>
          </>
        }
        confirmLabel="Yes, delete my account"
        busyLabel="Deleting…"
        action={() => deleteAccount()}
        // The server cleared the session cookie: back to the home page as a guest.
        onDone={() => {
          router.replace("/")
          router.refresh()
        }}
      />
    </div>
  )
}
