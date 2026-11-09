"use client";

import { ArrowLeft, Boxes, CalendarDays, Package2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAccessory } from "./hooks";
import { accessoryError } from "./service";
import { AccessoryWarrantyAction } from "./AccessoryWarrantyAction";
import type { AccessoryListItem } from "./types";

interface Props {
  item: AccessoryListItem | null;
  onOpenChange: (open: boolean) => void;
}

export function AccessoryDetailDialog({ item, onOpenChange }: Props) {
  const detail = useAccessory(item?.accessoryCode ?? null);
  const accessory = detail.data;
  const isActive = accessory?.isActive ?? item?.isActive ?? false;
  const date = (value: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));

  return <Dialog open={!!item} onOpenChange={onOpenChange}>
    <DialogContent className="gap-4 sm:max-w-[480px]">
      <DialogHeader className="gap-1">
        <Button type="button" variant="ghost" size="sm" className="-ml-2 h-auto w-fit gap-1 px-2 py-1 text-xs font-normal text-muted-foreground" onClick={() => onOpenChange(false)}><ArrowLeft className="size-3.5" />Back to accessories</Button>
        <div className="flex items-start gap-3 pr-6">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Package2 className="size-4" /></span>
          <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="font-mono text-xs font-normal">{item?.accessoryCode}</Badge>
          <Badge variant={isActive ? "secondary" : "destructive"} className="text-[11px] font-normal">{isActive ? "Active" : "Inactive"}</Badge>
        </div>
        <DialogTitle className="text-sm font-normal">{accessory?.accessoryName ?? item?.accessoryName}</DialogTitle>
        <DialogDescription className="text-[11px] font-normal">Accessory overview</DialogDescription>
          </div>
        </div>
      </DialogHeader>
      {detail.isLoading ? <p className="py-3 text-xs text-muted-foreground">Loading accessory...</p>
        : detail.isError ? <p className="py-3 text-xs text-destructive">{accessoryError(detail.error)}</p>
        : accessory && <div className="space-y-4">
          <div className="rounded-xl bg-muted/40 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground">Accessory Type</p><p className="text-xs">{accessory.accessoryTypeName} · {accessory.accessoryTypeCode}</p>
            <p className="text-[11px] text-muted-foreground">Description</p>
            <p className="mt-1 text-xs leading-relaxed text-foreground">{accessory.description || "No description provided."}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-border/70 pt-3 sm:grid-cols-3">
            <div><p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Boxes className="size-3.5 text-primary" /> Assigned models</p><p className="mt-1 text-xs">{item?.assignedModelCount ?? 0}</p></div>
            <div><p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><CalendarDays className="size-3.5 text-primary" /> Registered</p><p className="mt-1 text-xs">{date(accessory.createdAt)}</p></div>
            {accessory.updatedAt && <div><p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><CalendarDays className="size-3.5 text-primary" /> Updated</p><p className="mt-1 text-xs">{date(accessory.updatedAt)}</p></div>}
          </div>
          <div className="border-t pt-3"><p className="text-[11px] text-muted-foreground">Warranty</p><AccessoryWarrantyAction accessory={accessory} /></div>
        </div>}
    </DialogContent>
  </Dialog>;
}
