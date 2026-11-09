"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import { Check, ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAccessory, useAccessoryMutations, useAccessoryTypeLookup, useAccessoryTypeMutations } from "./hooks";
import { accessoryError } from "./service";
import type { AccessoryTypeLookupResponse } from "./types";

const schema = z.object({ accessoryName: z.string().trim().min(1, "Accessory name is required.").max(100), accessoryTypeId: z.number().int().positive("Accessory type is required."), description: z.string().max(500) });
const typeSchema = z.object({ typeName: z.string().trim().min(1, "Type name is required.").max(100), description: z.string().trim().max(500) });
type Values = z.infer<typeof schema>;
type TypeValues = z.infer<typeof typeSchema>;

export function AccessoryFormDialog({ code, open, onOpenChange }: { code: string | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const detail = useAccessory(open ? code : null);
  const types = useAccessoryTypeLookup(open);
  const { create, update } = useAccessoryMutations();
  const { create: createType } = useAccessoryTypeMutations();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { accessoryName: "", accessoryTypeId: 0, description: "" } });
  const typeForm = useForm<TypeValues>({ resolver: zodResolver(typeSchema), defaultValues: { typeName: "", description: "" } });
  const selectedId = useWatch({ control: form.control, name: "accessoryTypeId" });
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [newType, setNewType] = useState<AccessoryTypeLookupResponse | null>(null);
  const [matchingType, setMatchingType] = useState<AccessoryTypeLookupResponse | null>(null);
  const pending = create.isPending || update.isPending;
  const options = [...(types.data || [])];
  if (newType && !options.some((item) => item.id === newType.id)) options.push(newType);
  if (code && detail.data?.accessoryTypeId && !options.some((item) => item.id === detail.data?.accessoryTypeId)) {
    options.push({ id: detail.data.accessoryTypeId, typeCode: detail.data.accessoryTypeCode, typeName: `${detail.data.accessoryTypeName} (inactive)` });
  }
  const selected = options.find((item) => item.id === selectedId);

  useEffect(() => { if (open) form.reset({ accessoryName: detail.data?.accessoryName || "", accessoryTypeId: detail.data?.accessoryTypeId || 0, description: detail.data?.description || "" }); }, [open, detail.data, form]);

  async function submit(values: Values) {
    if (pending || !options.some((item) => item.id === values.accessoryTypeId)) return;
    const payload = { accessoryName: values.accessoryName.trim(), accessoryTypeId: values.accessoryTypeId, description: values.description.trim() || null };
    try {
      if (code) await update.mutateAsync({ code, payload }); else await create.mutateAsync(payload);
      toast.success(code ? "Accessory updated." : "Accessory created.");
      onOpenChange(false);
      form.reset();
    } catch (error) { toast.error(accessoryError(error)); }
  }

  async function submitType(values: TypeValues) {
    if (createType.isPending) return;
    setMatchingType(null);
    try {
      const item = await createType.mutateAsync({ typeName: values.typeName.trim(), description: values.description.trim() || null });
      setNewType({ id: item.id, typeCode: item.typeCode, typeName: item.typeName });
      form.setValue("accessoryTypeId", item.id, { shouldValidate: true, shouldDirty: true });
      setTypeDialogOpen(false);
      typeForm.reset();
      toast.success("Accessory type created and selected.");
    } catch (error) {
      const duplicate = error instanceof AxiosError && error.response?.status === 409;
      const match = duplicate && options.find((item) => item.typeName.toLowerCase() === values.typeName.trim().toLowerCase());
      if (match) {
        setMatchingType(match);
        typeForm.setError("typeName", { message: `This type already exists. Select “${match.typeName}” from the list.` });
      } else typeForm.setError("root", { message: duplicate ? "An accessory type with this name already exists. Refresh the list to select it." : accessoryError(error) });
    }
  }

  return <>
    <Dialog open={open} onOpenChange={(next) => { if (!pending && !typeDialogOpen) { onOpenChange(next); if (!next) { form.reset(); setNewType(null); setSelectorOpen(false); } } }}>
      <DialogContent overlayClassName="bg-black/40 backdrop-blur-[2px]" className="max-h-[calc(100dvh-2rem)] overflow-y-auto border border-border bg-background text-foreground shadow-xl sm:max-w-lg">
        <DialogHeader className="gap-1 pr-9"><DialogTitle>{code ? "Edit Accessory" : "Add Accessory"}</DialogTitle><DialogDescription>{code ? `Update ${code}.` : "The accessory code is assigned by the server."}</DialogDescription></DialogHeader>
        {code && detail.isLoading ? <p className="text-sm text-muted-foreground">Loading accessory...</p> : code && detail.isError ? <p className="text-xs text-destructive">{accessoryError(detail.error)}</p> :
          <form id="accessory-form" className="space-y-3.5" onSubmit={form.handleSubmit(submit)}>
            <div className="space-y-1.5"><label htmlFor="accessoryName" className="text-xs font-medium text-foreground">Accessory Name</label><Input id="accessoryName" className="h-9 border-border bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring/30" maxLength={100} {...form.register("accessoryName")} />{form.formState.errors.accessoryName && <p className="text-xs text-destructive">{form.formState.errors.accessoryName.message}</p>}</div>
            <div className="space-y-1.5"><span id="accessory-type-label" className="text-xs font-medium text-foreground">Accessory Type</span><AccessoryTypeSelector options={options} selected={selected} open={selectorOpen} onOpenChange={setSelectorOpen} loading={types.isLoading} error={types.isError ? accessoryError(types.error) : null} retry={() => void types.refetch()} onSelect={(id) => form.setValue("accessoryTypeId", id, { shouldValidate: true, shouldDirty: true })} /><Button type="button" variant="ghost" size="sm" className="h-7 px-1 text-xs text-foreground/80 hover:text-foreground" onClick={() => { setSelectorOpen(false); setTypeDialogOpen(true); }}><Plus className="size-3.5" />Add New Accessory Type</Button>{form.formState.errors.accessoryTypeId && <p className="text-xs text-destructive">{form.formState.errors.accessoryTypeId.message}</p>}</div>
            <div className="space-y-1.5"><label htmlFor="accessoryDescription" className="text-xs font-medium text-foreground">Description</label><Textarea id="accessoryDescription" className="border-border bg-background text-foreground focus-visible:ring-2 focus-visible:ring-ring/30" maxLength={500} rows={3} {...form.register("description")} />{form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}</div>
          </form>}
        <DialogFooter className="border-border bg-background px-4 sm:justify-end"><Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" form="accessory-form" disabled={pending || !!(code && !detail.data) || !selectedId || !selected}>{pending ? "Saving..." : "Save Accessory"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog open={typeDialogOpen} onOpenChange={(next) => { if (!createType.isPending) { setTypeDialogOpen(next); if (!next) { typeForm.reset(); setMatchingType(null); } } }}>
      <DialogContent className="z-[60] sm:max-w-[420px]"><DialogHeader><DialogTitle>Add New Accessory Type</DialogTitle><DialogDescription>The type code is generated automatically.</DialogDescription></DialogHeader><form id="new-accessory-type-form" className="space-y-3" onSubmit={typeForm.handleSubmit(submitType)}><div className="space-y-1"><label htmlFor="new-type-name" className="text-xs">Type Name</label><Input id="new-type-name" autoFocus maxLength={100} {...typeForm.register("typeName")} />{typeForm.formState.errors.typeName && <p className="text-xs text-destructive">{typeForm.formState.errors.typeName.message}</p>}</div><div className="space-y-1"><label htmlFor="new-type-description" className="text-xs">Description</label><Textarea id="new-type-description" maxLength={500} rows={3} {...typeForm.register("description")} />{typeForm.formState.errors.description && <p className="text-xs text-destructive">{typeForm.formState.errors.description.message}</p>}</div>{typeForm.formState.errors.root && <p role="alert" className="text-xs text-destructive">{typeForm.formState.errors.root.message}</p>}{matchingType && <Button type="button" variant="outline" size="sm" onClick={() => { form.setValue("accessoryTypeId", matchingType.id, { shouldValidate: true, shouldDirty: true }); setTypeDialogOpen(false); setMatchingType(null); typeForm.reset(); }}>Select existing {matchingType.typeName}</Button>}</form><DialogFooter><Button type="button" variant="outline" disabled={createType.isPending} onClick={() => setTypeDialogOpen(false)}>Cancel</Button><Button type="submit" form="new-accessory-type-form" disabled={createType.isPending}>{createType.isPending ? "Creating..." : "Create & Select"}</Button></DialogFooter></DialogContent>
    </Dialog>
  </>;
}

