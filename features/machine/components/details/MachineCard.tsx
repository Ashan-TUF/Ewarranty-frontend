"use client";

import Link from "next/link";
import { Activity, ArrowRight, Boxes, CalendarDays, Factory, ShieldCheck, Sparkles, Tag } from "lucide-react";

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
    const isZeroWarrantyHealth = warrantyHealth === 0;
    const visibleModels = machine.models.slice(0, 4);
    const hiddenModelsCount = Math.max(machine.models.length - visibleModels.length, 0);

    return (
        <Card className="rounded-2xl border-border/70 bg-card/80 shadow-sm backdrop-blur">
            <CardHeader className="space-y-3 px-4 pb-3 pt-4">
                <div className="flex items-start justify-between gap-2.5">
                    <div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="px-1.5 py-0.5 font-mono text-[10px]">
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
                        <CardTitle className="mt-1 text-base">
                            {machine.machineName}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1.5 text-xs">
                            <Factory className="size-4" />
                            {machine.manufacturer}
                        </CardDescription>
                    </div>

                    <Badge variant="secondary" className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px]">
                        <Tag className="size-3" />
                        Type: {machine.category}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 px-4 pb-4 pt-0">
                {machine.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                        {machine.description}
                    </p>
                )}

                <div className="grid gap-2 sm:grid-cols-4">
                    <div className="rounded-lg bg-muted/40 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Models
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                            <Boxes className="size-3.5 text-primary" />
                            {modelsCount}
                        </p>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Active Models
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                            <Sparkles className="size-3.5 text-primary" />
                            {activeModelsCount}
                        </p>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Warranties
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                            <ShieldCheck className="size-3.5 text-primary" />
                            {activeWarrantiesCount}/{warrantiesCount} active
                        </p>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Registered
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                            <CalendarDays className="size-3.5 text-primary" />
                            {formatDate(machine.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="machine-heart-panel rounded-lg border border-border/60 bg-muted/30 p-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Warranty Health
                        </p>

                        <div className="flex items-center gap-2 text-xs">
                            <span
                                className={cn(
                                    "rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                                    isZeroWarrantyHealth
                                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                )}
                            >
                                {modelsWithActiveWarrantyCount}/{modelsCount} models covered
                            </span>
                            {inactiveModelsCount > 0 && (
                                <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300">
                                    {inactiveModelsCount} inactive models
                                </span>
                            )}
                        </div>
                    </div>

                    <div
                        className={cn(
                            "mt-2.5 rounded-lg px-2 py-1.5",
                            isZeroWarrantyHealth
                                ? "border border-rose-500/25 bg-rose-500/5"
                                : "border border-emerald-500/20 bg-emerald-500/5"
                        )}
                    >
                        <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <Activity
                                    className={cn(
                                        "size-3.5",
                                        isZeroWarrantyHealth ? "text-rose-500" : "text-emerald-500"
                                    )}
                                />
                                Coverage Bloom
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span
                                    className={cn(
                                        "machine-warranty-status-dot",
                                        isZeroWarrantyHealth && "machine-warranty-status-dot-danger"
                                    )}
                                />
                                {warrantyHealth}%
                            </span>
                        </div>

                        <div
                            className={cn(
                                "machine-warranty-cute-track relative h-9 overflow-hidden rounded-md",
                                isZeroWarrantyHealth
                                    ? "border border-rose-500/25 bg-rose-500/5"
                                    : "border border-emerald-500/20 bg-emerald-500/5"
                            )}
                        >
                            <div
                                className={cn(
                                    "machine-warranty-cute-fill absolute inset-y-0 left-0 overflow-hidden",
                                    isZeroWarrantyHealth
                                        ? "machine-warranty-cute-fill-danger"
                                        : "machine-warranty-cute-fill-safe"
                                )}
                                style={{ width: `${Math.max(10, warrantyHealth)}%` }}
                                aria-hidden="true"
                            >
                                <span className="machine-warranty-cute-wave machine-warranty-cute-wave-a" />
                                <span className="machine-warranty-cute-wave machine-warranty-cute-wave-b" />
                                <span className="machine-warranty-cute-wave machine-warranty-cute-wave-c" />
                            </div>
                            <span className="machine-warranty-cute-spark machine-warranty-cute-spark-1" aria-hidden="true" />
                            <span className="machine-warranty-cute-spark machine-warranty-cute-spark-2" aria-hidden="true" />
                            <span className="machine-warranty-cute-spark machine-warranty-cute-spark-3" aria-hidden="true" />
                            <span className="machine-warranty-cute-spark machine-warranty-cute-spark-4" aria-hidden="true" />
                        </div>
                    </div>

                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                            className={cn(
                                "machine-warranty-fill relative h-full rounded-full",
                                isZeroWarrantyHealth
                                    ? "machine-warranty-fill-danger bg-rose-500/85"
                                    : "bg-emerald-500/85"
                            )}
                            style={{ width: `${warrantyHealth}%` }}
                            aria-hidden="true"
                        >
                            <span
                                className={cn(
                                    "machine-warranty-bar-glow",
                                    isZeroWarrantyHealth && "machine-warranty-bar-glow-danger"
                                )}
                            />
                        </div>
                    </div>

                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {warrantyHealth}% model coverage by active warranties
                    </p>
                </div>

                {modelsCount > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                        {visibleModels.map((model) => (
                            <Badge key={model.modelCode} variant="outline" className="text-[11px]">
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

                <div className="flex justify-end pt-0.5">
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