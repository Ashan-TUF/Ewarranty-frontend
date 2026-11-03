"use client";

import Link from "next/link";
import { ArrowUpRight, Boxes, CalendarDays, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { MachineResponse } from "../../types/machine";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function MachineCard({ machine }: { machine: MachineResponse }) {
  const modelsCount = machine.models.length;
  const warrantiesCount = machine.models.reduce((sum, model) => sum + model.warranties.length, 0);
  const coveredModelsCount = machine.models.filter((model) => model.warranties.some((warranty) => warranty.isActive)).length;
  const warrantyStatus = modelsCount === 0 || coveredModelsCount === 0
    ? "Not covered"
    : coveredModelsCount === modelsCount
      ? "Covered"
      : "Partially covered";

  return <Card size="sm" className="min-w-0 rounded-xl border border-border/70 bg-card shadow-none transition-[background-color,border-color] duration-200 hover:border-primary/30 hover:bg-muted/10 motion-reduce:transition-none">
    <CardContent className="flex h-full flex-col gap-2.5 px-3.5">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="h-4.5 px-1.5 py-0 text-[10px] font-normal">{machine.machineCode}</Badge>
          <span className={cn("inline-flex items-center gap-1 text-[10px] font-normal", machine.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}><span className={cn("size-1.5 rounded-full", machine.isActive ? "bg-emerald-500" : "bg-muted-foreground")} aria-hidden="true" />{machine.isActive ? "Active" : "Inactive"}</span>
        </div>
        <Badge variant="secondary" className="max-w-[42%] truncate px-1.5 text-[10px] font-normal" title={machine.category}>{machine.category}</Badge>
      </div>

      <h3 className="line-clamp-2 min-w-0 text-[13px] leading-tight font-normal text-foreground" title={machine.machineName}>{machine.machineName}</h3>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-normal text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Boxes className="size-3.5" aria-hidden="true" />{modelsCount} {modelsCount === 1 ? "model" : "models"}</span>
        <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5" aria-hidden="true" />{warrantiesCount} {warrantiesCount === 1 ? "warranty" : "warranties"}</span>
        <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" aria-hidden="true" />{formatDate(machine.createdAt)}</span>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-border/60 pt-1.5">
        <span className={cn("inline-flex items-center gap-1 text-[11px] font-normal", coveredModelsCount === modelsCount && modelsCount > 0 ? "text-emerald-700 dark:text-emerald-400" : coveredModelsCount > 0 ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground")} title={`${coveredModelsCount} of ${modelsCount} models covered`}><ShieldCheck className="size-3.5" aria-hidden="true" />{warrantyStatus}</span>
        <Link href={ROUTES.MACHINE_DETAILS(machine.machineCode)} className="group inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-normal text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">View details<ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" /></Link>
      </div>
    </CardContent>
  </Card>;
}
