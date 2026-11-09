"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, ChevronUp, Eye, LayoutGrid, List, MoreHorizontal, Pencil, Plus, Power, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import AppHeader from "@/components/layout/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MachinePagination } from "@/features/machine/components/MachinePagination";
import { useAccessoryType, useAccessoryTypeMutations, useAccessoryTypes } from "./hooks";
import { accessoryError } from "./service";
import type { AccessoryTypeResponse, AccessoryTypeSearchRequest } from "./types";

const defaults: AccessoryTypeSearchRequest = { search: "", sortBy: "typeName", sortDirection: "asc", page: 1, pageSize: 10 };
const schema = z.object({ typeName: z.string().trim().min(1, "Type name is required.").max(100), description: z.string().trim().max(500) });
type Values = z.infer<typeof schema>;
const date = (value: string | null) => value ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value)) : "—";

const viewStorageKey = "ewarranty-accessory-types-view";
type View = "cards" | "table";

export default function AccessoryTypesPage() {
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState<AccessoryTypeSearchRequest>(defaults);
  const [editing, setEditing] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<AccessoryTypeResponse | null>(null);
  const [view, setView] = useState<View>("cards");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const data = useAccessoryTypes(query);
  const mutations = useAccessoryTypeMutations();
  useEffect(() => { const timer = window.setTimeout(() => setQuery((current) => current.search === searchText.trim() ? current : { ...current, search: searchText.trim(), page: 1 }), 300); return () => window.clearTimeout(timer); }, [searchText]);
  useEffect(() => { const timer = window.setTimeout(() => { try { if (window.localStorage.getItem(viewStorageKey) === "table") setView("table"); } catch { /* Storage may be unavailable. */ } }, 0); return () => window.clearTimeout(timer); }, []);
  const changeView = (next: View) => { setView(next); try { window.localStorage.setItem(viewStorageKey, next); } catch { /* Keep the in-memory preference. */ } };
  const patch = (value: Partial<AccessoryTypeSearchRequest>) => setQuery((current) => ({ ...current, ...value, page: value.page ?? current.page }));
  const activeFilterCount = Number(query.isActive !== undefined) + Number(query.sortBy !== "typeName") + Number(query.sortDirection !== "asc");
  const hasFilters = !!searchText.trim() || !!query.search || activeFilterCount > 0;
  const clearFilters = () => {
    if (!hasFilters) return;
    setSearchText("");
    setQuery((current) => ({ ...defaults, pageSize: current.pageSize }));
  };
  const sortLabels: Record<AccessoryTypeSearchRequest["sortBy"], string> = { id: "ID", typeCode: "Type Code", typeName: "Type Name", accessoryCount: "Accessory Count", createdAt: "Created Date", updatedAt: "Updated Date" };

  async function changeStatus() {
    if (!statusTarget || mutations.status.isPending) return;
    try { await mutations.status.mutateAsync({ code: statusTarget.typeCode, isActive: !statusTarget.isActive }); toast.success(`Accessory type ${statusTarget.isActive ? "deactivated" : "activated"}.`); setStatusTarget(null); }
    catch (error) { toast.error(accessoryError(error)); }
  }

  return <><AppHeader title="Accessory Types" description="Manage accessory classifications and availability." />
    <main className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{data.isLoading ? "Loading accessory types..." : data.isError ? "Accessory types unavailable" : `${data.data?.totalCount ?? 0} accessory types`}</p><div className="flex items-center gap-2"><TooltipProvider><div role="group" aria-label="Accessory type view" className="flex rounded-md border p-0.5"><Tooltip><TooltipTrigger render={<Button type="button" size="icon-sm" variant={view === "cards" ? "secondary" : "ghost"} aria-label="Card view" aria-pressed={view === "cards"} onClick={() => changeView("cards")} />}><LayoutGrid className="size-4" /></TooltipTrigger><TooltipContent>Card view</TooltipContent></Tooltip><Tooltip><TooltipTrigger render={<Button type="button" size="icon-sm" variant={view === "table" ? "secondary" : "ghost"} aria-label="Table view" aria-pressed={view === "table"} onClick={() => changeView("table")} />}><List className="size-4" /></TooltipTrigger><TooltipContent>Table view</TooltipContent></Tooltip></div></TooltipProvider><Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="size-4" />Create Accessory Type</Button></div></div>
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="w-full max-w-[380px] space-y-1 sm:w-[360px]"><label htmlFor="type-search" className="text-[11px] text-muted-foreground">Search Accessory Types</label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input id="type-search" className="h-9 border-border bg-background pl-9 pr-8 text-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30" placeholder="Search types..." maxLength={200} value={searchText} onChange={(event) => setSearchText(event.target.value)} />{searchText && <button type="button" aria-label="Clear search" className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40" onClick={() => setSearchText("")}><X className="size-3.5" /></button>}</div></div>
          <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg border-border px-2.5 text-xs font-normal transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/40" aria-expanded={filtersOpen} aria-controls="accessory-type-filters" onClick={() => setFiltersOpen((current) => !current)}><SlidersHorizontal className="size-3.5" />{filtersOpen ? "Hide Filters" : "Filters"}{activeFilterCount > 0 && <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px] font-normal">{activeFilterCount}</Badge>}{filtersOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}</Button>
        </div>
        <div id="accessory-type-filters" aria-hidden={!filtersOpen} inert={!filtersOpen} className={`grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none ${filtersOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="min-h-0 overflow-hidden">
            <div className="grid gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-2 lg:grid-cols-[minmax(130px,1fr)_minmax(160px,1.2fr)_minmax(130px,1fr)_auto] lg:items-end">
              <div className="min-w-0 space-y-1.5"><label className="text-[11px] text-muted-foreground" id="type-status-label">Status</label><Select value={query.isActive === undefined ? "all" : String(query.isActive)} onValueChange={(value) => patch({ isActive: value === "all" ? undefined : value === "true", page: 1 })}><SelectTrigger aria-labelledby="type-status-label" className="h-9 w-full min-w-0 border-border bg-background text-xs focus-visible:ring-2 focus-visible:ring-ring/30"><SelectValue>{query.isActive === undefined ? "All Statuses" : query.isActive ? "Active" : "Inactive"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="true">Active</SelectItem><SelectItem value="false">Inactive</SelectItem></SelectContent></Select></div>
              <div className="min-w-0 space-y-1.5"><label className="text-[11px] text-muted-foreground" id="type-sort-label">Sort By</label><Select value={query.sortBy} onValueChange={(value) => { if (value) patch({ sortBy: value as AccessoryTypeSearchRequest["sortBy"], page: 1 }); }}><SelectTrigger aria-labelledby="type-sort-label" className="h-9 w-full min-w-0 border-border bg-background text-xs focus-visible:ring-2 focus-visible:ring-ring/30"><SelectValue>{sortLabels[query.sortBy]}</SelectValue></SelectTrigger><SelectContent>{(Object.keys(sortLabels) as AccessoryTypeSearchRequest["sortBy"][]).map((field) => <SelectItem key={field} value={field}>{sortLabels[field]}</SelectItem>)}</SelectContent></Select></div>
              <div className="min-w-0 space-y-1.5"><label className="text-[11px] text-muted-foreground" id="type-order-label">Order</label><Select value={query.sortDirection} onValueChange={(value) => { if (value) patch({ sortDirection: value as "asc" | "desc", page: 1 }); }}><SelectTrigger aria-labelledby="type-order-label" className="h-9 w-full min-w-0 border-border bg-background text-xs focus-visible:ring-2 focus-visible:ring-ring/30"><SelectValue>{query.sortDirection === "asc" ? "Ascending" : "Descending"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="asc">Ascending</SelectItem><SelectItem value="desc">Descending</SelectItem></SelectContent></Select></div>
              <Button type="button" variant="outline" size="sm" className="h-9 w-full gap-1.5 text-xs font-normal sm:w-auto lg:justify-self-end" disabled={!hasFilters} onClick={clearFilters}><RotateCcw className="size-3.5" />Clear Filters</Button>
            </div>
          </div>
        </div>
      </div>
      {data.isError ? <div role="alert" className="rounded-lg border border-destructive/30 p-4 text-xs text-destructive">{accessoryError(data.error)} <Button variant="outline" size="sm" className="ml-2" onClick={() => data.refetch()}>Retry</Button></div> : view === "cards" ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{data.isLoading ? Array.from({ length: 8 }, (_, index) => <Card key={index} size="sm" className="min-h-40"><CardHeader><Skeleton className="h-4 w-3/5" /><Skeleton className="h-4 w-20" /></CardHeader><CardContent className="space-y-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-full" /><Skeleton className="h-3 w-2/3" /></CardContent></Card>) : data.data?.items.length === 0 ? <div className="col-span-full rounded-lg border border-dashed py-10 text-center text-xs text-muted-foreground">No accessory types found.{hasFilters && <Button type="button" variant="outline" size="sm" className="ml-2" onClick={clearFilters}>Clear Filters</Button>}</div> : data.data?.items.map((item) => <AccessoryTypeCard key={item.typeCode} item={item} onView={() => setViewing(item.typeCode)} onEdit={() => { setEditing(item.typeCode); setFormOpen(true); }} onStatus={() => setStatusTarget(item)} statusPending={mutations.status.isPending} />)}</div> : <Table><TableHeader><TableRow>{["Type Code", "Type Name", "Description", "Accessories", "Status", "Created", "Updated", "Actions"].map((heading) => <TableHead key={heading} className="text-[11px] font-normal">{heading}</TableHead>)}</TableRow></TableHeader><TableBody>{data.isLoading ? Array.from({ length: 5 }, (_, index) => <TableRow key={index}>{Array.from({ length: 8 }, (_, cell) => <TableCell key={cell}><Skeleton className="h-4 w-16" /></TableCell>)}</TableRow>) : data.data?.items.length === 0 ? <TableRow><TableCell colSpan={8} className="py-10 text-center text-xs text-muted-foreground">No accessory types found.{hasFilters && <Button type="button" variant="outline" size="sm" className="ml-2" onClick={clearFilters}>Clear Filters</Button>}</TableCell></TableRow> : data.data?.items.map((item) => <TableRow key={item.typeCode} className="text-xs"><TableCell><span className="text-xs font-normal text-muted-foreground">{item.typeCode}</span></TableCell><TableCell>{item.typeName}</TableCell><TableCell className="max-w-52 truncate text-muted-foreground" title={item.description || undefined}>{item.description || "—"}</TableCell><TableCell>{item.accessoryCount}</TableCell><TableCell><Badge variant={item.isActive ? "secondary" : "destructive"}>{item.isActive ? "Active" : "Inactive"}</Badge></TableCell><TableCell>{date(item.createdAt)}</TableCell><TableCell>{date(item.updatedAt)}</TableCell><TableCell><TypeActions item={item} onView={() => setViewing(item.typeCode)} onEdit={() => { setEditing(item.typeCode); setFormOpen(true); }} onStatus={() => setStatusTarget(item)} /></TableCell></TableRow>)}</TableBody></Table>}
      {!!data.data?.totalCount && <MachinePagination page={query.page} pageSize={query.pageSize} totalItems={data.data.totalCount} itemLabel="accessory types" onPageChange={(page) => patch({ page })} onPageSizeChange={(pageSize) => patch({ pageSize, page: 1 })} />}
    </main>
    <AccessoryTypeForm key={`${editing || "create"}-${formOpen}`} code={editing} open={formOpen} onOpenChange={setFormOpen} />
    <AccessoryTypeDetails code={viewing} onOpenChange={(open) => { if (!open) setViewing(null); }} />
    <Dialog open={!!statusTarget} onOpenChange={(open) => { if (!open && !mutations.status.isPending) setStatusTarget(null); }}><DialogContent className="sm:max-w-[420px]"><DialogHeader><DialogTitle>{statusTarget?.isActive ? "Deactivate" : "Activate"} Accessory Type</DialogTitle><DialogDescription>{statusTarget?.isActive ? "Inactive types cannot be selected for new accessories. Existing accessory relationships remain in place." : "This type will become available for new accessories."}</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" disabled={mutations.status.isPending} onClick={() => setStatusTarget(null)}>Cancel</Button><Button disabled={mutations.status.isPending} onClick={changeStatus}>{mutations.status.isPending ? "Saving..." : "Confirm"}</Button></DialogFooter></DialogContent></Dialog>
  </>;
}

function AccessoryTypeCard({ item, onView, onEdit, onStatus, statusPending }: { item: AccessoryTypeResponse; onView: () => void; onEdit: () => void; onStatus: () => void; statusPending: boolean }) {
  return <Card size="sm" className="min-h-40 transition-colors hover:ring-foreground/20">
    <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2"><div className="min-w-0"><CardTitle className="truncate" title={item.typeName}>{item.typeName}</CardTitle><Badge variant={item.isActive ? "secondary" : "destructive"} className="mt-1">{item.isActive ? "Active" : "Inactive"}</Badge></div><TooltipProvider><div className="flex shrink-0 items-center gap-0.5" onClick={(event) => event.stopPropagation()}><Tooltip><TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" className="size-[26px] shrink-0 p-0 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="View Details" onClick={onView} />}><Eye className="size-3.5" /></TooltipTrigger><TooltipContent side="bottom">View Details</TooltipContent></Tooltip><Tooltip><TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" className="size-[26px] shrink-0 p-0 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Edit Accessory Type" onClick={onEdit} />}><Pencil className="size-3.5" /></TooltipTrigger><TooltipContent side="bottom">Edit Accessory Type</TooltipContent></Tooltip><Tooltip><TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" className="size-[26px] shrink-0 p-0 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label={item.isActive ? "Deactivate Accessory Type" : "Activate Accessory Type"} disabled={statusPending} onClick={onStatus} />}><Power className="size-3.5" /></TooltipTrigger><TooltipContent side="bottom">{item.isActive ? "Deactivate Accessory Type" : "Activate Accessory Type"}</TooltipContent></Tooltip></div></TooltipProvider></CardHeader>
    <CardContent className="flex flex-1 flex-col gap-2 text-xs"><span className="text-xs font-normal text-muted-foreground">{item.typeCode}</span>{item.description ? <TooltipProvider delay={250}><Tooltip><TooltipTrigger render={<p tabIndex={0} className="line-clamp-2 min-h-8 cursor-help rounded-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40" />}>{item.description}</TooltipTrigger><TooltipContent side="top" align="start" sideOffset={8} showArrow={false} className="max-w-[min(320px,calc(100vw-2rem))] rounded-lg border border-border bg-popover px-3 py-2 text-xs leading-relaxed text-popover-foreground shadow-md wrap-break-word">{item.description}</TooltipContent></Tooltip></TooltipProvider> : <p className="min-h-8 text-muted-foreground">No description</p>}<dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-1 border-t pt-2"><div><dt className="text-muted-foreground">Accessories</dt><dd>{item.accessoryCount}</dd></div><div><dt className="text-muted-foreground">Created</dt><dd>{date(item.createdAt)}</dd></div>{item.updatedAt && <div className="col-span-2"><dt className="text-muted-foreground">Updated</dt><dd>{date(item.updatedAt)}</dd></div>}</dl></CardContent>
  </Card>;
}

function AccessoryTypeForm({ code, open, onOpenChange }: { code: string | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const detail = useAccessoryType(open ? code : null);
  const { create, update } = useAccessoryTypeMutations();
  const form = useForm<Values>({ resolver: zodResolver(schema), values: { typeName: detail.data?.typeName || "", description: detail.data?.description || "" } });
  const pending = create.isPending || update.isPending;
  async function submit(values: Values) {
    if (pending) return;
    const payload = { typeName: values.typeName.trim(), description: values.description.trim() || null };
    try { if (code) await update.mutateAsync({ code, payload }); else await create.mutateAsync(payload); toast.success(code ? "Accessory type updated." : "Accessory type created."); onOpenChange(false); }
    catch (error) { toast.error(accessoryError(error)); }
  }
  return <Dialog open={open} onOpenChange={(next) => { if (!pending) onOpenChange(next); }}><DialogContent className="sm:max-w-[440px]"><DialogHeader><DialogTitle>{code ? "Edit Accessory Type" : "Create Accessory Type"}</DialogTitle><DialogDescription>{code ? `Update ${code}. The type code cannot be changed.` : "The type code is generated automatically."}</DialogDescription></DialogHeader>{code && detail.isLoading ? <Skeleton className="h-32" /> : code && detail.isError ? <p className="text-xs text-destructive">{accessoryError(detail.error)}</p> : <form id="accessory-type-form" className="space-y-3" onSubmit={form.handleSubmit(submit)}><div className="space-y-1"><label htmlFor="typeName" className="text-xs">Type Name</label><Input id="typeName" maxLength={100} {...form.register("typeName")} />{form.formState.errors.typeName && <p className="text-xs text-destructive">{form.formState.errors.typeName.message}</p>}</div><div className="space-y-1"><label htmlFor="typeDescription" className="text-xs">Description</label><Textarea id="typeDescription" maxLength={500} rows={3} {...form.register("description")} />{form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}</div></form>}<DialogFooter><Button variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" form="accessory-type-form" disabled={pending || !!(code && !detail.data)}>{pending ? "Saving..." : "Save Changes"}</Button></DialogFooter></DialogContent></Dialog>;
}

function AccessoryTypeDetails({ code, onOpenChange }: { code: string | null; onOpenChange: (open: boolean) => void }) {
  const detail = useAccessoryType(code);
  return <Dialog open={!!code} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-[440px]"><DialogHeader><DialogTitle>Accessory Type</DialogTitle><DialogDescription>{code}</DialogDescription></DialogHeader>{detail.isLoading ? <Skeleton className="h-28" /> : detail.isError ? <p className="text-xs text-destructive">{accessoryError(detail.error)}</p> : detail.data && <dl className="grid grid-cols-2 gap-3 text-xs"><div><dt className="text-muted-foreground">Name</dt><dd>{detail.data.typeName}</dd></div><div><dt className="text-muted-foreground">Status</dt><dd>{detail.data.isActive ? "Active" : "Inactive"}</dd></div><div className="col-span-2"><dt className="text-muted-foreground">Description</dt><dd>{detail.data.description || "—"}</dd></div><div><dt className="text-muted-foreground">Accessories</dt><dd>{detail.data.accessoryCount}</dd></div><div><dt className="text-muted-foreground">Created</dt><dd>{date(detail.data.createdAt)}</dd></div><div><dt className="text-muted-foreground">Updated</dt><dd>{date(detail.data.updatedAt)}</dd></div></dl>}</DialogContent></Dialog>;
}

function TypeActions({ item, onView, onEdit, onStatus }: { item: AccessoryTypeResponse; onView: () => void; onEdit: () => void; onStatus: () => void }) {
  return <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${item.typeName}`} />}><MoreHorizontal className="size-4" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={onView}>View details</DropdownMenuItem><DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem><DropdownMenuItem onClick={onStatus}>{item.isActive ? "Deactivate" : "Activate"}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;
}
