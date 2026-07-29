"use client";

import Link from "next/link";
import { ArrowRight, Boxes, CalendarDays, Factory, ShieldCheck, Sparkles, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type {
    MachineResponse,
} from "../../types/machine";

function formatDate(dateValue: string) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(dateValue));
}

interface MachineCardProps {
    machine: MachineResponse;
}

export function MachineCard({ machine }: MachineCardProps) {
    const modelsCount = machine.models.length;
    const activeModelsCount = machine.models.filter((model) => model.isActive).length;
    const warrantiesCount = machine.models.reduce(
        (sum, model) => sum + model.warranties.length,
        0
    );
    const activeWarrantiesCount = machine.models.reduce(
        (sum, model) =>
            sum + model.warranties.filter((w) => w.isActive).length,
        0
    );
    const modelsWithActiveWarrantyCount = machine.models.filter((model) =>
        model.warranties.some((warranty) => warranty.isActive)
    ).length;
    const inactiveModelsCount = Math.max(modelsCount - activeModelsCount, 0);
    const warrantyHealth = modelsCount > 0
        ? Math.round((modelsWithActiveWarrantyCount / modelsCount) * 100)
        : 0;
    const visibleModels = machine.models.slice(0, 4);
    const hiddenModelsCount = Math.max(machine.models.length - visibleModels.length, 0);

    return (
        <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-[11px]">
                                {machine.machineCode}
                            </Badge>
                            {machine.isActive && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
                                    Active
                                </span>
                            )}
                            {!machine.isActive && (
                                <Badge variant="destructive">Inactive</Badge>
                            )}
                        </div>
                        <CardTitle className="mt-1.5 text-lg">
                            {machine.machineName}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                            <Factory className="size-4" />
                            {machine.manufacturer}
                        </CardDescription>
                    </div>

                    <Badge variant="secondary" className="inline-flex items-center gap-1.5">
                        <Tag className="size-3.5" />
                        Type: {machine.category}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {machine.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {machine.description}
                    </p>
                )}

                <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Models
                        </p>
                        <p className="mt-1 flex items-center gap-2 font-medium">
                            <Boxes className="size-4 text-primary" />
                            {modelsCount}
                        </p>
                    </div>

                    <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Active Models
                        </p>
                        <p className="mt-1 flex items-center gap-2 font-medium">
                            <Sparkles className="size-4 text-primary" />
                            {activeModelsCount}
                        </p>
                    </div>

                    <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Warranties
                        </p>
                        <p className="mt-1 flex items-center gap-2 font-medium">
                            <ShieldCheck className="size-4 text-primary" />
                            {activeWarrantiesCount}/{warrantiesCount} active
                        </p>
                    </div>

                    <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Registered
                        </p>
                        <p className="mt-1 flex items-center gap-2 font-medium">
                            <CalendarDays className="size-4 text-primary" />
                            {formatDate(machine.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Warranty Health
                        </p>

                        <div className="flex items-center gap-2 text-xs">
                            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
                                {modelsWithActiveWarrantyCount}/{modelsCount} models covered
                            </span>
                            {inactiveModelsCount > 0 && (
                                <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300">
                                    {inactiveModelsCount} inactive models
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${warrantyHealth}%` }}
                            aria-hidden="true"
                        />
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                        {warrantyHealth}% model coverage by active warranties
                    </p>
                </div>

                {modelsCount > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {visibleModels.map((model) => (
                            <Badge key={model.modelCode} variant="outline">
                                <span className="inline-flex items-center gap-1.5">
                                    {model.isActive && (
                                        <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                                    )}
                                    {model.modelCode} &middot; {model.modelName}
                                </span>
                            </Badge>
                        ))}
                        {hiddenModelsCount > 0 && (
                            <Badge variant="secondary">+{hiddenModelsCount} more models</Badge>
                        )}
                    </div>
                )}

                <div className="flex justify-end pt-1">
                    <Link
                        href={ROUTES.MACHINE_DETAILS(machine.machineCode)}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                        View details
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}