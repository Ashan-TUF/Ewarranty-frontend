"use client";
import { useEffect, useState } from "react";
import { ChevronDown, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import AppHeader from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MachinePagination } from "@/features/machine/components/MachinePagination";
import { AccessoryWarrantyDialog } from "./AccessoryWarrantyDialog";
import { AccessoryWarrantyCard } from "./AccessoryWarrantyCard";
import { formatWarrantyDuration } from "./warranty-format";
import { useWarranties, useWarrantyMutations, useWarrantyTypes } from "./warranty-hooks";
import { warrantyError } from "./warranty";
import type { AccessoryWarranty, WarrantySearch } from "./warranty";

const viewStorageKey = "ewarranty-accessory-warranties-view";
type View = "table" | "cards";

export default function AccessoryWarrantiesPage() {
  const [search, setSearch] = useState<WarrantySearch>({ search: "", sortBy: "createdAt", sortDirection: "desc", page: 1, pageSize: 10 });
  const [mode, setMode] = useState<"create" | "edit" | "view" | null>(null);
  const [selected, setSelected] = useState<AccessoryWarranty | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [view, setView] = useState<View>("cards");
  const [viewReady, setViewReady] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const warranties = useWarranties(search);
  const types = useWarrantyTypes();
  const mutations = useWarrantyMutations();
  const patch = (value: Partial<WarrantySearch>) => setSearch((current) => ({ ...current, ...value, page: value.page ?? 1 }));
  const action = (item: AccessoryWarranty, next: "view" | "edit") => { setSelected(item); setMode(next); };
  const changeView = (next: View) => { setView(next); try { window.localStorage.setItem(viewStorageKey, next); } catch { /* Storage may be unavailable. */ } };
  useEffect(() => { const timer = window.setTimeout(() => { try { if (window.localStorage.getItem(viewStorageKey) === "table") setView("table"); } catch { /* Keep the default view. */ } setViewReady(true); }, 0); return () => window.clearTimeout(timer); }, []);
  const activeFilterCount = Number(!!search.search) + Number(search.warrantyTypeId !== undefined) + Number(search.isActive !== undefined);
  async function changeStatus() {
    if (!selected || mutations.status.isPending) return;
    try { await mutations.status.mutateAsync({ id: selected.id, isActive: !selected.isActive }); toast.success(`Warranty ${selected.isActive ? "deactivated" : "activated"}.`); setConfirm(false); }
    catch (error) { toast.error(warrantyError(error)); }
  }
  return <><AppHeader title="Accessory Warranties" description="Manage warranty coverage for accessories." /><main className="space-y-4 p-4 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{warranties.data?.totalCount ?? 0} warranties</p><div className="flex flex-wrap items-center gap-2"><Button type="button" variant={filtersOpen ? "secondary" : "outline"} size="sm" aria-expanded={filtersOpen} aria-controls="warranty-filters" onClick={() => setFiltersOpen((open) => !open)}><SlidersHorizontal className="size-3.5" /> Filters {activeFilterCount > 0 && <Badge variant="secondary" className="px-1 text-[10px]">{activeFilterCount}</Badge>}<ChevronDown className={`size-3.5 transition-transform duration-200 motion-reduce:transition-none ${filtersOpen ? "rotate-180" : ""}`} /></Button><TooltipProvider><div role="group" aria-label="Warranty view" className="flex rounded-md border p-0.5"><Tooltip><TooltipTrigger render={<Button type="button" size="icon-sm" variant={view === "table" ? "secondary" : "ghost"} aria-label="Table view" aria-pressed={view === "table"} onClick={() => changeView("table")} />}><List className="size-4" /></TooltipTrigger><TooltipContent>Table view</TooltipContent></Tooltip><Tooltip><TooltipTrigger render={<Button type="button" size="icon-sm" variant={view === "cards" ? "secondary" : "ghost"} aria-label="Card view" aria-pressed={view === "cards"} onClick={() => changeView("cards")} />}><LayoutGrid className="size-4" /></TooltipTrigger><TooltipContent>Card view</TooltipContent></Tooltip></div></TooltipProvider><Button size="sm" onClick={() => { setSelected(null); setMode("create"); }}>Create Warranty</Button></div></div>
    <div id="warranty-filters" className={`grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none ${filtersOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} aria-hidden={!filtersOpen} inert={!filtersOpen}><div className="min-h-0 overflow-hidden"><div className="grid gap-2 rounded-xl border bg-card p-3 sm:grid-cols-2 lg:grid-cols-5"><Input aria-label="Search accessory warranties" maxLength={200} placeholder="Search accessory code or name" value={search.search ?? ""} onChange={(event) => patch({ search: event.target.value })} /><Select value={search.warrantyTypeId ? String(search.warrantyTypeId) : "all"} onValueChange={(value) => patch({ warrantyTypeId: value === "all" ? undefined : Number(value) })}><SelectTrigger className="h-9 w-full" aria-label="Warranty type filter"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All warranty types</SelectItem>{types.data?.filter((type) => type.isActive).map((type) => <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>)}</SelectContent></Select><Select value={search.isActive === undefined ? "all" : String(search.isActive)} onValueChange={(value) => patch({ isActive: value === "all" ? undefined : value === "true" })}><SelectTrigger className="h-9 w-full" aria-label="Warranty status filter"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="true">Active</SelectItem><SelectItem value="false">Inactive</SelectItem></SelectContent></Select><Select value={search.sortBy} onValueChange={(value) => patch({ sortBy: value ?? "createdAt" })}><SelectTrigger className="h-9 w-full" aria-label="Sort warranties by"><SelectValue /></SelectTrigger><SelectContent>{[["createdAt", "Created"], ["accessorycode", "Accessory code"], ["accessoryname", "Accessory name"], ["warrantytypename", "Warranty type"], ["duration", "Duration"], ["updatedAt", "Updated"]].map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select><Select value={search.sortDirection} onValueChange={(value) => patch({ sortDirection: value as "asc" | "desc" })}><SelectTrigger className="h-9 w-full" aria-label="Sort direction"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="desc">Descending</SelectItem><SelectItem value="asc">Ascending</SelectItem></SelectContent></Select></div></div></div>
    {filtersOpen && types.isError && <p role="alert" className="flex items-center gap-2 text-xs text-destructive">Warranty types: {warrantyError(types.error)} <Button type="button" size="sm" variant="outline" onClick={() => types.refetch()}>Retry</Button></p>}
    {warranties.isError ? <p role="alert" className="text-sm text-destructive">{warrantyError(warranties.error)} <Button variant="outline" size="sm" onClick={() => warranties.refetch()}>Retry</Button></p>
      : !viewReady ? <div aria-label="Loading view preference" className="h-32 rounded-xl border border-dashed" />
      : warranties.isLoading && view === "cards" ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(260px,280px))]">{Array.from({ length: 8 }, (_, index) => <Card key={index} size="sm" className="min-h-36"><CardHeader><Skeleton className="h-4 w-3/5" /><Skeleton className="h-3 w-24" /></CardHeader><CardContent className="space-y-3"><Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-2/3" /><Skeleton className="h-8 w-full" /></CardContent></Card>)}</div>
      : !warranties.isLoading && warranties.data?.items.length === 0 ? <div className="rounded-xl border border-dashed p-8 text-center"><p className="text-sm">No warranties found</p><p className="mt-1 text-xs text-muted-foreground">Try changing the search or filters.</p></div>
      : view === "cards" ? <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[repeat(auto-fill,minmax(260px,280px))]">{warranties.data?.items.map((item) => <AccessoryWarrantyCard key={item.id} warranty={item} onView={(target) => action(target, "view")} onEdit={(target) => action(target, "edit")} onChangeStatus={(target) => { setSelected(target); setConfirm(true); }} statusPending={mutations.status.isPending} />)}</div>
      : <div className="overflow-x-auto"><Table><TableHeader><TableRow>{["Accessory", "Code", "Warranty Type", "Duration", "Status", "Actions"].map((label) => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader><TableBody>{warranties.isLoading ? Array.from({ length: 5 }, (_, index) => <TableRow key={index}>{Array.from({ length: 6 }, (_, cell) => <TableCell key={cell}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>) : warranties.data?.items.map((item) => <TableRow key={item.id}><TableCell>{item.accessoryName}</TableCell><TableCell>{item.accessoryCode}</TableCell><TableCell>{item.warrantyTypeName}</TableCell><TableCell>{formatWarrantyDuration(item.duration, item.durationUnit)}</TableCell><TableCell><Badge variant={item.isActive ? "secondary" : "destructive"}>{item.isActive ? "Active" : "Inactive"}</Badge></TableCell><TableCell><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => action(item, "view")}>View</Button><Button size="sm" variant="ghost" onClick={() => action(item, "edit")}>Edit</Button><Button size="sm" variant="ghost" onClick={() => { setSelected(item); setConfirm(true); }}>{item.isActive ? "Deactivate" : "Activate"}</Button></div></TableCell></TableRow>)}</TableBody></Table></div>}
    {!!warranties.data?.totalCount && <MachinePagination page={search.page} pageSize={search.pageSize} totalItems={warranties.data.totalCount} itemLabel="warranties" onPageChange={(page) => patch({ page })} onPageSizeChange={(pageSize) => patch({ pageSize, page: 1 })} />}
  </main><AccessoryWarrantyDialog open={!!mode} mode={mode ?? "create"} warranty={selected} onOpenChange={(open) => { if (!open) setMode(null); }} /><Dialog open={confirm} onOpenChange={setConfirm}><DialogContent><DialogHeader><DialogTitle>{selected?.isActive ? "Deactivate" : "Activate"} Warranty</DialogTitle><DialogDescription>{selected?.accessoryName}</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" disabled={mutations.status.isPending} onClick={() => setConfirm(false)}>Cancel</Button><Button disabled={mutations.status.isPending} onClick={changeStatus}>{mutations.status.isPending ? "Saving..." : "Confirm"}</Button></DialogFooter></DialogContent></Dialog></>;
}


