"use client";

import { useId, useRef, useState } from "react";
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import type { WarrantyTypeOption } from "./warranty";

interface Props {
  options: WarrantyTypeOption[];
  value: string;
  selectedName?: string | null;
  onValueChange: (id: string) => void;
  onAddNew: () => void;
  onOpen: () => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function AccessoryWarrantyTypeCombobox({ options, value, selectedName, onValueChange, onAddNew, onOpen, loading, error, onRetry }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const triggerId = useId();
  const selected = options.find((item) => String(item.id) === value);
  const query = search.trim().toLocaleLowerCase();
  const filtered = options.filter((item) => `${item.name} ${item.code}`.toLocaleLowerCase().includes(query));

  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (next) {
      setSearch("");
      setActive(0);
      onOpen();
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };
  const choose = (item: WarrantyTypeOption) => { onValueChange(String(item.id)); changeOpen(false); };
  const addNew = () => { changeOpen(false); onAddNew(); };

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") { event.preventDefault(); changeOpen(false); return; }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.max(0, Math.min(filtered.length - 1, active + (event.key === "ArrowDown" ? 1 : -1)));
      setActive(next);
      const nextId = filtered[next]?.id;
      if (nextId !== undefined) requestAnimationFrame(() => document.getElementById(`${listId}-${nextId}`)?.scrollIntoView({ block: "nearest" }));
      return;
    }
    if (event.key === "Enter") { event.preventDefault(); if (filtered[active]) choose(filtered[active]); }
  }

  return <Popover open={open} onOpenChange={changeOpen} triggerId={triggerId}>
    <PopoverTrigger id={triggerId} render={<Button type="button" variant="outline" role="combobox" aria-expanded={open} aria-controls={listId} aria-label="Warranty Type" className="h-9 w-full min-w-0 justify-between font-normal" />}>
      <span className={selected || selectedName ? "min-w-0 truncate text-left" : "min-w-0 truncate text-left text-muted-foreground"}>{selected?.name ?? selectedName ?? (loading ? "Loading warranty types..." : "Select warranty type")}</span>
      <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
    </PopoverTrigger>
    <PopoverContent>
      <Command>
        <div className="relative p-1">
          <Search className="pointer-events-none absolute left-3 top-3.5 size-3.5 text-muted-foreground" />
          <CommandInput ref={inputRef} aria-label="Search warranty types by name or code" role="combobox" aria-expanded={open} aria-controls={listId} aria-activedescendant={filtered[active] ? `${listId}-${filtered[active].id}` : undefined} className="pl-8" placeholder="Search warranty type..." value={search} onChange={(event) => { setSearch(event.target.value); setActive(0); document.getElementById(listId)?.scrollTo({ top: 0 }); }} onKeyDown={onKeyDown} />
        </div>
        <CommandList id={listId} aria-label="Available warranty types" className="max-h-[190px]">
          {loading ? <CommandEmpty>Loading warranty types...</CommandEmpty> : error ? <div role="alert" className="space-y-2 p-2 text-xs text-destructive"><p>{error}</p><Button type="button" size="sm" variant="outline" onClick={onRetry}>Retry</Button></div> : filtered.length === 0 ? <CommandEmpty>No warranty types found.</CommandEmpty> : <CommandGroup>{filtered.map((item, index) => <CommandItem id={`${listId}-${item.id}`} key={item.id} aria-selected={String(item.id) === value} className={index === active ? "bg-accent text-accent-foreground" : ""} onMouseEnter={() => setActive(index)} onClick={() => choose(item)}><span className="min-w-0 flex-1"><span className="block truncate">{item.name}</span><span className="block truncate font-mono text-[10px] text-muted-foreground">{item.code}</span></span>{String(item.id) === value && <Check className="size-3.5 shrink-0" />}</CommandItem>)}</CommandGroup>}
        </CommandList>
        <Separator className="my-1" />
        <Button type="button" variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={addNew}><Plus className="size-3.5" /> Add New Warranty Type</Button>
      </Command>
    </PopoverContent>
  </Popover>;
}
