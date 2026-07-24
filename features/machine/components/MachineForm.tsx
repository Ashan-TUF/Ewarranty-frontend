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
import { createMachineSchema, type CreateMachineForm } from "../schemas/machine.schema";
import { machineCategoryOptions } from "../types/machine";

export default function MachineForm() {
    const router = useRouter();
    const createMachineMutation = useCreateMachine();

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateMachineForm>({
        resolver: zodResolver(createMachineSchema),
        defaultValues: {
            machineName: "",
            manufacturer: "",
            category: undefined,
            description: "",
        },
    });

    useEffect(() => {
        if (createMachineMutation.isSuccess) {
            reset();
        }
    }, [createMachineMutation.isSuccess, reset]);

    const onSubmit = async (values: CreateMachineForm) => {
        await createMachineMutation.mutateAsync(values);
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
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="machineName">
                                Machine Name
                            </label>

                            <Input
                                id="machineName"
                                placeholder="Enter machine name"
                                {...register("machineName")}
                            />

                            {errors.machineName ? (
                                <p className="text-sm text-destructive">
                                    {errors.machineName.message}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="manufacturer">
                                Manufacturer
                            </label>

                            <Input
                                id="manufacturer"
                                placeholder="Enter manufacturer"
                                {...register("manufacturer")}
                            />

                            {errors.manufacturer ? (
                                <p className="text-sm text-destructive">
                                    {errors.manufacturer.message}
                                </p>
                            ) : null}
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
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger id="category" className="w-full">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {machineCategoryOptions.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />

                        {errors.category ? (
                            <p className="text-sm text-destructive">
                                {errors.category.message}
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="description">
                            Description
                        </label>

                        <Textarea
                            id="description"
                            rows={5}
                            placeholder="Enter description"
                            {...register("description")}
                        />

                        {errors.description ? (
                            <p className="text-sm text-destructive">
                                {errors.description.message}
                            </p>
                        ) : null}
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