"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, CircleCheck, Link2, Package, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { accessoryError } from "./service";
import { useAccessoryOverview } from "./hooks";

const storageKey = "ewarranty-accessories-overview-expanded";

export function AccessoriesOverview() {
  const [expanded, setExpanded] = useState(true);
  const overview = useAccessoryOverview(expanded);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setExpanded(window.localStorage.getItem(storageKey) !== "false"); } catch { /* Keep the default. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  function toggle() {
    setExpanded((current) => {
      try { window.localStorage.setItem(storageKey, String(!current)); } catch { /* Keep the in-memory preference. */ }
      return !current;
    });
  }
  const metrics = [
    { label: "Total Accessories", value: overview.data?.total, icon: Package },
    { label: "Active Accessories", value: overview.data?.active, icon: CircleCheck },
    { label: "Accessory Types", value: overview.data?.typeCount, icon: Tags },
    { label: "Model Assignments", value: overview.data?.assignments, icon: Link2 },
  ];

  return <section aria-labelledby="accessories-overview-title" className="min-w-0 rounded-xl border border-border bg-card">
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
      <div className="min-w-0"><h3 id="accessories-overview-title" className="text-xs font-medium">Accessories Overview</h3><p className="text-[11px] text-muted-foreground">Inventory and model coverage at a glance</p></div>
      <Button type="button" variant="ghost" size="sm" aria-expanded={expanded} aria-controls="accessories-overview-content" onClick={toggle} className="shrink-0 gap-1.5 text-xs focus-visible:ring-2 focus-visible:ring-ring">{expanded ? "Hide" : "Show"}{expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}</Button>
    </div>
    <motion.div id="accessories-overview-content" initial={false} animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }} transition={{ duration: 0.2 }} className="min-w-0 overflow-hidden" aria-hidden={!expanded} inert={!expanded}>
      <div className="space-y-3 border-t px-3 py-3 sm:px-4">
        {overview.isError ? <div role="status" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span>Overview unavailable: {accessoryError(overview.error)}</span><Button type="button" variant="outline" size="xs" onClick={() => overview.refetch()}>Retry</Button></div> : <>
          <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 lg:grid-cols-4">
            {metrics.map(({ label, value, icon: Icon }) => <div key={label} className="min-w-0 rounded-lg border border-border/70 bg-background px-3 py-2.5 transition-colors hover:bg-muted/30"><div className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground"><Icon className="size-3.5 shrink-0 text-primary" aria-hidden="true" /><span className="truncate" title={label}>{label}</span></div>{overview.isLoading ? <Skeleton className="mt-2 h-5 w-14" /> : <p className="mt-1 text-lg font-medium leading-none tabular-nums">{value?.toLocaleString() ?? 0}</p>}</div>)}
          </div>
          <div className="min-w-0 rounded-lg border border-border/70 bg-background px-3 py-2.5"><h4 className="text-xs font-medium">Accessories by Type</h4>
            {overview.isLoading ? <div className="mt-3 space-y-3" aria-label="Loading accessory distribution">{Array.from({ length: 3 }, (_, index) => <div key={index} className="space-y-1"><Skeleton className="h-3 w-2/5" /><Skeleton className="h-1.5 w-full" /></div>)}</div> : overview.data?.distribution.length ? <div className="mt-2.5 grid gap-x-5 gap-y-2.5 md:grid-cols-2 xl:grid-cols-3">{overview.data.distribution.map((type) => { const percent = overview.data.total ? type.count / overview.data.total * 100 : 0; return <div key={type.id} className="min-w-0"><div className="mb-1 flex min-w-0 items-center justify-between gap-2 text-[11px]"><span className="min-w-0 truncate text-muted-foreground" title={type.name}>{type.name}</span><span className="shrink-0 tabular-nums">{type.count.toLocaleString()} <span className="text-muted-foreground">({percent.toFixed(1)}%)</span></span></div><div role="meter" aria-label={`${type.name} accessories`} aria-valuemin={0} aria-valuemax={overview.data.total} aria-valuenow={type.count} className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary/70" style={{ width: `${Math.min(percent, 100)}%` }} /></div></div>; })}</div> : <p className="mt-2 text-[11px] text-muted-foreground">No accessories to display yet.</p>}
          </div>
        </>}
      </div>
    </motion.div>
  </section>;
}
