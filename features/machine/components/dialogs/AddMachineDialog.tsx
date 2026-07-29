"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { useCreateMachine } from "../../hooks/useCreateMachine";
import {
    createMachineSchema,
    MachineCategory,
    type CreateMachineForm,
} from "../../schemas/machine.schema";
import { machineCategoryOptions } from "../../types/machine";

export function AddMachineDialog() {
    const [open, setOpen] = useState(false);

    const createMachineMutation = useCreateMachine();

    const {
        control,
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<CreateMachineForm>({
        resolver: zodResolver(createMachineSchema),

        defaultValues: {
            machineName: "",
            manufacturer: "",
            category: "",
            description: "",
        },
    });

    /* =========================================================
       DIALOG
    ========================================================= */

    function handleDialogChange(nextOpen: boolean) {
        if (createMachineMutation.isPending) {
            return;
        }

        setOpen(nextOpen);

        if (!nextOpen) {
            reset();
        }
    }

    /* =========================================================
       SUBMIT
    ========================================================= */

    async function onSubmit(values: CreateMachineForm) {
        try {
            await createMachineMutation.mutateAsync({
                machineName: values.machineName.trim(),

                manufacturer: values.manufacturer.trim(),

                category:
                    values.category as MachineCategory,

                description:
                    values.description?.trim() ||
                    undefined,
            });

            reset();

            setOpen(false);
        } catch (error) {
            if (
                error instanceof AxiosError &&
                error.response?.data?.errors
            ) {
                const data = error.response.data;

                Object.entries(
                    data.errors as Record<
                        string,
                        string[]
                    >
                ).forEach(([field, messages]) => {
                    setError(
                        field as keyof CreateMachineForm,
                        {
                            type: "server",
                            message: messages[0],
                        }
                    );
                });
            }
        }
    }

    /* =========================================================
       INVALID FORM
    ========================================================= */

    function onInvalid(formErrors: typeof errors) {
        const firstError =
            Object.values(formErrors)[0]?.message;

        if (firstError) {
            toast.error(firstError as string);
        }
    }

    /* =========================================================
       UI
    ========================================================= */

    return (
        <Dialog
            open={open}
            onOpenChange={handleDialogChange}
        >
            {/* =================================================
                TRIGGER BUTTON
            ================================================= */}

            <DialogTrigger
                render={
                    <Button
                        type="button"
                        size="sm"
                    />
                }
            >
                <Plus className="size-4" />

                Register New Machine
            </DialogTrigger>

            {/* =================================================
                DIALOG
            ================================================= */}

            <DialogContent
                className="
                    overflow-hidden
                    border-border/60
                    bg-background/95
                    p-0
                    shadow-2xl
                    backdrop-blur-xl
                    sm:max-w-2xl
                "
            >
                {/* =============================================
                    MOTION CONTAINER
                ============================================== */}

                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.96,
                        y: 12,
                        filter: "blur(8px)",
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        filter: "blur(0px)",
                    }}
                    transition={{
                        duration: 0.35,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                >
                    {/* =========================================
                        HEADER
                    ========================================== */}

                    <div className="border-b border-border/60 px-6 py-5">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold tracking-tight">
                                Register Machine
                            </DialogTitle>

                            <DialogDescription>
                                Add a new machine to the
                                system.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {/* =========================================
                        FORM
                    ========================================== */}

                    <form
                        id="add-machine-form"
                        className="space-y-5 px-6 py-6"
                        onSubmit={handleSubmit(
                            onSubmit,
                            onInvalid
                        )}
                    >
                        {/* =====================================
                            MACHINE NAME + MANUFACTURER
                        ====================================== */}

                        <div className="grid gap-5 md:grid-cols-2">
                            {/* Machine Name */}

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="machineName"
                                    className="text-sm font-medium"
                                >
                                    Machine Name
                                </label>

                                <Input
                                    id="machineName"
                                    placeholder="e.g. Multifunction Printer"
                                    autoFocus
                                    className={cn(
                                        "h-10",
                                        errors.machineName &&
                                        "border-destructive focus-visible:ring-destructive"
                                    )}
                                    {...register(
                                        "machineName"
                                    )}
                                />

                                {errors.machineName
                                    ?.message && (
                                        <p className="text-xs text-destructive">
                                            {
                                                errors
                                                    .machineName
                                                    .message
                                            }
                                        </p>
                                    )}
                            </div>

                            {/* Manufacturer */}

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="manufacturer"
                                    className="text-sm font-medium"
                                >
                                    Manufacturer
                                </label>

                                <Input
                                    id="manufacturer"
                                    placeholder="e.g. Ricoh"
                                    className={cn(
                                        "h-10",
                                        errors.manufacturer &&
                                        "border-destructive focus-visible:ring-destructive"
                                    )}
                                    {...register(
                                        "manufacturer"
                                    )}
                                />

                                {errors.manufacturer
                                    ?.message && (
                                        <p className="text-xs text-destructive">
                                            {
                                                errors
                                                    .manufacturer
                                                    .message
                                            }
                                        </p>
                                    )}
                            </div>
                        </div>

                        {/* =====================================
                            CATEGORY
                        ====================================== */}

                        <div className="space-y-1.5">
                            <label
                                htmlFor="category"
                                className="text-sm font-medium"
                            >
                                Category
                            </label>

                            <Controller
                                control={control}
                                name="category"
                                render={({ field }) => (
                                    <Select
                                        value={
                                            field.value ??
                                            ""
                                        }
                                        onValueChange={(
                                            value
                                        ) =>
                                            field.onChange(
                                                value ??
                                                ""
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            id="category"
                                            className={cn(
                                                "h-10 w-full",
                                                errors.category &&
                                                "border-destructive focus-visible:ring-destructive"
                                            )}
                                        >
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {machineCategoryOptions.map(
                                                (
                                                    category
                                                ) => (
                                                    <SelectItem
                                                        key={
                                                            category
                                                        }
                                                        value={
                                                            category
                                                        }
                                                    >
                                                        {
                                                            category
                                                        }
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />

                            {errors.category?.message && (
                                <p className="text-xs text-destructive">
                                    {
                                        errors.category
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        {/* =====================================
                            DESCRIPTION
                        ====================================== */}

                        <div className="space-y-1.5">
                            <label
                                htmlFor="description"
                                className="text-sm font-medium"
                            >
                                Description{" "}
                                <span className="font-normal text-muted-foreground">
                                    (optional)
                                </span>
                            </label>

                            <Textarea
                                id="description"
                                rows={4}
                                placeholder="Add a short description..."
                                className={cn(
                                    "resize-none",
                                    errors.description &&
                                    "border-destructive focus-visible:ring-destructive"
                                )}
                                {...register(
                                    "description"
                                )}
                            />

                            {errors.description
                                ?.message && (
                                    <p className="text-xs text-destructive">
                                        {
                                            errors.description
                                                .message
                                        }
                                    </p>
                                )}
                        </div>
                    </form>

                    {/* =========================================
                        FOOTER
                    ========================================== */}

                    <div
                        className="
                            flex
                            justify-end
                            gap-2
                            border-t
                            border-border/60
                            bg-muted/20
                            px-6
                            py-4
                        "
                    >
                        <Button
                            type="button"
                            variant="outline"
                            disabled={
                                createMachineMutation.isPending
                            }
                            onClick={() =>
                                handleDialogChange(
                                    false
                                )
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            form="add-machine-form"
                            disabled={
                                createMachineMutation.isPending
                            }
                        >
                            {createMachineMutation.isPending
                                ? "Saving..."
                                : "Save Machine"}
                        </Button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}