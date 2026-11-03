"use client";

import { ArrowRight, Package, Plus, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useModelAccessories } from "@/features/accessory/hooks";
import type { MachineResponse, MachineModelResponse } from "../../types/machine";

interface ModelSummaryCardProps {
  machine: MachineResponse;
  model: MachineModelResponse;
  onViewDetails?: (model: MachineModelResponse) => void;
  onAddWarranty?: (model: MachineModelResponse) => void;
  onAddAccessory?: (model: MachineModelResponse) => void;
}

export function ModelSummaryCard({ machine, model, onViewDetails, onAddWarranty, onAddAccessory }: ModelSummaryCardProps) {
  const accessoryQuery = useModelAccessories(model.modelCode, true, !!onAddAccessory || !!onViewDetails);
  const accessoryCount = accessoryQuery.data?.accessories.filter((item) => item.isActive).length;
  const warrantyCount = model.warranties.length;

  return <Card size="sm" className="w-full max-w-[460px] self-start gap-2 border-border/70 bg-card/80 py-2.5 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
    <CardHeader>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs font-normal">{model.modelCode}</Badge>
            {model.isActive ? <span className="inline-flex items-center gap-1 text-[11px] font-normal text-emerald-600 dark:text-emerald-400"><span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />Active</span> : <Badge variant="destructive" className="text-[11px] font-normal">Inactive</Badge>}
          </div>
          <CardTitle className="mt-1 truncate text-xs font-normal">{model.modelName}</CardTitle>
          <CardDescription className="truncate text-[11px] font-normal">{machine.machineName} · {machine.machineCode}</CardDescription>
        </div>
        {(model.colorType || model.networkType) && <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {model.colorType && <Badge variant="secondary" className="text-[11px] font-normal">{model.colorType}</Badge>}
          {model.networkType && <Badge variant="secondary" className="text-[11px] font-normal">{model.networkType}</Badge>}
        </div>}
      </div>
    </CardHeader>
    <CardContent className="space-y-1.5">
      {model.description && <p className="line-clamp-1 text-[11px] font-normal text-muted-foreground">{model.description}</p>}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-normal">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-primary" />{warrantyCount} {warrantyCount === 1 ? "warranty" : "warranties"}</span>
          <span className="inline-flex items-center gap-1.5"><Package className="size-3.5 text-primary" />{accessoryQuery.isLoading ? "..." : accessoryQuery.isError ? "—" : accessoryCount ?? 0} {accessoryCount === 1 ? "accessory" : "accessories"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {onAddAccessory && <Button type="button" variant="outline" size="sm" className="text-xs font-normal" onClick={() => onAddAccessory(model)}><Plus className="size-4" />Add Accessory</Button>}
          {onAddWarranty && <Button type="button" variant="outline" size="sm" className="text-xs font-normal" onClick={() => onAddWarranty(model)}><Plus className="size-4" />Add Warranty</Button>}
          {onViewDetails && <Button type="button" variant="ghost" size="sm" className="text-xs font-normal" onClick={() => onViewDetails(model)}>View Details<ArrowRight className="size-4" /></Button>}
        </div>
      </div>
    </CardContent>
  </Card>;
}
