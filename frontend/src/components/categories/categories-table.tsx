"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CircleAlert, RotateCw, SearchX, Tags } from "lucide-react"
import { toast } from "sonner"

import { CATEGORY_STATUS, categoryTypeName, updateCategoryStatus, type Category } from "@/api/category.apis"
import { TableEmptyRow } from "@/components/app/empty-state"
import { TableLoaderRow } from "@/components/app/page-loader"
import { EditCategoryDialog } from "@/components/categories/category-dialogs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ApiError } from "@/lib/api"
import { cn } from "@/lib/utils"

const COLUMNS = 4

type CategoriesTableProps = {
  categories?: Category[]
  /** Any filter other than the default (all types, active) is applied. */
  isFiltered?: boolean
  /** True while the list is loading: header + loader row. */
  loading?: boolean
  /** True when the list couldn't be loaded. */
  loadFailed?: boolean
}

/** Categories table with an Actions column: active switch + edit button. */
export function CategoriesTable({
  categories = [],
  isFiltered = false,
  loading = false,
  loadFailed = false,
}: CategoriesTableProps) {
  const router = useRouter()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableLoaderRow colSpan={COLUMNS} label="Loading categories…" />
        ) : loadFailed ? (
          <TableEmptyRow
            colSpan={COLUMNS}
            tone="error"
            icon={CircleAlert}
            title="Couldn't load categories"
            action={
              <Button variant="outline" className="rounded-xl" onClick={() => router.refresh()}>
                <RotateCw /> Try again
              </Button>
            }
          />
        ) : categories.length === 0 ? (
          isFiltered ? (
            <TableEmptyRow colSpan={COLUMNS} icon={SearchX} title="No categories found" />
          ) : (
            <TableEmptyRow colSpan={COLUMNS} icon={Tags} title="No categories yet" />
          )
        ) : (
          categories.map((c) => <CategoryRow key={c.id} category={c} />)
        )}
      </TableBody>
    </Table>
  )
}

function CategoryRow({ category }: { category: Category }) {
  const router = useRouter()
  // Shown immediately (optimistic); put back if the API call fails.
  const [isActive, setIsActive] = useState(category.status === CATEGORY_STATUS.active)
  const [saving, setSaving] = useState(false)

  async function toggleStatus(next: boolean) {
    setIsActive(next)
    setSaving(true)
    try {
      const { message } = await updateCategoryStatus(
        category.id,
        next ? CATEGORY_STATUS.active : CATEGORY_STATUS.inactive
      )
      toast.success(message)
      router.refresh() // reload the list (it may now be hidden by the Status filter)
    } catch (err) {
      setIsActive(!next)
      toast.error(err instanceof ApiError ? err.message : "Couldn't update the category")
    } finally {
      setSaving(false)
    }
  }

  const type = categoryTypeName(category.type)

  return (
    <TableRow>
      <TableCell>
        <span className={cn("flex items-center gap-2.5 font-medium", !isActive && "text-muted-foreground")}>
          <span className="size-3 shrink-0 rounded-full" style={{ background: category.colourCode }} />
          {category.name}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant={type} className="capitalize">
          {type}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={isActive ? "info" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-3">
          {saving && <Spinner className="text-muted-foreground" />}
          <Switch
            checked={isActive}
            disabled={saving}
            onCheckedChange={toggleStatus}
            aria-label={`${isActive ? "Deactivate" : "Activate"} ${category.name}`}
          />
          <EditCategoryDialog category={category} />
        </div>
      </TableCell>
    </TableRow>
  )
}
