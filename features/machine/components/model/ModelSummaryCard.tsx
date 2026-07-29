"use client";

import {
    ArrowRight,
    Plus,
    ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import type {
    MachineResponse,
    MachineModelResponse,
} from "../../types/machine";

interface ModelSummaryCardProps {
    machine: MachineResponse;
    model: MachineModelResponse;

    onViewDetails?: (model: MachineModelResponse) => void;
    onAddWarranty?: (model: MachineModelResponse) => void;
}

export function ModelSummaryCard({
    machine,
    model,
    onViewDetails,
    onAddWarranty,
}: ModelSummaryCardProps) {
    const warrantyCount = model.warranties.length;

    return (
        <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    {/* Model Information */}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className="font-mono text-[11px]"
                            >
                                {model.modelCode}
                            </Badge>

                            {model.isActive ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
                                    Active
                                </span>
                            ) : (
                                <Badge variant="destructive">Inactive</Badge>
                            )}
                        </div>

                        <CardTitle className="mt-2 truncate text-lg">
                            {model.modelName}
                        </CardTitle>

                        <CardDescription className="mt-1">
                            {machine.machineName}
                            {" · "}
                            {machine.machineCode}
                        </CardDescription>
                    </div>

                    {/* Model Attributes */}
                    <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                        {model.colorType && (
                            <Badge variant="secondary">
                                {model.colorType}
                            </Badge>
                        )}

                        {model.networkType && (
                            <Badge variant="secondary">
                                {model.networkType}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Description */}
                {model.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                        {model.description}
                    </p>
                )}

                {/* Warranty Summary + Actions */}
                <div className="flex flex-col gap-3 rounded-xl bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Warranties
                        </p>

                        <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                            <ShieldCheck className="size-4 text-primary" />

                            {warrantyCount}

                            <span className="font-normal text-muted-foreground">
                                {warrantyCount === 1
                                    ? "warranty"
                                    : "warranties"}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Add Warranty */}
                        {onAddWarranty && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    onAddWarranty(model)
                                }
                            >
                                <Plus className="size-4" />
                                Add Warranty
                            </Button>
                        )}

                        {/* View Details */}
                        {onViewDetails && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    onViewDetails(model)
                                }
                            >
                                View Details
                                <ArrowRight className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}