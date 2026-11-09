"use client";

import { useId, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { AccessoryLookup } from "./types";
import type { AccessoryWarranty } from "./warranty";

interface Props {
  options: AccessoryLookup[];
  value: string;
  onValueChange: (code: string) => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  existingWarranties?: Map<string, AccessoryWarranty>;
}

export function AccessoryWarrantyAccessoryCombobox({ options, value, onValueChange, loading, error, onRetry, existingWarranties }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const triggerId = useId();
  const selected = options.find((item) => item.accessoryCode === value);
  const query = search.trim().toLocaleLowerCase();
  const filtered = options.filter((item) => !existingWarranties?.has(item.accessoryCode) && (`${item.accessoryName} ${item.accessoryCode}`).toLocaleLowerCase().includes(query));
  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (next) { setSearch(""); setActive(0); requestAnimationFrame(() => inputRef.current?.focus()); }
  };
  const choose = (item: AccessoryLookup) => { onValueChange(item.accessoryCode); changeOpen(false); };
  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") { event.preventDefault(); changeOpen(false); return; }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setActive((index) => Math.max(0, Math.min(filtered.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)))); return; }
    if (event.key === "Enter") { event.preventDefault(); if (filtered[active]) choose(filtered[active]); }
  }
  return <Popover open={open} onOpenChange={changeOpen} triggerId={triggerId}><PopoverTrigger id={triggerId} render={<Button type="button" variant="outline" role="combobox" aria-expanded={open} aria-controls={listId} aria-label="Accessory" className="h-9 w-full min-w-0 justify-between font-normal" />}><span className="min-w-0 truncate text-left">{selected ? `${selected.accessoryName} · ${selected.accessoryCode}` : "Search or select accessory..."}</span><ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" /></PopoverTrigger><PopoverContent><Command><CommandInput ref={inputRef} aria-label="Search accessories by name or code" role="combobox" aria-expanded={open} aria-controls={listId} aria-activedescendant={filtered[active] ? `${listId}-${filtered[active].id}` : undefined} placeholder="Search name or code..." value={search} onChange={(event) => { setSearch(event.target.value); setActive(0); }} onKeyDown={onKeyDown} /><CommandList id={listId} aria-label="Available accessories" className="mt-1 max-h-[280px]">{loading ? <CommandEmpty>Loading accessories...</CommandEmpty> : error ? <div role="alert" className="space-y-2 p-2 text-xs text-destructive"><p>{error}</p><Button type="button" size="sm" variant="outline" onClick={onRetry}>Retry</Button></div> : filtered.length === 0 ? <CommandEmpty>No accessories found.</CommandEmpty> : <CommandGroup>{filtered.map((item, index) => <CommandItem id={`${listId}-${item.id}`} key={item.id} aria-selected={item.accessoryCode === value} className={index === active ? "bg-accent text-accent-foreground" : ""} onMouseEnter={() => setActive(index)} onClick={() => choose(item)}><span className="min-w-0 flex-1"><span className="block truncate">{item.accessoryName}</span><span className="block truncate font-mono text-[10px] text-muted-foreground">{item.accessoryCode}</span></span>{item.accessoryCode === value && <Check className="size-3.5 shrink-0" />}</CommandItem>)}</CommandGroup>}</CommandList></Command></PopoverContent></Popover>;
}
