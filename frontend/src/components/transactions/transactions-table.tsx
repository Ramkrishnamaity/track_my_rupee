"use client"

import { useRouter } from "next/navigation"
import { ArrowLeftRight, CircleAlert, RotateCw, SearchX } from "lucide-react"

import { CATEGORY_TYPE } from "@/api/category.apis"
import { PAYMENT_METHOD_LABEL, type PaymentMethod, type Transaction } from "@/api/transaction.apis"
import { TableEmptyRow } from "@/components/app/empty-state"
import { TableLoaderRow } from "@/components/app/page-loader"
import { DeleteTransactionButton } from "@/components/transactions/delete-transaction-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate, formatINR, formatTime } from "@/lib/format"
import { cn } from "@/lib/utils"

const methodVariant: Record<PaymentMethod, "info" | "warning" | "secondary" | "income"> = {
  1: "info", // UPI
  2: "warning", // Card
  3: "secondary", // Cash
  4: "income", // Bank
}

type TransactionsTableProps = {
  transactions?: Transaction[]
  /** Show the Actions column (delete). Off for the dashboard's Recent transactions. */
  showActions?: boolean
  /** A type/category filter is applied (changes the empty message). */
  isFiltered?: boolean
  /** True while loading: header + loader row. */
  loading?: boolean
  /** True when the list couldn't be loaded. */
  loadFailed?: boolean
}

/** Shared transactions table: used on the dashboard and the Transactions page. */
export function TransactionsTable({
  transactions = [],
  showActions = false,
  isFiltered = false,
  loading = false,
  loadFailed = false,
}: TransactionsTableProps) {
  const router = useRouter()
  const columns = showActions ? 7 : 6

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Paid via</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableLoaderRow colSpan={columns} label="Loading transactions…" />
        ) : loadFailed ? (
          <TableEmptyRow
            colSpan={columns}
            tone="error"
            icon={CircleAlert}
            title="Couldn't load transactions"
            action={
              <Button variant="outline" className="rounded-xl" onClick={() => router.refresh()}>
                <RotateCw /> Try again
              </Button>
            }
          />
        ) : transactions.length === 0 ? (
          <TableEmptyRow
            colSpan={columns}
            icon={isFiltered ? SearchX : ArrowLeftRight}
            title={isFiltered ? "No transactions found" : "No transactions yet"}
          />
        ) : (
          transactions.map((t) => {
            const isIncome = t.type === CATEGORY_TYPE.income
            return (
              <TableRow key={t.id}>
                <TableCell>
                  <p className="font-medium">{t.title}</p>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: t.colourCode }} />
                    {t.categoryName}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={methodVariant[t.paymentMethod]}>
                    {PAYMENT_METHOD_LABEL[t.paymentMethod]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(t.date)}</TableCell>
                <TableCell className="text-muted-foreground">{formatTime(t.time)}</TableCell>
                <TableCell
                  className={cn(
                    "amount text-right font-semibold",
                    isIncome ? "text-income" : "text-foreground"
                  )}
                >
                  {isIncome ? "+" : "−"}
                  {formatINR(t.amount)}
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <DeleteTransactionButton transaction={t} />
                  </TableCell>
                )}
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
