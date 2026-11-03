"use client";

import { useState } from "react";
import { Package, PowerOff, Unlink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAccessoryLookup, useAssignmentMutations, useModelAccessories } from "./hooks";
import { accessoryError } from "./service";
import { AssignAccessoryDialog } from "./AssignAccessoryDialog";
import type { ModelAccessory } from "./types";

export function ModelAccessoryList({ modelCode, enabled = true, compact = false }: { modelCode: string; enabled?: boolean; compact?: boolean }) {
  const [includeInactive, setIncludeInactive] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);
  const [target, setTarget] = useState<ModelAccessory | null>(null);
  const [action, setAction] = useState<"status" | "unassign">("status");
  const assignments = useModelAccessories(modelCode, compact ? false : includeInactive, enabled);
  const lookup = useAccessoryLookup(enabled);
  const mutations = useAssignmentMutations(modelCode);
  const pending = mutations.assign.isPending || mutations.status.isPending || mutations.unassign.isPending;
  const activeMasterCodes = new Set(lookup.data?.map((item) => item.accessoryCode) || []);
  const visible = compact ? assignments.data?.accessories.filter((item) => item.isActive) : assignments.data?.accessories;

  async function confirm() {
    if (!target || pending) return;
    try {
      if (action === "unassign") {
        const result = await mutations.unassign.mutateAsync(target.accessoryCode);
        toast.success(result.message);
      } else {
        await mutations.status.mutateAsync({ accessoryCode: target.accessoryCode, isActive: !target.isActive });
        toast.success(`Model accessory ${target.isActive ? "deactivated" : "activated"}.`);
      }
      setTarget(null);
    } catch (error) { toast.error(accessoryError(error)); }
  }

  if (compact) return <section className="space-y-1.5 border-t pt-2.5">
    <div className="flex flex-wrap items-center justify-between gap-1.5"><div><h2 className="text-sm font-normal">Accessories</h2><p className="text-xs font-normal text-muted-foreground">{visible?.length ?? 0} active</p></div><Button type="button" size="sm" variant="outline" className="text-xs font-normal" onClick={() => setAssignOpen(true)}>Assign Accessories</Button></div>
    {assignments.isLoading ? <p className="text-xs text-muted-foreground">Loading accessories...</p> : assignments.isError ? <p className="text-xs text-destructive">{accessoryError(assignments.error)}</p> : visible?.length === 0 ? <p className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">No active accessories assigned.</p> : <div className="divide-y rounded-md border">{visible?.map((item) => <div key={item.id} className="flex min-w-0 items-center gap-2 px-2.5 py-2"><Package className="size-4 shrink-0 text-muted-foreground" /><div className="min-w-0 flex-1" title={item.description || undefined}><p className="truncate text-xs font-normal">{item.accessoryName}</p><p className="text-[11px] font-normal text-muted-foreground">{item.accessoryCode}</p></div><Button type="button" variant="ghost" size="icon-sm" aria-label={`Deactivate ${item.accessoryName}`} title="Deactivate assignment" onClick={() => { setAction("status"); setTarget(item); }}><PowerOff className="size-3.5" /></Button><Button type="button" variant="ghost" size="icon-sm" aria-label={`Unassign ${item.accessoryName}`} title="Unassign accessory" onClick={() => { setAction("unassign"); setTarget(item); }}><Unlink className="size-3.5" /></Button></div>)}</div>}
    <AssignAccessoryDialog modelCode={modelCode} open={assignOpen} onOpenChange={setAssignOpen} />
    <Dialog open={!!target} onOpenChange={(open) => { if (!open && !pending) setTarget(null); }}>
      <DialogContent className="gap-3 p-3.5 sm:max-w-[380px]">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-sm font-normal">{action === "unassign" ? "Unassign Accessory" : "Deactivate Assignment"}</DialogTitle>
          <DialogDescription className="text-xs font-normal">{action === "unassign" ? `Unassign ${target?.accessoryName} from ${modelCode}?` : `Deactivate ${target?.accessoryName} for ${modelCode}?`}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-1.5">
          <Button variant="outline" className="text-xs font-normal" disabled={pending} onClick={() => setTarget(null)}>Cancel</Button>
          <Button className="text-xs font-normal" disabled={pending} onClick={confirm}>{pending ? "Saving..." : "Confirm"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>;

  return <section className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-normal">Accessories</h2><p className="mt-0.5 text-xs text-muted-foreground">{assignments.data?.accessories.length ?? 0} accessories for {assignments.data?.modelCode ?? modelCode}</p></div><div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => setIncludeInactive(!includeInactive)}>{includeInactive ? "Hide inactive" : "Show inactive"}</Button><Button type="button" size="sm" onClick={() => setAssignOpen(true)}>Assign Accessory</Button></div></div>
    {assignments.isLoading ? <p className="text-sm text-muted-foreground">Loading model accessories...</p> : assignments.isError ? <p className="text-sm text-destructive">{accessoryError(assignments.error)}</p> : assignments.data?.accessories.length === 0 ? <div className="rounded-xl border border-dashed py-12 text-center"><p className="font-medium">No accessories assigned yet</p><p className="mt-1 text-sm text-muted-foreground">Assign an accessory to this model.</p></div> : <div className="grid gap-3">{assignments.data?.accessories.map((item) => <div key={item.id} className="rounded-xl border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium">{item.accessoryName}</h3><p className="text-xs text-muted-foreground">{item.accessoryCode} Â· {item.isActive ? "Active assignment" : "Inactive assignment"}</p>{item.description && <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>}</div><div className="flex gap-2"><Button size="sm" variant="outline" disabled={!item.isActive && !activeMasterCodes.has(item.accessoryCode)} title={!item.isActive && !activeMasterCodes.has(item.accessoryCode) ? "Accessory master is inactive" : undefined} onClick={() => { setAction("status"); setTarget(item); }}>{item.isActive ? "Deactivate" : "Activate"}</Button><Button size="sm" variant="outline" onClick={() => { setAction("unassign"); setTarget(item); }}>Unassign</Button></div></div></div>)}</div>}
    <AssignAccessoryDialog modelCode={modelCode} open={assignOpen} onOpenChange={setAssignOpen} />
    <Dialog open={!!target} onOpenChange={(open) => { if (!open && !pending) setTarget(null); }}><DialogContent><DialogHeader><DialogTitle>{action === "unassign" ? "Unassign Accessory" : `${target?.isActive ? "Deactivate" : "Activate"} Assignment`}</DialogTitle><DialogDescription>{action === "unassign" ? `Unassign ${target?.accessoryName} from ${modelCode}?` : `Change the model assignment status of ${target?.accessoryName}?`}</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" disabled={pending} onClick={() => setTarget(null)}>Cancel</Button><Button disabled={pending} onClick={confirm}>{pending ? "Saving..." : "Confirm"}</Button></DialogFooter></DialogContent></Dialog>
  </section>;
}
