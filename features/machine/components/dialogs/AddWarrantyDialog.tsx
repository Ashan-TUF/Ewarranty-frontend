"use client";

import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import {
    Controller,
    useForm,
    useWatch,
    type Control,
} from "react-hook-form";
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
} from "@/components/ui/dialog";

import {
    createModelWarrantySchema,
    warrantyPeriodUnitOptions,
    warrantyRuleTypeOptions,
    type CreateModelWarrantyForm,
} from "../../schemas/model-warranty.schema";

import type { CreateWarrantyTypeForm } from "../../schemas/warranty-type.schema";
import type { WarrantyTypeOption } from "../../types/warranty.types";

import { useWarrantyTypes } from "../../hooks/useWarrantyTypes";
import { useCreateWarrantyType } from "../../hooks/useCreateWarrantyType";
import { useCreateModelWarranty } from "../../hooks/useCreateModelWarranty";

import { AddWarrantyTypeDialog } from "./AddWarrantyTypeDialog"; 

interface AddWarrantyDialogProps {
    machineCode: string;
    modelCode: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddWarrantyDialog({
    machineCode,
    modelCode,
    open,
    onOpenChange,
}: AddWarrantyDialogProps) {
    const [warrantyTypeOpen, setWarrantyTypeOpen] =
        useState(false);
    const [createdWarrantyType, setCreatedWarrantyType] =
        useState<WarrantyTypeOption | null>(null);

    const {
        data: warrantyTypes = [],
        isLoading: isLoadingWarrantyTypes,
    } = useWarrantyTypes();

    const warrantyTypeOptions = useMemo(() => {
        if (!createdWarrantyType) {
            return warrantyTypes;
        }

        const exists = warrantyTypes.some(
            (type) => type.warrantyTypeCode === createdWarrantyType.warrantyTypeCode
        );

        return exists
            ? warrantyTypes
            : [createdWarrantyType, ...warrantyTypes];
    }, [createdWarrantyType, warrantyTypes]);

    const createWarranty =
        useCreateModelWarranty(machineCode, modelCode);

    const createWarrantyType =
        useCreateWarrantyType();

    const {
        register,
        handleSubmit,
        reset,
        control,
        setError,
        setValue,
        formState: { errors },
    } = useForm<CreateModelWarrantyForm>({
        resolver: zodResolver(createModelWarrantySchema),
        defaultValues: {
            warrantyTypeCode: "",
            warrantyPeriod: 12,
            warrantyPeriodUnit: "Months",
            warrantyCopyLimit: undefined,
            warrantyHourLimit: undefined,
            ruleType: "TimeOnly",
            description: "",
        },
    });

    const ruleType = useWatch({
        control,
        name: "ruleType",
    });

    async function onSubmit(
        values: CreateModelWarrantyForm
    ) {
        try {
            const payload: CreateModelWarrantyForm = {
                ...values,
                description: values.description?.trim() || undefined,
                warrantyCopyLimit:
                    values.ruleType === "TimeOrCopies"
                        ? values.warrantyCopyLimit
                        : undefined,
                warrantyHourLimit:
                    values.ruleType === "TimeOrHours"
                        ? values.warrantyHourLimit
                        : undefined,
            };

            await createWarranty.mutateAsync(payload);

            toast.success("Model warranty created successfully.");

            reset();
            onOpenChange(false);
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data?.message as string | undefined;
                toast.error(message || "Failed to create model warranty.");
                return;
            }

            if (error instanceof Error) {
                const validationErrors = (
                    error as Error & {
                        validationErrors?: Record<string, string[]>;
                    }
                ).validationErrors;

                if (validationErrors) {
                    let firstServerError: string | undefined;

                    Object.entries(validationErrors).forEach(([field, messages]) => {
                        if (!firstServerError && messages[0]) {
                            firstServerError = messages[0];
                        }

                        setError(field as keyof CreateModelWarrantyForm, {
                            type: "server",
                            message: messages[0],
                        });
                    });

                    toast.error(firstServerError || error.message);
                    return;
                }

                toast.error(error.message);
                return;
            }

            toast.error("Failed to create model warranty.");
        }
    }

    function onInvalid(formErrors: typeof errors) {
        const firstError = Object.values(formErrors)[0]?.message;

        if (firstError) {
            toast.error(firstError as string);
        }
    }

    async function handleCreateWarrantyType(
        values: CreateWarrantyTypeForm
    ) {
        const created =
            await createWarrantyType.mutateAsync(values);

        setCreatedWarrantyType(created);

        setValue(
            "warrantyTypeCode",
            created.warrantyTypeCode,
            {
                shouldValidate: true,
                shouldDirty: true,
            }
        );

        setWarrantyTypeOpen(false);
    }

    function handleDialogOpenChange(
        nextOpen: boolean
    ) {
        onOpenChange(nextOpen);

        if (!nextOpen) {
            reset();
            setWarrantyTypeOpen(false);
            setCreatedWarrantyType(null);
        }
    }

    function handleCancel() {
        handleDialogOpenChange(false);
    }

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={handleDialogOpenChange}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            Add Warranty
                        </DialogTitle>

                        <DialogDescription>
                            Add a warranty to model{" "}
                            <span className="font-mono">
                                {modelCode}
                            </span>{" "}
                            under machine{" "}
                            <span className="font-mono">
                                {machineCode}
                            </span>
                            .
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        id="add-warranty-form"
                        className="space-y-4"
                        onSubmit={handleSubmit(onSubmit, onInvalid)}
                    >
                        {/* Warranty Type */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-3">
                                <label className="text-sm font-medium">
                                    Warranty Type
                                </label>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        setWarrantyTypeOpen(true)
                                    }
                                >
                                    <Plus className="size-4" />
                                    New Type
                                </Button>
                            </div>

