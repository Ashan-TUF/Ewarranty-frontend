"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CategoryCombobox } from "../CategoryCombobox";
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
import { useMachineCategories } from "../../hooks/useMachineCategories";
import {
    createMachineSchema,
    MachineCategory,
    type CreateMachineForm,
} from "../../schemas/machine.schema";

export function AddMachineDialog() {
    const [open, setOpen] = useState(false);

    const createMachineMutation = useCreateMachine();
    const {
        data: machineCategories = [],
        isLoading: isMachineCategoriesLoading,
        isError: isMachineCategoriesError,
    } = useMachineCategories();

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

    useEffect(() => {
        if (open && isMachineCategoriesError) {
            toast.error("Failed to load machine categories.");
        }
    }, [isMachineCategoriesError, open]);

    function handleDialogChange(nextOpen: boolean) {
        if (createMachineMutation.isPending) {
            return;
        }

        setOpen(nextOpen);

        if (!nextOpen) {
            reset();
        }
    }

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

            toast.success("Machine added successfully.");

            reset();

            setOpen(false);
        } catch (error) {
            if (error instanceof AxiosError) {
                const data = error.response?.data;
                const message = data?.message as
                    | string
                    | undefined;

                if (data?.errors) {
                    const serverErrors =
                        data.errors as Record<
                            string,
                            string[]
                        >;

                    let firstServerError: string | undefined;

                    Object.entries(serverErrors).forEach(
                        ([field, messages]) => {
                            if (
                                !firstServerError &&
                                messages[0]
                            ) {
                                firstServerError =
                                    messages[0];
                            }

                            setError(
                                field as keyof CreateMachineForm,
                                {
                                    type: "server",
                                    message: messages[0],
                                }
                            );
                        }
                    );

                    toast.error(
                        firstServerError ||
                        message ||
                        "Failed to add machine."
                    );
                    return;
                }

                toast.error(
                    message ||
                    "Failed to add machine."
                );
                return;
            }

            toast.error("Failed to add machine.");
        }
    }

    function onInvalid(formErrors: typeof errors) {
        const firstError =
            Object.values(formErrors)[0]?.message;

        if (firstError) {
            toast.error(firstError as string);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={handleDialogChange}
        >
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

            <DialogContent
                className="
                    max-h-[calc(100dvh-2rem)] overflow-y-auto
                    rounded-2xl border border-border
                    bg-popover
                    p-0
                    shadow-lg
                    sm:max-w-[600px]
                "
            >
                <div>
                    <div className="border-b border-border/70 px-5 py-4 sm:px-6">
                        <DialogHeader className="gap-1">
                            <DialogTitle className="text-base font-medium tracking-tight">
                                Register Machine
                            </DialogTitle>

                            <DialogDescription className="text-xs font-normal">
                                Add a new machine to the
                                system.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <form
                        id="add-machine-form"
                        className="space-y-4 px-5 py-4 sm:px-6"
                        onSubmit={handleSubmit(
                            onSubmit,
                            onInvalid
                        )}
                    >
                        <div className="grid gap-4 sm:grid-cols-2">

                            <div className="space-y-2">
                                <label
                                    htmlFor="machineName"
                                    className="text-xs font-normal"
                                >
                                    Machine Name
                                </label>

                                <Input
                                    id="machineName"
                                    placeholder="e.g. Multifunction Printer"
                                    autoFocus
                                    className={cn(
                                        "h-10 border-border bg-muted/25 text-[13px] font-normal placeholder:text-xs hover:border-foreground/30 focus-visible:border-ring focus-visible:ring-ring/40",
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

                            <div className="space-y-2">
                                <label
                                    htmlFor="manufacturer"
                                    className="text-xs font-normal"
                                >
                                    Manufacturer
                                </label>

                                <Input
                                    id="manufacturer"
                                    placeholder="e.g. Ricoh"
                                    className={cn(
                                        "h-10 border-border bg-muted/25 text-[13px] font-normal placeholder:text-xs hover:border-foreground/30 focus-visible:border-ring focus-visible:ring-ring/40",
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

                        <div className="space-y-2">
                            <label
                                htmlFor="category"
                                className="text-xs font-normal"
                            >
                                Category
                            </label>

                            <Controller
                                control={control}
                                name="category"
                                render={({ field }) => (
                                    <CategoryCombobox
                                        categories={machineCategories}
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        disabled={isMachineCategoriesLoading || isMachineCategoriesError}
                                        loading={isMachineCategoriesLoading}
                                        invalid={!!errors.category}
                                    />
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

                        <div className="space-y-2">
                            <label
                                htmlFor="description"
                                className="text-xs font-normal"
                            >
                                Description{" "}
                                <span className="font-normal text-muted-foreground">
                                    (optional)
                                </span>
                            </label>

                            <Textarea
                                id="description"
                                rows={3}
                                placeholder="Add a short description..."
                                className={cn(
                                    "min-h-20 resize-y border-border bg-muted/25 text-[13px] font-normal placeholder:text-xs hover:border-foreground/30 focus-visible:border-ring focus-visible:ring-ring/40",
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

                    <div
                        className="
                            flex
                            justify-end
                            gap-2
                            border-t
                            border-border/70
                            px-5
                            py-3
                            sm:px-6
                        "
                    >
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs font-normal"
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
                            size="sm"
                            className="text-xs font-normal"
                            disabled={
                                createMachineMutation.isPending
                            }
                        >
                            {createMachineMutation.isPending && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
                            {createMachineMutation.isPending
                                ? "Saving..."
                                : "Save Machine"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
