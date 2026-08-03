"use client";

import { useEffect, useState } from "react";
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
                    overflow-hidden
                    border-border/60
                    bg-background/1
                    p-0
                    shadow-2xl
                    backdrop-blur-3xl
                    sm:max-w-2xl
                "
            >
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

                    <form
                        id="add-machine-form"
                        className="space-y-5 px-6 py-6"
                        onSubmit={handleSubmit(
                            onSubmit,
                            onInvalid
                        )}
                    >
                        <div className="grid gap-5 md:grid-cols-2">

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
                                        disabled={
                                            isMachineCategoriesLoading ||
                                            isMachineCategoriesError
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
                                            {isMachineCategoriesLoading && (
                                                <SelectItem value="__loading" disabled>
                                                    Loading categories...
                                                </SelectItem>
                                            )}

                                            {isMachineCategoriesError && (
                                                <SelectItem value="__error" disabled>
                                                    Failed to load categories
                                                </SelectItem>
                                            )}

                                            {!isMachineCategoriesLoading &&
                                                !isMachineCategoriesError &&
                                                machineCategories.map((category) => (
                                                    <SelectItem
                                                        key={
                                                            category.id
                                                        }
                                                        value={
                                                            category.name
                                                        }
                                                    >
                                                        {
                                                            category.name
                                                        }
                                                    </SelectItem>
                                                ))}
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