"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { deleteTransaction, type Transaction } from "@/api/transaction.apis"
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
import { ApiError } from "@/lib/api"
import { formatDate, formatINR } from "@/lib/format"

/** Trash button + "are you sure?" popup; deletes through the API. */
export function DeleteTransactionButton({ transaction }: { transaction: Transaction }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const { message } = await deleteTransaction(transaction.id)
      toast.success(message)
      setOpen(false)
      router.refresh() // reload the list (totals and budgets were updated on the server)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't delete the transaction")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !deleting && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Delete ${transaction.title}`}
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogMedia className="rounded-2xl bg-destructive/10 text-destructive">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{transaction.title}</span> (
            <span className="amount">{formatINR(transaction.amount)}</span>, {formatDate(transaction.date)})
            will be removed and your totals and budgets updated. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl" disabled={deleting}>
            Cancel
          </AlertDialogCancel>
          <LoadingButton
            className="rounded-xl bg-destructive text-white hover:bg-destructive/90"
            loading={deleting}
            loadingText="Deleting…"
            onClick={handleDelete}
          >
            Delete
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
