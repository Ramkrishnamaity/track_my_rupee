"use client"

import { ChevronDown, ListFilter } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUpdateSearchParams } from "@/hooks/use-update-search-params"

type QueryFilterProps<T extends string> = {
  /** URL query key, e.g. "type" → ?type=income */
  param: string
  /** Shown in the dropdown and before the value on the button, e.g. "Status" */
  label: string
  value: T
  /** This value is left out of the URL. */
  defaultValue: T
  options: { value: T; label: string; /** optional color dot */ color?: string }[]
}

/** Dropdown filter stored in the URL. Changing it goes back to page 1. */
export function QueryFilter<T extends string>({
  param,
  label,
  value,
  defaultValue,
  options,
}: QueryFilterProps<T>) {
  const updateSearchParams = useUpdateSearchParams()
  const selected = options.find((o) => o.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 rounded-xl bg-card">
          <ListFilter />
          <span className="text-muted-foreground">{label}:</span>
          {selected?.color && (
            <span className="size-2 shrink-0 rounded-full" style={{ background: selected.color }} />
          )}
          <span className="max-w-32 truncate">{selected?.label ?? value}</span>
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 w-52 overflow-y-auto">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) =>
            updateSearchParams({ [param]: next === defaultValue ? null : next, page: null })
          }
        >
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              {o.color && <span className="size-2 shrink-0 rounded-full" style={{ background: o.color }} />}
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
