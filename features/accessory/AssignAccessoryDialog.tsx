"use client";

import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <DialogContent className="flex max-h-[85vh] flex-col gap-3 text-xs font-normal sm:max-w-lg">
      <DialogHeader className="gap-1">
        <DialogTitle className="text-[15px] font-medium">Manage Accessories</DialogTitle>
        <DialogDescription className="text-xs font-normal">{modelName || "Machine model"} <span className="font-mono font-normal">{modelCode}</span></DialogDescription>
      </DialogHeader>
      {lookup.isLoading || assignments.isLoading ? <p className="py-6 text-center text-xs font-normal text-muted-foreground">Loading accessories...</p>
        : lookup.isError || assignments.isError ? <p className="py-6 text-center text-xs font-normal text-destructive">{accessoryError(lookup.error || assignments.error)}</p>
        : lookup.data && assignments.data && <AccessorySelection key={modelCode} modelCode={modelCode} lookup={lookup.data} assignments={assignments.data} savingRef={savingRef} onClose={() => onOpenChange(false)} />}
    </DialogContent>
  </Dialog>;
}

function AccessorySelection({ modelCode, lookup, assignments, savingRef, onClose }: { modelCode: string; lookup: AccessoryLookup[]; assignments: ModelAccessories; savingRef: React.RefObject<boolean>; onClose: () => void }) {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [baseline, setBaseline] = useState(() => new Set(assignments.accessories.filter((item) => item.isActive).map((item) => item.accessoryCode)));
  const [working, setWorking] = useState(() => new Set(baseline));
  const [saving, setSaving] = useState(false);
  const lookupCodes = new Set(lookup.map((item) => item.accessoryCode));
  const existingCodes = new Set(assignments.accessories.map((item) => item.accessoryCode));
  const rows = [
    ...lookup.map((item) => ({ accessoryCode: item.accessoryCode, accessoryName: item.accessoryName, description: null as string | null, masterActive: true })),
    ...assignments.accessories.filter((item) => !lookupCodes.has(item.accessoryCode)).map((item) => ({ accessoryCode: item.accessoryCode, accessoryName: item.accessoryName, description: item.description, masterActive: false })),
  ].filter((item) => `${item.accessoryName} ${item.accessoryCode}`.toLowerCase().includes(search.trim().toLowerCase()));
  const changes = [...new Set([...baseline, ...working])].filter((code) => baseline.has(code) !== working.has(code));

  function toggle(code: string) {
    if (saving) return;
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
    const updated = new Set(baseline);
    const failures: string[] = [];
    for (const code of changes) {
      try {
        if (working.has(code)) {
          await assignAccessory(modelCode, code);
          updated.add(code);
        } else {
          const result = await unassignAccessory(modelCode, code);
          updated.delete(code);
          toast.success(result.message);
        }
      } catch (error) {
        failures.push(`${code}: ${accessoryError(error)}`);
      }
    }
    setBaseline(updated);
    try {
      const actual = await getModelAccessories(modelCode, true);
      setBaseline(new Set(actual.accessories.filter((item) => item.isActive).map((item) => item.accessoryCode)));
      client.setQueryData([...accessoryKeys.model(modelCode), true], actual);
    } catch (error) {
      failures.push(`Refresh: ${accessoryError(error)}`);
    }
    await Promise.all([
      client.invalidateQueries({ queryKey: accessoryKeys.model(modelCode) }),
      client.invalidateQueries({ queryKey: accessoryKeys.lists }),
    ]);
    if (failures.length) toast.error(`Some accessory changes failed. ${failures.join("; ")}`);
    else toast.success("Accessory changes saved.");
    setSaving(false);
    savingRef.current = false;
  }

  return <>
    <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search accessories" className="pl-9 text-xs font-normal placeholder:text-xs" placeholder="Search accessories..." value={search} onChange={(event) => setSearch(event.target.value)} disabled={saving} /></div>
    <div className="min-h-0 max-h-64 space-y-1 overflow-y-auto overscroll-contain rounded-md border p-1">
      {rows.length === 0 ? <p className="p-3 text-center text-xs font-normal text-muted-foreground">No accessories found.</p> : rows.map((item) => {
        const checked = working.has(item.accessoryCode);
        const disabled = saving || (!item.masterActive && !baseline.has(item.accessoryCode));
        return <label key={item.accessoryCode} className={`flex min-h-10 cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-1.5 transition-colors hover:bg-muted/60 ${disabled ? "cursor-not-allowed opacity-60" : ""}`}>
          <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-primary" checked={checked} disabled={disabled} onChange={() => toggle(item.accessoryCode)} />
          <span className="min-w-0 flex-1"><span className="block text-xs font-normal">{item.accessoryName}</span><span className="block text-[11px] font-normal text-muted-foreground">{item.accessoryCode}{item.description ? ` · ${item.description}` : ""}</span></span>
          <span className="shrink-0 text-[11px] font-normal text-muted-foreground">{baseline.has(item.accessoryCode) ? "Assigned" : !item.masterActive ? "Master inactive" : existingCodes.has(item.accessoryCode) ? "Inactive assignment" : "Available"}</span>
        </label>;
      })}
    </div>
    <DialogFooter className="border-t pt-2.5 sm:justify-between">
      <span className="self-center text-[11px] font-normal text-muted-foreground">{working.size} selected</span>
      <div className="flex gap-2"><Button type="button" variant="outline" className="text-xs font-normal" disabled={saving} onClick={onClose}>Cancel</Button><Button type="button" className="text-xs font-normal" disabled={saving || changes.length === 0} onClick={save}>{saving ? "Saving..." : "Save Changes"}</Button></div>
    </DialogFooter>
  </>;
}
