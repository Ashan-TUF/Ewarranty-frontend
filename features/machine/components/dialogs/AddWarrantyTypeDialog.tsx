"use client";

import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    createWarrantyTypeSchema,
    type CreateWarrantyTypeForm,
} from "../../schemas/warranty-type.schema";

interface AddWarrantyTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CreateWarrantyTypeForm) => Promise<void>;
}

export function AddWarrantyTypeDialog({
    open,
    onOpenChange,
    onSubmit,
}: AddWarrantyTypeDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateWarrantyTypeForm>({
        resolver: zodResolver(createWarrantyTypeSchema),
        defaultValues: {
            warrantyTypeName: "",
            description: "",
        },
    });

    async function handleCreate(values: CreateWarrantyTypeForm) {
        try {
            await onSubmit(values);

            toast.success("Warranty type added successfully.");

            reset();
            onOpenChange(false);
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data?.message as string | undefined;
                toast.error(message || "Failed to add warranty type.");
                return;
            }

            toast.error("Failed to add warranty type.");
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
                onOpenChange(next);

                if (!next) {
                    reset();
                }
            }}
        >
            <DialogContent className="sm:max-w-md bg-background/1 backdrop-blur-3xl">
                <DialogHeader>
                    <DialogTitle>Add Warranty Type</DialogTitle>

                    <DialogDescription>
                        Register a new warranty type without leaving
                        the warranty form.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="add-warranty-type-form"
                    className="space-y-4"
                    onSubmit={handleSubmit(handleCreate, onInvalid)}
                >
                    <div className="space-y-1.5">
                        <label
                            htmlFor="warrantyTypeName"
                            className="text-sm font-medium"
                        >
                            Warranty Type Name
                        </label>

                        <Input
                            id="warrantyTypeName"
                            placeholder="e.g. Standard Warranty"
                            {...register("warrantyTypeName")}
                        />

                        {errors.warrantyTypeName && (
                            <p className="text-sm text-destructive">
                                {errors.warrantyTypeName.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="warrantyTypeDescription"
                            className="text-sm font-medium"
                        >
                            Description{" "}
                            <span className="text-muted-foreground">
                                (optional)
                            </span>
                        </label>

                        <Textarea
                            id="warrantyTypeDescription"
                            rows={3}
                            placeholder="e.g. Manufacturer standard warranty."
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
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        form="add-warranty-type-form"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Creating..."
                            : "Create Warranty Type"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}