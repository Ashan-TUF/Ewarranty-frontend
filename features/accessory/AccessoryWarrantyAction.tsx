"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AccessoryWarrantyDialog } from "./AccessoryWarrantyDialog";
import { useAccessoryWarranty, useWarrantyMutations } from "./warranty-hooks";
import { warrantyError } from "./warranty";
import type { AccessoryWarranty } from "./warranty";

export function AccessoryWarrantyAction({ accessory, known }: { accessory: { accessoryCode: string; accessoryName: string; isActive?: boolean }; known?: AccessoryWarranty | null }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit" | "view" | null>(null);
  const [confirm, setConfirm] = useState(false);
  const lookup = useAccessoryWarranty(open && !known ? accessory.accessoryCode : null);
  const warranty = known ?? lookup.data;
  const noWarranty = !known && lookup.error && "response" in lookup.error && (lookup.error as { response?: { status?: number } }).response?.status === 404;
  const mutations = useWarrantyMutations();
  const show = (next: "create" | "edit" | "view") => { setMode(next); setOpen(false); };
  async function changeStatus() {
    if (!warranty || mutations.status.isPending) return;
    try { await mutations.status.mutateAsync({ id: warranty.id, isActive: !warranty.isActive }); toast.success(`Warranty ${warranty.isActive ? "deactivated" : "activated"}.`); setConfirm(false); setOpen(false); }
    catch (error) { toast.error(warrantyError(error)); }
  }
  return <><Button variant="ghost" size="sm" onClick={() => { setMode(null); setOpen(true); }} aria-label={`Manage warranty for ${accessory.accessoryName}`}>{known ? <Badge variant={known.isActive ? "secondary" : "destructive"}>{known.isActive ? "Active Warranty" : "Inactive Warranty"}</Badge> : known === null ? "No Warranty" : "Warranty"}</Button>
    {open && !warranty && !noWarranty && <Dialog open onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Accessory Warranty</DialogTitle><DialogDescription>{accessory.accessoryName} · {accessory.accessoryCode}</DialogDescription></DialogHeader>{lookup.isError ? <p role="alert" className="text-sm text-destructive">{warrantyError(lookup.error)} <Button size="sm" variant="outline" onClick={() => lookup.refetch()}>Retry</Button></p> : <p className="text-sm text-muted-foreground">Loading warranty...</p>}</DialogContent></Dialog>}
    {open && (warranty || noWarranty) && <Dialog open onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Warranty for {accessory.accessoryName}</DialogTitle><DialogDescription>{accessory.accessoryCode}</DialogDescription></DialogHeader>{warranty ? <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => show("view")}>View Warranty</Button><Button size="sm" variant="outline" onClick={() => show("edit")}>Edit Warranty</Button><Button size="sm" variant="outline" onClick={() => setConfirm(true)}>{warranty.isActive ? "Deactivate" : "Activate"} Warranty</Button></div> : <div className="space-y-3"><p className="text-sm text-muted-foreground">No Warranty</p><Button size="sm" disabled={accessory.isActive === false} onClick={() => show("create")}>Add Warranty</Button>{accessory.isActive === false && <p className="text-xs text-muted-foreground">Activate this accessory before adding a warranty.</p>}</div>}</DialogContent></Dialog>}
    {mode && <AccessoryWarrantyDialog open mode={mode} warranty={warranty} accessory={accessory} onOpenChange={(next) => { if (!next) setMode(null); }} />}
    <Dialog open={confirm} onOpenChange={(next) => { if (!mutations.status.isPending) setConfirm(next); }}><DialogContent><DialogHeader><DialogTitle>{warranty?.isActive ? "Deactivate" : "Activate"} Warranty</DialogTitle><DialogDescription>{warranty?.isActive ? "Deactivate" : "Activate"} the warranty for {accessory.accessoryName}?</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" disabled={mutations.status.isPending} onClick={() => setConfirm(false)}>Cancel</Button><Button disabled={mutations.status.isPending} onClick={changeStatus}>{mutations.status.isPending ? "Saving..." : "Confirm"}</Button></DialogFooter></DialogContent></Dialog>
  </>;
}


