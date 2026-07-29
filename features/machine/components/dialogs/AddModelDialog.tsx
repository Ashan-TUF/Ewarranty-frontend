"use client";

import { useState } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import type {
    CreateMachineModelRequest,
} from "../../types/machine";

import {
    colorTypeOptions,
    createMachineModelSchema,
    networkTypeOptions,
    type CreateMachineModelForm,
} from "../../schemas/machine-model.schema";
import { useCreateMachineModel } from "../../hooks/useCreateMachineModel";

interface AddModelDialogProps {
    machineCode: string;
}

export function AddModelDialog({
    machineCode,
}: AddModelDialogProps) {
    const [open, setOpen] = useState(false);
    const createModel = useCreateMachineModel();

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<CreateMachineModelForm>({
        resolver: zodResolver(createMachineModelSchema),
        defaultValues: {
            modelName: "",
            description: "",
            colorType: "",
            networkType: "",
        },
    });

    async function onSubmit(values: CreateMachineModelForm) {
        try {
            const request: CreateMachineModelRequest = {
                machineCode,
                modelName: values.modelName.trim(),
                description: values.description?.trim() || undefined,
                colorType: values.colorType
                    ? (values.colorType as "Color" | "Monochrome")
                    : undefined,
                networkType: values.networkType
                    ? (values.networkType as "USB" | "Network" | "Wireless")
                    : undefined,
            };

            await createModel.mutateAsync(request);

            reset();
            setOpen(false);
        } catch {
            // Handle error if needed
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) reset();
            }}
        >
            <DialogTrigger render={<Button size="sm" type="button" />}>
                <Plus className="size-4" />
                Add Model
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Model</DialogTitle>
                    <DialogDescription>
                        Register a new model under machine{" "}
                        <span className="font-mono">{machineCode}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="add-model-form"
                    className="space-y-4"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium" htmlFor="modelName">
                            Model Name
                        </label>
                        <Input
                            id="modelName"
                            placeholder="e.g. IM C3001"
                            className={cn(
                                errors.modelName &&
                                "border-destructive focus-visible:ring-destructive"
                            )}
                            {...register("modelName")}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium" htmlFor="description">
                            Description{" "}
                            <span className="font-normal text-muted-foreground">
                                (optional)
                            </span>
                        </label>
                        <Textarea
                            id="description"
                            rows={3}
                            placeholder="e.g. A3 Color Multifunction Printer"
                            {...register("description")}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Color Type</label>
                            <ModelSelectField
                                control={control}
                                name="colorType"
                                placeholder="Select"
                                options={colorTypeOptions}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Network Type</label>
                            <ModelSelectField
                                control={control}
                                name="networkType"
                                placeholder="Select"
                                options={networkTypeOptions}
                            />
                        </div>
                    </div>
                </form>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" form="add-model-form" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Model"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Small helper so Select (an uncontrolled-by-default base-ui component) plugs
// cleanly into react-hook-form.
function ModelSelectField({
    control,
    name,
    placeholder,
    options,
}: {
    control: Control<CreateMachineModelForm>;
    name: "colorType" | "networkType";
    placeholder: string;
    options: readonly string[];
}) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        />
    );
}