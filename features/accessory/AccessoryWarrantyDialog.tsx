"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import type { CreateWarrantyTypeForm } from "@/features/machine/schemas/warranty-type.schema";
import { AccessoryWarrantyTypeDialog } from "./AccessoryWarrantyTypeDialog";
import { AccessoryWarrantyAccessoryCombobox } from "./AccessoryWarrantyAccessoryCombobox";
import { AccessoryWarrantyTypeCombobox } from "./AccessoryWarrantyTypeCombobox";
import { useAccessoryLookup } from "./hooks";
import { useCreateAccessoryWarrantyType, useWarranty, useWarrantyIndicators, useWarrantyMutations, useWarrantyTypes } from "./warranty-hooks";
import { accessoryError } from "./service";
import { warrantyError } from "./warranty";
import type { AccessoryWarranty } from "./warranty";
import { formatWarrantyDuration } from "./warranty-format";
import { getWarrantyPeriodUnitLabel, getWarrantyPeriodUnitValue, warrantyPeriodUnit, warrantyPeriodUnitOptions } from "./warranty-period-unit";

type Mode = "create" | "edit" | "view";
interface Props { open: boolean; mode: Mode; warranty?: AccessoryWarranty | null; accessory?: { accessoryCode: string; accessoryName: string; isActive?: boolean } | null; onOpenChange: (open: boolean) => void }
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value)) : "—";

