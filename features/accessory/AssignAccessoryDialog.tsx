"use client";

import { useRef, useState } from "react";
import { Check, Package, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { accessoryKeys, useAccessoryLookup, useModelAccessories } from "./hooks";
import { accessoryError, assignAccessory, getModelAccessories, unassignAccessory } from "./service";
import type { AccessoryLookup, ModelAccessories } from "./types";

interface Props {
  modelCode: string;
  modelName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignAccessoryDialog({ modelCode, modelName, open, onOpenChange }: Props) {
  const savingRef = useRef(false);
  const lookup = useAccessoryLookup(open);
  const assignments = useModelAccessories(modelCode, true, open);

  return <Dialog open={open} onOpenChange={(next) => { if (!savingRef.current) onOpenChange(next); }}>
    <DialogContent className="flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-[440px] flex-col gap-3 overflow-hidden rounded-xl p-4 text-xs font-normal sm:max-w-[440px]">
      <DialogHeader className="gap-1">
        <DialogTitle className="text-[15px] font-medium">Manage Accessories</DialogTitle>
        <DialogDescription className="text-xs font-normal">{modelName || "Machine model"} <span className="font-mono font-normal">{modelCode}</span></DialogDescription>
      </DialogHeader>
      {lookup.isLoading || assignments.isLoading ? <p className="py-6 text-center text-xs font-normal text-muted-foreground">Loading accessories...</p>
        : lookup.isError || assignments.isError ? <div role="alert" className="flex flex-col items-center gap-2 py-6 text-center text-xs text-destructive"><p>{accessoryError(lookup.error || assignments.error)}</p><Button type="button" size="sm" variant="outline" disabled={lookup.isFetching || assignments.isFetching} onClick={() => { if (lookup.isError) void lookup.refetch(); if (assignments.isError) void assignments.refetch(); }}>Retry</Button></div>
        : open && lookup.data && assignments.data && <AccessorySelection key={modelCode} modelCode={modelCode} lookup={lookup.data} assignments={assignments.data} savingRef={savingRef} onClose={() => onOpenChange(false)} />}
    </DialogContent>
  </Dialog>;
}

function AccessorySelection({ modelCode, lookup, assignments, savingRef, onClose }: { modelCode: string; lookup: AccessoryLookup[]; assignments: ModelAccessories; savingRef: React.RefObject<boolean>; onClose: () => void }) {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [baseline, setBaseline] = useState(() => new Set(assignments.accessories.filter((item) => item.isActive).map((item) => item.accessoryCode)));
  const [working, setWorking] = useState(() => new Set(baseline));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const lookupCodes = new Set(lookup.map((item) => item.accessoryCode));
  const existingCodes = new Set(assignments.accessories.map((item) => item.accessoryCode));
  const rows = [
    ...lookup.map((item) => ({ accessoryCode: item.accessoryCode, accessoryName: item.accessoryName, accessoryTypeName: item.accessoryTypeName, description: null as string | null, masterActive: true })),
    ...assignments.accessories.filter((item) => !lookupCodes.has(item.accessoryCode)).map((item) => ({ accessoryCode: item.accessoryCode, accessoryName: item.accessoryName, accessoryTypeName: item.accessoryTypeName, description: item.description, masterActive: false })),
  ].filter((item) => `${item.accessoryName} ${item.accessoryCode} ${item.accessoryTypeName}`.toLowerCase().includes(search.trim().toLowerCase()));
  const changes = [...new Set([...baseline, ...working])].filter((code) => baseline.has(code) !== working.has(code));

  function toggle(code: string) {
    if (saving) return;
    setSaveError(null);
    setWorking((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  }

  async function save() {
    if (savingRef.current || changes.length === 0) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    const updated = new Set(baseline);
    const failures = new Map<string, string>();
    try {
      for (const code of changes) {
        try {
          if (working.has(code)) {
            await assignAccessory(modelCode, code);
            updated.add(code);
          } else {
            await unassignAccessory(modelCode, code);
            updated.delete(code);
          }
        } catch (error) {
          failures.set(code, accessoryError(error));
        }
      }
      setBaseline(updated);
      try {
        const actual = await getModelAccessories(modelCode, true);
        const actualCodes = new Set(actual.accessories.filter((item) => item.isActive).map((item) => item.accessoryCode));
        setBaseline(actualCodes);
        client.setQueryData([...accessoryKeys.model(modelCode), true], actual);
        // A response may fail after the server has committed the change.
        for (const code of failures.keys()) {
          if (actualCodes.has(code) === working.has(code)) failures.delete(code);
        }
        const nextWorking = new Set(actualCodes);
        for (const code of failures.keys()) {
          if (working.has(code)) nextWorking.add(code);
          else nextWorking.delete(code);
        }
        setWorking(nextWorking);
      } catch (error) {
        failures.set("Refresh", accessoryError(error));
        setWorking(new Set(working));
      }
      await Promise.all([
        client.invalidateQueries({ queryKey: accessoryKeys.model(modelCode) }),
        client.invalidateQueries({ queryKey: accessoryKeys.lists }),
      ]);
      if (failures.size) {
        const message = `Some accessory changes failed. ${[...failures].map(([code, reason]) => `${code}: ${reason}`).join("; ")}`;
        setSaveError(message);
        toast.error(message);
      } else toast.success("Accessory changes saved.");
    } catch (error) {
      const message = `Could not refresh accessory assignments. ${accessoryError(error)}`;
      setSaveError(message);
      toast.error(message);
      setWorking(new Set(working));
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  }

  return <>
    <div className="relative"><Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input autoFocus aria-label="Search accessories" className="h-9 bg-background pl-8 text-xs font-normal placeholder:text-xs" placeholder="Search accessories..." value={search} onChange={(event) => setSearch(event.target.value)} disabled={saving} /></div>
    <TooltipProvider delay={150}><div className="grid min-h-0 max-h-[280px] grid-cols-2 content-start justify-items-start gap-2 overflow-y-auto overscroll-contain pr-1 touch-pan-y sm:grid-cols-3">
      {rows.length === 0 ? <p className="p-3 text-center text-xs font-normal text-muted-foreground">No accessories found.</p> : rows.map((item) => {
        const checked = working.has(item.accessoryCode);
        const disabled = saving || (!item.masterActive && !baseline.has(item.accessoryCode));
        return <Tooltip key={item.accessoryCode} disableHoverablePopup><TooltipTrigger render={<label className={`relative flex h-24 w-full max-w-[120px] min-w-0 cursor-pointer flex-col rounded-[10px] border px-2.5 py-2 text-left outline-none transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-ring/60 has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-ring/60 motion-reduce:transition-none ${checked ? "border-primary/20 bg-primary/[0.04]" : "border-border/50 bg-card hover:border-border/70 hover:bg-muted/40"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}>
          <input type="checkbox" className="peer sr-only focus-visible:outline-none" checked={checked} disabled={disabled} onChange={() => toggle(item.accessoryCode)} aria-label={item.accessoryName} />
          <span aria-hidden="true" className={`absolute right-2 top-2 flex size-3.5 items-center justify-center rounded-full border transition-colors duration-150 motion-reduce:transition-none ${checked ? "border-primary/20 bg-primary/15 text-primary" : "border-border/60 bg-background"}`}>{checked && <Check className="size-2.5" />}</span>
          <span className="mb-1 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground"><Package className="size-[18px]" /></span>
          <span className="line-clamp-2 min-w-0 text-[11px] leading-[13px] font-normal">{item.accessoryName}</span>
          <span className="mt-auto block min-w-0 truncate text-[10px] leading-3 font-normal text-muted-foreground">{item.accessoryCode}</span>
        </label>} />
          <TooltipContent side="top" sideOffset={7} showArrow={false} className="block w-max max-w-[min(280px,calc(100vw-2rem))] rounded-[9px] border border-border/40 bg-popover px-2.5 py-2 text-popover-foreground shadow-sm duration-150 data-open:zoom-in-100 data-closed:zoom-out-100 motion-reduce:animate-none">
            <span className="block text-xs leading-4 font-normal wrap-break-word">{item.accessoryName}</span>
            <span className="mt-0.5 block text-[11px] leading-4 font-normal text-muted-foreground">{item.accessoryCode} · {item.accessoryTypeName} · {baseline.has(item.accessoryCode) ? "Assigned" : !item.masterActive ? "Master inactive" : existingCodes.has(item.accessoryCode) ? "Inactive assignment" : "Available"}</span>
          </TooltipContent>
        </Tooltip>;
      })}
    </div></TooltipProvider>
    {saveError && <p role="alert" className="text-xs text-destructive">{saveError}</p>}
    <DialogFooter className="mx-0 mb-0 flex-row flex-wrap items-center justify-between rounded-none border-t bg-transparent px-0 pb-0 pt-2.5">
      <span className="self-center text-[11px] font-normal text-muted-foreground">{working.size} selected</span>
      <div className="flex gap-2"><Button type="button" variant="outline" size="sm" className="h-8 text-xs font-normal" disabled={saving} onClick={onClose}>Cancel</Button><Button type="button" size="sm" className="h-8 text-xs font-normal" disabled={saving || changes.length === 0} onClick={save}>{saving ? "Saving..." : "Save Changes"}</Button></div>
    </DialogFooter>
  </>;
}
