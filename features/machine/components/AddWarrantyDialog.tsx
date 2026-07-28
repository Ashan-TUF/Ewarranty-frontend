"use client";

import { useState } from "react";
import {
    Controller,
    useForm,
    useWatch,
    type Control,
} from "react-hook-form";
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

import {
    createModelWarrantySchema,
    warrantyPeriodUnitOptions,
    warrantyRuleTypeOptions,
    type CreateModelWarrantyForm,
} from "../schemas/model-warranty.schema";

import type { CreateWarrantyTypeForm } from "../schemas/warranty-type.schema";

import { useWarrantyTypes } from "../hooks/useWarrantyTypes"; 
import { useCreateWarrantyType } from "../hooks/useCreateWarrantyType";
import { useCreateModelWarranty } from "../hooks/useCreateModelWarranty";

import { AddWarrantyTypeDialog } from "./AddWarrantyTypeDialog";

interface AddWarrantyDialogProps {
    machineCode: string;
    modelCode: string;
}

export function AddWarrantyDialog({
    machineCode,
    modelCode,
}: AddWarrantyDialogProps) {
    const [open, setOpen] = useState(false);
    const [warrantyTypeOpen, setWarrantyTypeOpen] =
        useState(false);

    const { data: warrantyTypes = [], isLoading } =
        useWarrantyTypes();

    const createWarranty =
        useCreateModelWarranty(machineCode, modelCode);

    const createWarrantyType =
        useCreateWarrantyType();

    const {
        register,
        handleSubmit,
        reset,
        control,
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

    async function onSubmit(values: CreateModelWarrantyForm) {
        await createWarranty.mutateAsync(values);

        reset();
        setOpen(false);
    }

    async function handleCreateWarrantyType(
        values: CreateWarrantyTypeForm
    ) {
        const created =
            await createWarrantyType.mutateAsync(values);

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

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(next) => {
                    setOpen(next);

                    if (!next) {
                        reset();
                    }
                }}
            >
                <DialogTrigger
                    render={<Button size="sm" type="button" />}
                >
                    <Plus className="size-4" />
                    Add Warranty
                </DialogTrigger>

                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add Warranty</DialogTitle>

                        <DialogDescription>
                            Add a warranty to model{" "}
                            <span className="font-mono">
                                {modelCode}
                            </span>{" "}
                            under machine{" "}
                            <span className="font-mono">
                                {machineCode}
                            </span>.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        id="add-warranty-form"
                        className="space-y-4"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        {/* Warranty Type */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
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
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue
                                                placeholder={
                                                    isLoading
                                                        ? "Loading..."
                                                        : "Select warranty type"
                                                }
                                            />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {warrantyTypes.map(
                                                (type) => (
                                                    <SelectItem
                                                        key={
                                                            type.warrantyTypeCode
                                                        }
                                                        value={
                                                            type.warrantyTypeCode
                                                        }
                                                    >
                                                        {
                                                            type.warrantyTypeName
                                                        }
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />

                            {errors.warrantyTypeCode && (
                                <p className="text-sm text-destructive">
                                    {errors.warrantyTypeCode.message}
                                </p>
                            )}
                        </div>

                        {/* Period */}
                        <div className="grid grid-cols-2 gap-4">
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
                                        {errors.warrantyPeriod.message}
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
                            </div>
                        </div>

                        {/* Rule */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">
                                Warranty Rule
                            </label>

                            <WarrantySelectField
                                control={control}
                                name="ruleType"
                                options={warrantyRuleTypeOptions}
                            />
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
                                            setValueAs: (value) =>
                                                value === ""
                                                    ? undefined
                                                    : Number(value),
                                        }
                                    )}
                                />

                                {errors.warrantyCopyLimit && (
                                    <p className="text-sm text-destructive">
                                        {
                                            errors.warrantyCopyLimit
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
                                            setValueAs: (value) =>
                                                value === ""
                                                    ? undefined
                                                    : Number(value),
                                        }
                                    )}
                                />

                                {errors.warrantyHourLimit && (
                                    <p className="text-sm text-destructive">
                                        {
                                            errors.warrantyHourLimit
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
                                <span className="text-muted-foreground">
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
                                    {errors.description.message}
                                </p>
                            )}
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

                        <Button
                            type="submit"
                            form="add-warranty-form"
                            disabled={createWarranty.isPending}
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

function WarrantySelectField({
    control,
    name,
    options,
}: {
    control: Control<CreateModelWarrantyForm>;
    name: "warrantyPeriodUnit" | "ruleType";
    options: readonly string[];
}) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <Select
                    value={field.value}
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