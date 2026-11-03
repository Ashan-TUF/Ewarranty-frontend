"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAccessory, useAccessoryMutations } from "./hooks";
import { accessoryError } from "./service";

const schema = z.object({ accessoryName: z.string().trim().min(1, "Accessory name is required.").max(100), description: z.string().max(500) });
type Values = z.infer<typeof schema>;

export function AccessoryFormDialog({ code, open, onOpenChange }: { code: string | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const detail = useAccessory(open ? code : null);
  const { create, update } = useAccessoryMutations();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { accessoryName: "", description: "" } });
  useEffect(() => { form.reset({ accessoryName: detail.data?.accessoryName || "", description: detail.data?.description || "" }); }, [detail.data, form]);
  const pending = create.isPending || update.isPending;

  async function submit(values: Values) {
    if (pending) return;
    const payload = { accessoryName: values.accessoryName, description: values.description.trim() || null };
    try {
      if (code) await update.mutateAsync({ code, payload });
      else await create.mutateAsync(payload);
      toast.success(code ? "Accessory updated." : "Accessory created.");
      onOpenChange(false);
      form.reset();
    } catch (error) { toast.error(accessoryError(error)); }
  }

  return <Dialog open={open} onOpenChange={(next) => { if (!pending) { onOpenChange(next); if (!next) form.reset(); } }}>
    <DialogContent className="sm:max-w-lg bg-background/1 backdrop-blur-3xl">
      <DialogHeader><DialogTitle>{code ? "Edit Accessory" : "Add Accessory"}</DialogTitle><DialogDescription>{code ? `Update ${code}.` : "The accessory code is assigned by the server."}</DialogDescription></DialogHeader>
      {code && detail.isLoading ? <p className="text-sm text-muted-foreground">Loading accessory...</p> : code && detail.isError ? <p className="text-xs text-destructive">{accessoryError(detail.error)}</p> :
      <form id="accessory-form" className="space-y-4" onSubmit={form.handleSubmit(submit)}>
        <div className="space-y-1.5"><label htmlFor="accessoryName" className="text-xs font-normal">Accessory Name</label><Input id="accessoryName" maxLength={100} {...form.register("accessoryName")} />{form.formState.errors.accessoryName && <p className="text-xs text-destructive">{form.formState.errors.accessoryName.message}</p>}</div>
        <div className="space-y-1.5"><label htmlFor="accessoryDescription" className="text-xs font-normal">Description</label><Textarea id="accessoryDescription" maxLength={500} rows={3} {...form.register("description")} />{form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}</div>
      </form>}
      <DialogFooter><Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" form="accessory-form" disabled={pending || !!(code && !detail.data)}>{pending ? "Saving..." : "Save Accessory"}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
