"use client";

import Link from "next/link";
import { ArrowRight, Boxes, CalendarDays, Factory, ShieldCheck } from "lucide-react";

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
import type { DemoMachine } from "../data/demo-machines";

function formatDate(dateValue: string) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(dateValue));
}

interface MachineCardProps {
    machine: DemoMachine;
}

export function MachineCard({ machine }: MachineCardProps) {
    const modelsCount = machine.models.length;
    const warrantiesCount = machine.models.reduce(
        (sum, model) => sum + model.warranties.length,
        0
    );
    const activeWarrantiesCount = machine.models.reduce(
        (sum, model) =>
            sum + model.warranties.filter((w) => w.isActive).length,
        0
    );

    return (
        <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-[11px]">
                                {machine.machineCode}
                            </Badge>
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

                    <Badge variant="secondary">{machine.category}</Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {machine.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {machine.description}
                    </p>
                )}

                <div className="grid gap-3 sm:grid-cols-3">
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

                {modelsCount > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {machine.models.map((model) => (
                            <Badge key={model.modelCode} variant="outline">
                                {model.modelCode} &middot; {model.modelName}
                            </Badge>
                        ))}
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