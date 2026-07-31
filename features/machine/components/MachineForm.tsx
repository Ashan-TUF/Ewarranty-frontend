"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes";

import { useCreateMachine } from "../hooks/useCreateMachine";
import { useMachineCategories } from "../hooks/useMachineCategories";
import { createMachineSchema, MachineCategory, type CreateMachineForm } from "../schemas/machine.schema";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MachineForm() {
    const router = useRouter();
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
        if (createMachineMutation.isSuccess) {
            reset();
        }
    }, [createMachineMutation.isSuccess, reset]);

    const onSubmit = async (values: CreateMachineForm) => {
        try {
            await createMachineMutation.mutateAsync({
                machineName: values.machineName,
                manufacturer: values.manufacturer,
                category: values.category as MachineCategory,
                description: values.description?.trim() || undefined,
            });
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.errors) {
                const data = error.response.data;

                Object.entries(data.errors as Record<string, string[]>).forEach(
                    ([field, messages]) => {
                        setError(field as keyof CreateMachineForm, {
                            type: "server",
                            message: messages[0],
                        });
                    }
                );
            }
        }
    };

    const onInvalid = (formErrors: typeof errors) => {
        const firstError = Object.values(formErrors)[0]?.message;
        if (firstError) {
            toast.error(firstError as string);
        }
    };

    return (
        <Card className="mx-auto max-w-4xl">
            <CardHeader>
                <CardTitle>Register Machine</CardTitle>
                <CardDescription>
                    Add a new machine to the system.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit, onInvalid)}>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="machineName">
                                Machine Name
                            </label>

                            <Input
                                id="machineName"
                                placeholder="Enter machine name"
                                className={cn(errors.machineName && "border-destructive focus-visible:ring-destructive")}
                                {...register("machineName")}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="manufacturer">
                                Manufacturer
                            </label>

                            <Input
                                id="manufacturer"
                                placeholder="Enter manufacturer"
                                className={cn(errors.manufacturer && "border-destructive focus-visible:ring-destructive")}
                                {...register("manufacturer")}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="category">
                            Category
                        </label>

                        <Controller
                            control={control}
                            name="category"
                            render={({ field }) => (
                                <Select
                                    value={field.value ?? ""}
                                    disabled={isMachineCategoriesLoading || isMachineCategoriesError}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger
                                        className={cn("w-full", errors.category && "border-destructive focus-visible:ring-destructive")}
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

                                        {!isMachineCategoriesLoading && !isMachineCategoriesError &&
                                            machineCategories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.name}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="description">
                            Description
                        </label>

                        <Textarea
                            id="description"
                            rows={5}
                            placeholder="Enter description"
                            className={cn(errors.description && "border-destructive focus-visible:ring-destructive")}
                            {...register("description")}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(ROUTES.MACHINES)}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" disabled={createMachineMutation.isPending}>
                            {createMachineMutation.isPending ? "Saving..." : "Save Machine"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}