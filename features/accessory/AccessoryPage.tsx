"use client";

import { useState } from "react";
import { ChevronDown, Plus, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import AppHeader from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MachinePagination } from "@/features/machine/components/MachinePagination";
import { useAccessories, useAccessoryMutations } from "./hooks";
import { accessoryError } from "./service";
import { AccessoryFormDialog } from "./AccessoryFormDialog";
import { AccessoryDetailDialog } from "./AccessoryDetailDialog";
import { AccessoryCard } from "./AccessoryCard";
import type { AccessoryListItem, AccessorySearch } from "./types";

export default function AccessoryPage() {
  const [search, setSearch] = useState<AccessorySearch>({ search: "", sortBy: "accessoryName", sortDirection: "asc", page: 1, pageSize: 10 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<AccessoryListItem | null>(null);
  const [statusTarget, setStatusTarget] = useState<AccessoryListItem | null>(null);
  const data = useAccessories(search);
  const { status } = useAccessoryMutations();
  const updateSearch = (patch: Partial<AccessorySearch>) => setSearch((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  const activeFilterCount = Number(search.isActive !== undefined) + Number(search.sortBy !== "accessoryName") + Number(search.sortDirection !== "asc");
  const isDateSort = search.sortBy === "createdAt" || search.sortBy === "updatedAt";
  const isTextSort = search.sortBy === "accessoryName" || search.sortBy === "accessoryCode";

  async function changeStatus() {
    if (!statusTarget || status.isPending) return;
    try { await status.mutateAsync({ code: statusTarget.accessoryCode, isActive: !statusTarget.isActive }); toast.success(`Accessory ${statusTarget.isActive ? "deactivated" : "activated"}.`); setStatusTarget(null); }
    catch (error) { toast.error(accessoryError(error)); }
  }

  return <><AppHeader title="Accessories" description="Manage accessories and their availability." />
    <main className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-normal">Accessories</h2><p className="text-xs text-muted-foreground">{data.data?.totalCount ?? 0} accessories</p></div><Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="size-4" /> Add Accessory</Button></div>
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full min-w-0 sm:max-w-[360px] sm:flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input aria-label="Search accessories" placeholder="Search accessories..." className="h-9 pl-8 pr-8 text-xs font-normal" maxLength={200} value={search.search} onChange={(e) => updateSearch({ search: e.target.value })} />
            {search.search && <button type="button" aria-label="Clear search" className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => updateSearch({ search: "" })}><X className="size-3.5" /></button>}
          </div>
          <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5 px-2.5 text-xs font-normal" aria-expanded={filtersOpen} aria-controls="accessory-filters" onClick={() => setFiltersOpen((open) => !open)}>
            <SlidersHorizontal className="size-3.5" /> Filters
            {activeFilterCount > 0 && <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px] font-normal">{activeFilterCount}</Badge>}
            <ChevronDown className={`size-3.5 transition-transform duration-200 motion-reduce:transition-none ${filtersOpen ? "rotate-180" : ""}`} />
          </Button>
        </div>
        <div id="accessory-filters" className={`grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none ${filtersOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} aria-hidden={!filtersOpen} inert={!filtersOpen}>
          <div className="min-h-0 overflow-hidden">
            <div className="grid gap-2.5 rounded-xl border border-border bg-card p-3 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end">
              <div className="space-y-1"><label id="accessory-status-label" className="text-[11px] font-normal text-muted-foreground">Status</label><Select value={search.isActive === undefined ? "all" : String(search.isActive)} onValueChange={(value) => updateSearch({ isActive: value === "all" ? undefined : value === "true" })}><SelectTrigger aria-labelledby="accessory-status-label" className="h-8 w-full text-xs font-normal"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Accessories</SelectItem><SelectItem value="true">Active</SelectItem><SelectItem value="false">Inactive</SelectItem></SelectContent></Select></div>
              <div className="space-y-1"><label id="accessory-sort-label" className="text-[11px] font-normal text-muted-foreground">Sort By</label><Select value={search.sortBy} onValueChange={(sortBy) => { if (sortBy) updateSearch({ sortBy }); }}><SelectTrigger aria-labelledby="accessory-sort-label" className="h-8 w-full text-xs font-normal"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="accessoryName">Name</SelectItem><SelectItem value="accessoryCode">Accessory Code</SelectItem><SelectItem value="assignedModelCount">Assigned Models</SelectItem><SelectItem value="createdAt">Date Added</SelectItem><SelectItem value="updatedAt">Date Updated</SelectItem></SelectContent></Select></div>
              <div className="space-y-1"><label id="accessory-order-label" className="text-[11px] font-normal text-muted-foreground">Order</label><Select value={search.sortDirection} onValueChange={(sortDirection) => updateSearch({ sortDirection: sortDirection as "asc" | "desc" })}><SelectTrigger aria-labelledby="accessory-order-label" className="h-8 w-full text-xs font-normal"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="asc">{isDateSort ? "Oldest First" : isTextSort ? "A to Z" : "Lowest First"}</SelectItem><SelectItem value="desc">{isDateSort ? "Newest First" : isTextSort ? "Z to A" : "Highest First"}</SelectItem></SelectContent></Select></div>
              <Button type="button" variant="ghost" size="sm" className="h-8 justify-start px-2 text-xs font-normal" onClick={() => setSearch((current) => ({ search: "", sortBy: "accessoryName", sortDirection: "asc", page: 1, pageSize: current.pageSize }))}><RotateCcw className="size-3.5" /> Reset Filters</Button>
            </div>
          </div>
        </div>
      </div>
      {data.isLoading ? <p className="text-sm text-muted-foreground">Loading accessories...</p> : data.isError ? <p className="text-sm text-destructive">{accessoryError(data.error)}</p> : data.data?.items.length === 0 ? <div className="rounded-xl border border-dashed py-12 text-center"><p className="font-medium">No accessories found</p><p className="mt-1 text-sm text-muted-foreground">Try changing the search or filters.</p></div> : <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{data.data?.items.map((item) => <AccessoryCard key={item.accessoryCode} item={item} onView={() => setSelected(item)} onEdit={() => { setEditing(item.accessoryCode); setFormOpen(true); }} onChangeStatus={() => setStatusTarget(item)} />)}</div>}
      {!!data.data?.totalCount && <MachinePagination page={search.page} pageSize={search.pageSize} totalItems={data.data.totalCount} itemLabel="accessories" onPageChange={(page) => updateSearch({ page })} onPageSizeChange={(pageSize) => updateSearch({ pageSize })} />}
    </main>
    <AccessoryFormDialog code={editing} open={formOpen} onOpenChange={setFormOpen} />
    <AccessoryDetailDialog item={selected} onOpenChange={(open) => { if (!open) setSelected(null); }} />
    <Dialog open={!!statusTarget} onOpenChange={(open) => { if (!open && !status.isPending) setStatusTarget(null); }}><DialogContent><DialogHeader><DialogTitle>{statusTarget?.isActive ? "Deactivate" : "Activate"} Accessory</DialogTitle><DialogDescription>Change the master status of {statusTarget?.accessoryName}?</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" disabled={status.isPending} onClick={() => setStatusTarget(null)}>Cancel</Button><Button disabled={status.isPending} onClick={changeStatus}>{status.isPending ? "Saving..." : "Confirm"}</Button></DialogFooter></DialogContent></Dialog>
  </>;
}
