"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Controller, useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";

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
    MachineMetadataOption,
} from "../../types/machine";

import {
    createMachineModelSchema,
    type CreateMachineModelForm,
} from "../../schemas/machine-model.schema";
import { useCreateMachineModel } from "../../hooks/useCreateMachineModel";
import { useMachineColorTypes } from "../../hooks/useMachineColorTypes";
import { useMachineNetworkTypes } from "../../hooks/useMachineNetworkTypes";

interface AddModelDialogProps {
    machineCode: string;
}

export function AddModelDialog({
    machineCode,
}: AddModelDialogProps) {
    const [open, setOpen] = useState(false);
    const createModel = useCreateMachineModel();
    const {
        data: colorTypes = [],
        isLoading: isColorTypesLoading,
        isError: isColorTypesError,
    } = useMachineColorTypes();
    const {
        data: networkTypes = [],
        isLoading: isNetworkTypesLoading,
        isError: isNetworkTypesError,
    } = useMachineNetworkTypes();

    const {
        register,
        handleSubmit,
        reset,
        control,
        setError,
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

    useEffect(() => {
        if (open && isColorTypesError) {
            toast.error("Failed to load machine color types.");
        }
    }, [isColorTypesError, open]);

    useEffect(() => {
        if (open && isNetworkTypesError) {
            toast.error("Failed to load machine network types.");
        }
    }, [isNetworkTypesError, open]);

    async function onSubmit(values: CreateMachineModelForm) {
        try {
            const request: CreateMachineModelRequest = {
                machineCode,
                modelName: values.modelName.trim(),
                description: values.description?.trim() || undefined,
                colorType: values.colorType
                    ? values.colorType
                    : undefined,
                networkType: values.networkType
                    ? values.networkType
                    : undefined,
            };

            const createdModel = await createModel.mutateAsync(request);

            toast.success(
                `Machine model '${createdModel.modelName}' created successfully.`
            );

            reset();
            setOpen(false);
        } catch (error) {
            if (error instanceof AxiosError) {
                const statusCode = error.response?.status;
                const message = error.response?.data?.message as string | undefined;

                if (statusCode === 409) {
                    const duplicateMessage = message || "Machine model already exists.";
                    setError("modelName", {
                        type: "server",
                        message: duplicateMessage,
                    });
                    toast.error(duplicateMessage);
                    return;
                }

                toast.error(message || "Failed to create machine model.");
                return;
            }

            toast.error("Failed to create machine model.");
        }
    }

    function onInvalid(formErrors: typeof errors) {
        const firstError = Object.values(formErrors)[0]?.message;

        if (firstError) {
            toast.error(firstError as string);
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

            <DialogContent className="sm:max-w-md bg-background/1 backdrop-blur-3xl">
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
                    onSubmit={handleSubmit(onSubmit, onInvalid)}
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

                        {errors.modelName?.message && (
                            <p className="text-xs text-destructive">
                                {errors.modelName.message}
                            </p>
                        )}
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
                                placeholder={
                                    isColorTypesLoading
                                        ? "Loading..."
                                        : "Select"
                                }
                                options={colorTypes}
                                disabled={
                                    isColorTypesLoading ||
                                    isColorTypesError
                                }
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Network Type</label>
                            <ModelSelectField
                                control={control}
                                name="networkType"
                                placeholder={
                                    isNetworkTypesLoading
                                        ? "Loading..."
                                        : "Select"
                                }
                                options={networkTypes}
                                disabled={
                                    isNetworkTypesLoading ||
                                    isNetworkTypesError
                                }
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
    disabled,
}: {
    control: Control<CreateMachineModelForm>;
    name: "colorType" | "networkType";
    placeholder: string;
    options: MachineMetadataOption[];
    disabled?: boolean;
}) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={disabled}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {disabled && (
                            <SelectItem value="__loading" disabled>
                                Loading options...
                            </SelectItem>
                        )}

                        {!disabled && options.length === 0 && (
                            <SelectItem value="__empty" disabled>
                                No options found
                            </SelectItem>
                        )}

                        {!disabled && options.map((option) => (
                            <SelectItem key={option.id} value={option.name}>
                                {option.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        />
    );
}