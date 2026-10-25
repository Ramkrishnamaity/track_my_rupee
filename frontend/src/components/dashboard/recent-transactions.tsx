import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { getRecentTransactions } from "@/api/dashboard.apis"
import { TransactionsTable } from "@/components/transactions/transactions-table"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { loadOnServer } from "@/lib/server-load"

/** Dashboard card: the 10 latest transactions (real data). */
export function RecentTransactions() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent transactions</CardTitle>
        <CardAction>
          <Button asChild variant="secondary" size="sm" className="rounded-full">
            <Link href="/transactions">
              See all <ChevronRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        <Suspense fallback={<TransactionsTable loading />}>
          <RecentTransactionsTable />
        </Suspense>
      </CardContent>
    </Card>
  )
}

async function RecentTransactionsTable() {
  const result = await loadOnServer((client) => getRecentTransactions(10, client))
  return <TransactionsTable transactions={result?.items} loadFailed={!result} />
}