                            <Controller
                                control={control}
                                name="warrantyTypeCode"
                                render={({ field }) => {
                                    const selectedType = warrantyTypeOptions.find(
                                        (type) => type.warrantyTypeCode === field.value
                                    );

                                    return (
                                        <Select
                                            value={field.value ?? ""}
                                            onValueChange={field.onChange}
                                            disabled={isLoadingWarrantyTypes}
                                        >
                                            <SelectTrigger className="w-full">
                                                {selectedType ? (
                                                    <span>{selectedType.warrantyTypeName}</span>
                                                ) : (
                                                    <SelectValue
                                                        placeholder={
                                                            isLoadingWarrantyTypes
                                                                ? "Loading warranty types..."
                                                                : "Select warranty type"
                                                        }
                                                    />
                                                )}
                                            </SelectTrigger>

                                            <SelectContent>
                                                {warrantyTypeOptions.map((type) => (
                                                    <SelectItem
                                                        key={type.warrantyTypeCode}
                                                        value={type.warrantyTypeCode}
                                                    >
                                                        {type.warrantyTypeName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    );
                                }}
                            />

                            {errors.warrantyTypeCode && (
                                <p className="text-sm text-destructive">
                                    {
                                        errors
                                            .warrantyTypeCode
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        {/* Warranty Period */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="warrantyPeriod"
                                    className="text-sm font-medium"
                                >
                                    Warranty Period
                                </label>

                                <Input
                                    id="warrantyPeriod"
                                    type="number"
                                    min={1}
                                    {...register(
                                        "warrantyPeriod",
                                        {
                                            valueAsNumber: true,
                                        }
                                    )}
                                />

                                {errors.warrantyPeriod && (
                                    <p className="text-sm text-destructive">
                                        {
                                            errors
                                                .warrantyPeriod
                                                .message
                                        }
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">
                                    Period Unit
                                </label>

                                <WarrantySelectField
                                    control={control}
                                    name="warrantyPeriodUnit"
                                    options={
                                        warrantyPeriodUnitOptions
                                    }
                                />

                                {errors.warrantyPeriodUnit && (
                                    <p className="text-sm text-destructive">
                                        {
                                            errors
                                                .warrantyPeriodUnit
                                                .message
                                        }
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Warranty Rule */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">
                                Warranty Rule
                            </label>

                            <WarrantySelectField
                                control={control}
                                name="ruleType"
                                options={
                                    warrantyRuleTypeOptions
                                }
                            />

                            {errors.ruleType && (
                                <p className="text-sm text-destructive">
                                    {errors.ruleType.message}
                                </p>
                            )}
                        </div>

                        {/* Copy Limit */}
                        {ruleType === "TimeOrCopies" && (
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="warrantyCopyLimit"
                                    className="text-sm font-medium"
                                >
                                    Copy Limit
                                </label>

                                <Input
                                    id="warrantyCopyLimit"
                                    type="number"
                                    min={1}
                                    placeholder="e.g. 100000"
                                    {...register(
                                        "warrantyCopyLimit",
                                        {
                                            setValueAs: (
                                                value
                                            ) =>
                                                value === ""
                                                    ? undefined
                                                    : Number(
                                                          value
                                                      ),
                                        }
                                    )}
                                />

                                {errors.warrantyCopyLimit && (
                                    <p className="text-sm text-destructive">
                                        {
                                            errors
                                                .warrantyCopyLimit
                                                .message
                                        }
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Hour Limit */}
                        {ruleType === "TimeOrHours" && (
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="warrantyHourLimit"
                                    className="text-sm font-medium"
                                >
                                    Hour Limit
                                </label>

                                <Input
                                    id="warrantyHourLimit"
                                    type="number"
                                    min={1}
                                    placeholder="e.g. 5000"
                                    {...register(
                                        "warrantyHourLimit",
                                        {
                                            setValueAs: (
                                                value
                                            ) =>
                                                value === ""
                                                    ? undefined
                                                    : Number(
                                                          value
                                                      ),
                                        }
                                    )}
                                />

                                {errors.warrantyHourLimit && (
                                    <p className="text-sm text-destructive">
                                        {
                                            errors
                                                .warrantyHourLimit
                                                .message
                                        }
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="warrantyDescription"
                                className="text-sm font-medium"
                            >
                                Description{" "}
                                <span className="font-normal text-muted-foreground">
                                    (optional)
                                </span>
                            </label>

                            <Textarea
                                id="warrantyDescription"
                                rows={3}
                                placeholder="e.g. Warranty expires after 12 months or 5000 hours"
                                {...register("description")}
                            />

                            {errors.description && (
                                <p className="text-sm text-destructive">
                                    {
                                        errors.description
                                            .message
                                    }
                                </p>
                            )}
                        </div>
                    </form>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={
                                createWarranty.isPending
                            }
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            form="add-warranty-form"
                            disabled={
                                createWarranty.isPending
                            }
                        >
                            {createWarranty.isPending
                                ? "Saving..."
                                : "Save Warranty"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AddWarrantyTypeDialog
                open={warrantyTypeOpen}
                onOpenChange={setWarrantyTypeOpen}
                onSubmit={handleCreateWarrantyType}
            />
        </>
    );
}

interface WarrantySelectFieldProps {
    control: Control<CreateModelWarrantyForm>;
    name: "warrantyPeriodUnit" | "ruleType";
    options: readonly string[];
}

function WarrantySelectField({
    control,
    name,
    options,
}: WarrantySelectFieldProps) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>

                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem
                                key={option}
                                value={option}
                            >
                                {formatOption(option)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        />
    );
}

function formatOption(value: string) {
    return value.replace(
        /([a-z])([A-Z])/g,
        "$1 $2"
    );
}