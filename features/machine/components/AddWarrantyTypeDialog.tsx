"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
} from "../schemas/warranty-type.schema";

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
        await onSubmit(values);

        reset();
        onOpenChange(false);
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
            <DialogContent className="sm:max-w-md">
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
                    onSubmit={handleSubmit(handleCreate)}
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