function AccessoryTypeSelector({ options, selected, open, onOpenChange, loading, error, retry, onSelect }: { options: AccessoryTypeLookupResponse[]; selected?: AccessoryTypeLookupResponse; open: boolean; onOpenChange: (open: boolean) => void; loading: boolean; error: string | null; retry: () => void; onSelect: (id: number) => void }) {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const filtered = options.filter((item) => item.typeName.toLowerCase().includes(search.trim().toLowerCase()));
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open, onOpenChange]);
  function choose(item: AccessoryTypeLookupResponse) { onSelect(item.id); onOpenChange(false); setSearch(""); }
  function openList() { onOpenChange(true); setActive(0); requestAnimationFrame(() => inputRef.current?.focus()); }
  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") { event.preventDefault(); onOpenChange(false); }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setActive((current) => Math.max(0, Math.min(filtered.length - 1, current + (event.key === "ArrowDown" ? 1 : -1)))); }
    if (event.key === "Enter" && filtered[active]) { event.preventDefault(); choose(filtered[active]); }
  }
  return <div ref={rootRef} className="relative mt-1.5">
    <Button type="button" variant="outline" role="combobox" aria-expanded={open} aria-controls={listId} aria-labelledby="accessory-type-label" className="h-9 w-full justify-between border-border bg-background font-normal text-foreground shadow-none hover:bg-muted/50" onClick={() => open ? onOpenChange(false) : openList()}>{selected?.typeName || (loading ? "Loading types..." : "Select accessory type")}<ChevronDown className="size-4 opacity-60" /></Button>
    {open && <div className="absolute inset-x-0 top-full z-[55] mt-1 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"><Input ref={inputRef} role="combobox" aria-label="Search accessory types" aria-expanded={open} aria-controls={listId} aria-activedescendant={filtered[active] ? `${listId}-${filtered[active].id}` : undefined} placeholder="Search types..." value={search} onChange={(event) => { setSearch(event.target.value); setActive(0); }} onKeyDown={onKeyDown} className="h-8 border-border bg-background text-xs text-foreground focus-visible:ring-2 focus-visible:ring-ring/30" /><div id={listId} role="listbox" aria-label="Accessory types" className="mt-1 max-h-48 overflow-y-auto overscroll-contain touch-pan-y">{loading ? <p className="p-2 text-xs text-muted-foreground">Loading types...</p> : error ? <div role="alert" className="space-y-1 p-2 text-xs text-destructive"><p>{error}</p><Button type="button" variant="outline" size="sm" onClick={retry}>Retry</Button></div> : filtered.length === 0 ? <p className="p-2 text-xs text-muted-foreground">No accessory types found.</p> : filtered.map((item, index) => <button id={`${listId}-${item.id}`} key={item.id} type="button" role="option" aria-selected={item.id === selected?.id} onMouseEnter={() => setActive(index)} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(item)} className={`flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground ${index === active ? "bg-accent text-accent-foreground" : ""}`}>{item.typeName}{item.id === selected?.id && <Check className="size-3.5" />}</button>)}</div></div>}
  </div>;
}
