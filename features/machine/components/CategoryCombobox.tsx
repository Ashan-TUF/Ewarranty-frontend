"use client";

import { useRef } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import type { MachineCategoryOption } from "../types/machine";
import { cn } from "@/lib/utils";

function categoryLabel(name: string) {
  const labels: Record<string, string> = {
    MultifunctionPrinter: "Multifunction Printer",
    NoteCounter: "Note Counter",
    CoinCounter: "Coin Counter",
    POSPrinter: "POS Printer",
    POSScanner: "POS Scanner",
    POSDisplay: "POS Display",
  };
  return labels[name] ?? name;
}

interface CategoryComboboxProps {
  categories: MachineCategoryOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  loading?: boolean;
  invalid?: boolean;
}

export function CategoryCombobox({ categories, value, onChange, onBlur, disabled, loading, invalid }: CategoryComboboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const names = categories.map((category) => category.name);

  return <Combobox.Root
    items={names}
    value={value || null}
    onValueChange={(next) => onChange(next ?? "")}
    itemToStringLabel={categoryLabel}
    filter={(item, query) => categoryLabel(item).toLocaleLowerCase().includes(query.toLocaleLowerCase())}
    autoHighlight
  >
    <Combobox.Label className="sr-only">Category</Combobox.Label>
    <Combobox.Trigger
      id="category"
      type="button"
      disabled={disabled}
      aria-invalid={invalid || undefined}
      onBlur={onBlur}
      className={cn("flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-muted/25 px-2.5 text-left text-[13px] font-normal text-foreground transition-colors hover:border-foreground/30 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50", invalid && "border-destructive focus-visible:ring-destructive")}
    >
      <span className={cn("min-w-0 flex-1 truncate", !value && "text-muted-foreground")}>{value ? categoryLabel(value) : loading ? "Loading categories..." : disabled ? "Categories unavailable" : "Select a category"}</span>
      <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Combobox.Trigger>
    <Combobox.Portal>
      <Combobox.Positioner side="bottom" align="start" sideOffset={4} collisionAvoidance={{ side: "flip", align: "shift" }} className="isolate z-[60] w-(--anchor-width)">
        <Combobox.Popup initialFocus={inputRef} className="max-h-[min(240px,var(--available-height))] overflow-hidden rounded-[10px] border border-border bg-popover text-popover-foreground shadow-sm outline-none">
          <div className="flex items-center gap-2 border-b border-border/70 px-2.5">
            <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <Combobox.Input ref={inputRef} aria-label="Search categories" placeholder="Search categories..." className="h-9 min-w-0 flex-1 bg-transparent text-xs font-normal outline-none placeholder:text-muted-foreground" />
          </div>
          <Combobox.Empty className="text-xs font-normal text-muted-foreground"><span className="block px-3 py-3">No categories found</span></Combobox.Empty>
          <Combobox.List className="max-h-[190px] overflow-y-auto overscroll-contain p-1">
            {(name: string) => <Combobox.Item key={name} value={name} className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs font-normal outline-none data-[highlighted]:bg-muted data-[selected]:text-foreground">
              <span className="truncate">{categoryLabel(name)}</span>
              <Combobox.ItemIndicator><Check className="size-3.5 text-primary" aria-hidden="true" /></Combobox.ItemIndicator>
            </Combobox.Item>}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>;
}