export function AccessoryWarrantyDialog({ open, mode, warranty, accessory, onOpenChange }: Props) {
  const detail = useWarranty(open && warranty ? warranty.id : null);
  const current = detail.data ?? warranty;
  const types = useWarrantyTypes();
  const refetchTypes = types.refetch;
  const createType = useCreateAccessoryWarrantyType();
  const accessories = useAccessoryLookup(open && mode === "create" && !accessory);
  const existingWarranties = useWarrantyIndicators(open && mode === "create" && !accessory);
  const mutations = useWarrantyMutations();
  const [code, setCode] = useState("");
  const [typeId, setTypeId] = useState("");
  const [duration, setDuration] = useState("6");
  const [unit, setUnit] = useState(String(warrantyPeriodUnit.Months));
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      setCode(accessory?.accessoryCode ?? current?.accessoryCode ?? ""); setTypeId(current ? String(current.warrantyTypeId) : "");
      setDuration(mode === "create" ? "6" : current ? String(current.duration) : "6");
      setUnit(mode === "create" ? String(warrantyPeriodUnit.Months) : current ? String(getWarrantyPeriodUnitValue(current.durationUnit) ?? "") : "");
      setActive(current?.isActive ?? true); setError("");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, mode, accessory?.accessoryCode, current]);
  useEffect(() => { if (open) void refetchTypes(); }, [open, refetchTypes]);
  const busy = mutations.create.isPending || mutations.update.isPending;
  const selectedAccessory = accessory ?? accessories.data?.find((item) => item.accessoryCode === code);
  const selectedUnit = Number(unit);
  async function addWarrantyType(values: CreateWarrantyTypeForm): Promise<boolean> {
    let created;
    try { created = await createType.mutateAsync(values); }
    catch (cause) { throw new Error(warrantyError(cause)); }
    const refreshed = await types.refetch();
    const option = refreshed.data?.find((item) => item.id === created.id && item.code === created.warrantyTypeCode);
    if (option?.isActive) { setTypeId(String(option.id)); toast.success("Warranty type created and selected."); }
    else if (option?.isActive === false || created.isActive === false) toast.warning("Warranty type created as inactive. Activate it before selecting it for a warranty.");
    else if (refreshed.isError) toast.warning("Warranty type created, but the list could not refresh. Use Retry to load it.");
    else toast.warning("Warranty type was saved but was not found in the refreshed list. Use Retry to load it.");
    return true;
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!code || !typeId || getWarrantyPeriodUnitValue(selectedUnit) === null || !Number.isInteger(Number(duration)) || Number(duration) <= 0) { setError("Choose an accessory, warranty type and duration unit, then enter a positive whole number of units."); return; }
    if (mode === "create" && selectedAccessory && "isActive" in selectedAccessory && selectedAccessory.isActive === false) { setError("Activate the accessory before creating its warranty."); return; }
    try {
      if (mode === "create") await mutations.create.mutateAsync({ accessoryCode: code, warrantyTypeId: Number(typeId), duration: Number(duration), durationUnit: selectedUnit, isActive: active });
      else if (current) await mutations.update.mutateAsync({ id: current.id, payload: { warrantyTypeId: Number(typeId), duration: Number(duration), durationUnit: selectedUnit, isActive: current.isActive } });
      toast.success(mode === "create" ? "Warranty created." : "Warranty updated."); onOpenChange(false);
    } catch (cause) { setError(cause instanceof AxiosError && cause.response?.status === 409 ? "This accessory already has a warranty." : warrantyError(cause)); }
  }
  const typeOptions = types.data?.filter((type) => type.isActive || type.id === current?.warrantyTypeId) ?? [];
  const selectedWarrantyType = typeOptions.find((type) => String(type.id) === typeId);
  const existingTypeName = mode === "edit" && current?.warrantyTypeId && String(current.warrantyTypeId) === typeId ? current.warrantyTypeName : null;
  return <><Dialog open={open} onOpenChange={(next) => { if (!busy && !typeDialogOpen) onOpenChange(next); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[480px]"><DialogHeader><DialogTitle>{mode === "create" ? "Create Accessory Warranty" : mode === "edit" ? "Edit Accessory Warranty" : "Accessory Warranty"}</DialogTitle><DialogDescription>{mode === "view" ? "Warranty details and status." : "Enter the warranty details for this accessory."}</DialogDescription></DialogHeader>
    {mode === "view" ? detail.isLoading ? <p className="text-sm text-muted-foreground">Loading warranty...</p> : detail.isError ? <p role="alert" className="text-sm text-destructive">{warrantyError(detail.error)} <Button variant="outline" size="sm" onClick={() => detail.refetch()}>Retry</Button></p> : current && <div className="grid grid-cols-2 gap-3 text-sm">{[["Accessory", current.accessoryName], ["Code", current.accessoryCode], ["Accessory Type", current.accessoryTypeName || "—"], ["Warranty Type", current.warrantyTypeName], ["Duration", formatWarrantyDuration(current.duration, current.durationUnit)], ["Duration Unit", getWarrantyPeriodUnitLabel(current.durationUnit) ?? "—"], ["Created", formatDate(current.createdAt)], ["Updated", formatDate(current.updatedAt)]].map(([label, value]) => <div key={label}><p className="text-xs text-muted-foreground">{label}</p><p>{value}</p></div>)}<div><p className="text-xs text-muted-foreground">Status</p><Badge variant={current.isActive ? "secondary" : "destructive"}>{current.isActive ? "Active" : "Inactive"}</Badge></div></div>
      : <form onSubmit={submit} className="space-y-4"><div className="space-y-1.5"><label htmlFor="warranty-accessory" className="text-sm">Accessory</label>{accessory || mode === "edit" ? <div className="rounded-md border px-3 py-2 text-sm">{accessory?.accessoryName ?? current?.accessoryName} · {accessory?.accessoryCode ?? current?.accessoryCode}</div> : <AccessoryWarrantyAccessoryCombobox options={accessories.data ?? []} value={code} onValueChange={setCode} loading={accessories.isLoading} error={accessories.isError ? accessoryError(accessories.error) : null} onRetry={() => { void accessories.refetch(); }} existingWarranties={existingWarranties.data} />}</div>
        <div className="space-y-1.5">
          <label className="text-sm">Warranty Type</label>
          <AccessoryWarrantyTypeCombobox
            options={typeOptions}
            value={typeId}
            selectedName={existingTypeName}
            onValueChange={(value) => { setTypeId(value); setError(""); }}
            onAddNew={() => setTypeDialogOpen(true)}
            onOpen={() => { void types.refetch(); }}
            loading={types.isLoading}
            error={types.isError ? warrantyError(types.error) : null}
            onRetry={() => { void types.refetch(); }}
          />
          {types.isSuccess && types.data.length === 0 ? <p className="text-xs text-muted-foreground">No warranty types are available.</p> : types.isSuccess && typeOptions.length === 0 ? <p className="text-xs text-muted-foreground">No active warranty types are available.</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><label htmlFor="warranty-duration" className="text-sm">Duration</label><Input id="warranty-duration" type="number" min="1" step="1" required value={duration} onChange={(event) => setDuration(event.target.value)} /></div><div className="space-y-1.5"><label htmlFor="warranty-unit" className="text-sm">Duration Unit</label><Select value={unit} onValueChange={(value) => setUnit(value ?? "")}><SelectTrigger id="warranty-unit" className="w-full"><span className="truncate text-left">{getWarrantyPeriodUnitLabel(Number(unit)) ?? "Select unit"}</span></SelectTrigger><SelectContent>{warrantyPeriodUnitOptions.map((option) => <SelectItem key={option.value} value={String(option.value)}>{option.label}</SelectItem>)}</SelectContent></Select></div></div>
        {mode === "create" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Active</label>}
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}<DialogFooter><Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={busy || types.isLoading || (types.isError && !selectedWarrantyType && !existingTypeName) || !code || !unit || !selectedWarrantyType && !existingTypeName || !Number.isInteger(Number(duration)) || Number(duration) <= 0}>{busy ? "Saving..." : mode === "create" ? "Create Warranty" : "Save Changes"}</Button></DialogFooter></form>}
  </DialogContent></Dialog><AccessoryWarrantyTypeDialog open={typeDialogOpen} pending={createType.isPending} onOpenChange={setTypeDialogOpen} onCreate={addWarrantyType} /></>;
}







