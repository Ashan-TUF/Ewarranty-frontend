"use client";

import { useEffect, useState } from "react";
import { ChevronDown, LayoutGrid, List, Plus, RotateCcw, Search, SlidersHorizontal, Upload, X } from "lucide-react";
import { toast } from "sonner";
import AppHeader from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MachinePagination } from "@/features/machine/components/MachinePagination";
import { useAccessories, useAccessoryMutations, useAccessoryTypeLookup } from "./hooks";
import { accessoryError } from "./service";
import { AccessoryCard } from "./AccessoryCard";
import { AccessoryFormDialog } from "./AccessoryFormDialog";
import { AccessoryDetailDialog } from "./AccessoryDetailDialog";
import { AccessoryBulkImportDialog } from "./AccessoryBulkImportDialog";
import { AccessoriesOverview } from "./AccessoriesOverview";
import { AccessoryWarrantyAction } from "./AccessoryWarrantyAction";
import { useWarrantyIndicators } from "./warranty-hooks";
import type { AccessoryListItem, AccessorySearch } from "./types";

const viewStorageKey = "ewarranty-accessories-view";
type View = "cards" | "table";

export default function AccessoryPage() {
  const [search, setSearch] = useState<AccessorySearch>({ search: "", sortBy: "createdAt", sortDirection: "desc", page: 1, pageSize: 10 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [selected, setSelected] = useState<AccessoryListItem | null>(null);
  const [statusTarget, setStatusTarget] = useState<AccessoryListItem | null>(null);
  const [view, setView] = useState<View>("cards");
  const data = useAccessories(search);
  const types = useAccessoryTypeLookup();
  const warranties = useWarrantyIndicators();
  const { status } = useAccessoryMutations();
  useEffect(() => { const timer = window.setTimeout(() => { try { if (window.localStorage.getItem(viewStorageKey) === "table") setView("table"); } catch { /* Storage may be unavailable. */ } }, 0); return () => window.clearTimeout(timer); }, []);
  const changeView = (next: View) => { setView(next); try { window.localStorage.setItem(viewStorageKey, next); } catch { /* Keep the in-memory preference. */ } };
  const updateSearch = (patch: Partial<AccessorySearch>) => setSearch((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  const activeFilterCount = Number(search.isActive !== undefined) + Number(search.accessoryTypeId !== undefined) + Number(search.sortBy !== "createdAt") + Number(search.sortDirection !== "desc");
  const isDateSort = search.sortBy === "createdAt" || search.sortBy === "updatedAt";
  const isTextSort = search.sortBy === "accessoryName" || search.sortBy === "accessoryCode";

  async function changeStatus() {
    if (!statusTarget || status.isPending) return;
    try { await status.mutateAsync({ code: statusTarget.accessoryCode, isActive: !statusTarget.isActive }); toast.success(`Accessory ${statusTarget.isActive ? "deactivated" : "activated"}.`); setStatusTarget(null); }
    catch (error) { toast.error(accessoryError(error)); }
  }

  return <><AppHeader title="Accessories" description="Manage accessories and their availability." />
    <main className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-normal">Accessories</h2><p className="text-xs text-muted-foreground">{data.isLoading ? "Loading accessories..." : data.isError ? "Accessories unavailable" : `${data.data?.totalCount ?? 0} accessories`}</p></div><div className="flex items-center gap-2"><TooltipProvider><div role="group" aria-label="Accessories view" className="flex rounded-md border p-0.5"><Tooltip><TooltipTrigger render={<Button type="button" size="icon-sm" variant={view === "cards" ? "secondary" : "ghost"} aria-label="Card view" aria-pressed={view === "cards"} onClick={() => changeView("cards")} />}><LayoutGrid className="size-4" /></TooltipTrigger><TooltipContent>Card view</TooltipContent></Tooltip><Tooltip><TooltipTrigger render={<Button type="button" size="icon-sm" variant={view === "table" ? "secondary" : "ghost"} aria-label="Table view" aria-pressed={view === "table"} onClick={() => changeView("table")} />}><List className="size-4" /></TooltipTrigger><TooltipContent>Table view</TooltipContent></Tooltip></div></TooltipProvider><Button type="button" variant="outline" size="sm" onClick={() => setBulkOpen(true)}><Upload className="size-4" /> Bulk Import</Button><Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="size-4" /> Add Accessory</Button></div></div>
      <AccessoriesOverview />
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
            <div className="grid gap-2.5 rounded-xl border border-border bg-card p-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
              <div className="space-y-1"><label id="accessory-status-label" className="text-[11px] font-normal text-muted-foreground">Status</label><Select value={search.isActive === undefined ? "all" : String(search.isActive)} onValueChange={(value) => updateSearch({ isActive: value === "all" ? undefined : value === "true" })}><SelectTrigger aria-labelledby="accessory-status-label" className="h-8 w-full text-xs font-normal"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Accessories</SelectItem><SelectItem value="true">Active</SelectItem><SelectItem value="false">Inactive</SelectItem></SelectContent></Select></div>
              <div className="space-y-1"><label id="accessory-type-filter-label" className="text-[11px] font-normal text-muted-foreground">Accessory Type</label><Select value={search.accessoryTypeId === undefined ? "all" : String(search.accessoryTypeId)} onValueChange={(value) => updateSearch({ accessoryTypeId: value === "all" ? undefined : Number(value) })}><SelectTrigger aria-labelledby="accessory-type-filter-label" className="h-8 w-full text-xs font-normal"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem>{types.data?.map((type) => <SelectItem key={type.id} value={String(type.id)}>{type.typeName}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><label id="accessory-sort-label" className="text-[11px] font-normal text-muted-foreground">Sort By</label><Select value={search.sortBy} onValueChange={(sortBy) => { if (sortBy) updateSearch({ sortBy }); }}><SelectTrigger aria-labelledby="accessory-sort-label" className="h-8 w-full text-xs font-normal"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="accessoryName">Name</SelectItem><SelectItem value="accessoryCode">Accessory Code</SelectItem><SelectItem value="assignedModelCount">Assigned Models</SelectItem><SelectItem value="createdAt">Date Added</SelectItem><SelectItem value="updatedAt">Date Updated</SelectItem></SelectContent></Select></div>
              <div className="space-y-1"><label id="accessory-order-label" className="text-[11px] font-normal text-muted-foreground">Order</label><Select value={search.sortDirection} onValueChange={(sortDirection) => updateSearch({ sortDirection: sortDirection as "asc" | "desc" })}><SelectTrigger aria-labelledby="accessory-order-label" className="h-8 w-full text-xs font-normal"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="asc">{isDateSort ? "Oldest First" : isTextSort ? "A to Z" : "Lowest First"}</SelectItem><SelectItem value="desc">{isDateSort ? "Newest First" : isTextSort ? "Z to A" : "Highest First"}</SelectItem></SelectContent></Select></div>
              <Button type="button" variant="ghost" size="sm" className="h-8 justify-start px-2 text-xs font-normal" onClick={() => setSearch((current) => ({ search: "", accessoryTypeId: undefined, sortBy: "createdAt", sortDirection: "desc", page: 1, pageSize: current.pageSize }))}><RotateCcw className="size-3.5" /> Reset Filters</Button>
            </div>
          </div>
        </div>
      </div>
      {data.isError ? <div role="alert" className="rounded-lg border border-destructive/30 p-4 text-xs text-destructive">{accessoryError(data.error)} <Button variant="outline" size="sm" onClick={() => data.refetch()}>Retry</Button></div> : view === "cards" ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{data.isLoading ? Array.from({ length: 8 }, (_, index) => <Card key={index} size="sm" className="min-h-40"><CardHeader><Skeleton className="h-4 w-3/5" /><Skeleton className="h-3 w-24" /></CardHeader><CardContent className="space-y-3"><Skeleton className="h-3 w-1/2" /><Skeleton className="h-8 w-full" /><Skeleton className="h-3 w-2/3" /></CardContent></Card>) : data.data?.items.length === 0 ? <div className="col-span-full rounded-lg border border-dashed py-10 text-center text-xs text-muted-foreground">No accessories found.</div> : data.data?.items.map((item) => <AccessoryCard key={item.accessoryCode} item={item} warranty={warranties.data ? warranties.data.get(item.accessoryCode) ?? null : undefined} onView={() => setSelected(item)} onEdit={() => { setEditing(item.accessoryCode); setFormOpen(true); }} onChangeStatus={() => setStatusTarget(item)} statusPending={status.isPending} />)}</div> : <Table><TableHeader><TableRow>{["Accessory Code", "Accessory Name", "Accessory Type", "Description", "Assigned Models", "Status", "Warranty", "Actions"].map((heading) => <TableHead key={heading} className="text-[11px] font-normal">{heading}</TableHead>)}</TableRow></TableHeader><TableBody>{data.isLoading ? Array.from({ length: 5 }, (_, index) => <TableRow key={index}>{Array.from({ length: 8 }, (_, cell) => <TableCell key={cell}><Skeleton className="h-4 w-16" /></TableCell>)}</TableRow>) : data.data?.items.length === 0 ? <TableRow><TableCell colSpan={8} className="py-10 text-center text-xs text-muted-foreground">No accessories found.</TableCell></TableRow> : data.data?.items.map((item) => <TableRow key={item.accessoryCode} className="text-xs"><TableCell><span className="text-xs font-normal text-muted-foreground">{item.accessoryCode}</span></TableCell><TableCell>{item.accessoryName}</TableCell><TableCell>{item.accessoryTypeName}</TableCell><TableCell className="max-w-52 truncate text-muted-foreground" title={item.description || undefined}>{item.description || "—"}</TableCell><TableCell>{item.assignedModelCount}</TableCell><TableCell><Badge variant={item.isActive ? "secondary" : "destructive"}>{item.isActive ? "Active" : "Inactive"}</Badge></TableCell><TableCell><AccessoryWarrantyAction accessory={item} known={warranties.data ? warranties.data.get(item.accessoryCode) ?? null : undefined} /></TableCell><TableCell><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => setSelected(item)}>View</Button><Button variant="ghost" size="sm" onClick={() => { setEditing(item.accessoryCode); setFormOpen(true); }}>Edit</Button><Button variant="ghost" size="sm" onClick={() => setStatusTarget(item)}>{item.isActive ? "Deactivate" : "Activate"}</Button></div></TableCell></TableRow>)}</TableBody></Table>}
      {!!data.data?.totalCount && <MachinePagination page={search.page} pageSize={search.pageSize} totalItems={data.data.totalCount} itemLabel="accessories" onPageChange={(page) => updateSearch({ page })} onPageSizeChange={(pageSize) => updateSearch({ pageSize, page: 1 })} />}
    </main>
    <AccessoryFormDialog code={editing} open={formOpen} onOpenChange={setFormOpen} />
    {bulkOpen && <AccessoryBulkImportDialog open onOpenChange={setBulkOpen} />}
    <AccessoryDetailDialog item={selected} onOpenChange={(open) => { if (!open) setSelected(null); }} />
    <Dialog open={!!statusTarget} onOpenChange={(open) => { if (!open && !status.isPending) setStatusTarget(null); }}><DialogContent><DialogHeader><DialogTitle>{statusTarget?.isActive ? "Deactivate" : "Activate"} Accessory</DialogTitle><DialogDescription>Change the master status of {statusTarget?.accessoryName}?</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" disabled={status.isPending} onClick={() => setStatusTarget(null)}>Cancel</Button><Button disabled={status.isPending} onClick={changeStatus}>{status.isPending ? "Saving..." : "Confirm"}</Button></DialogFooter></DialogContent></Dialog>
  </>;
}




