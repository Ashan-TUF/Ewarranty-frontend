"use client";

import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    Clock,
    Copy,
    Gauge,
    ShieldCheck,
    ShieldX,
} from "lucide-react";

import AppHeader from "@/components/layout/AppHeader";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

import { demoMachines } from "../data/demo-machines";

function formatDate(dateValue?: string) {
    if (!dateValue) return "—";
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(dateValue));
}

const ruleTypeLabels: Record<string, string> = {
    TimeOnly: "Time Only",
    CopyOnly: "Copy Only",
    TimeOrHours: "Time or Hours",
};

interface WarrantyDetailsPageProps {
    machineCode: string;
    modelCode: string;
    warrantyTypeCode: string;
}

export default function WarrantyDetailsPage({
    machineCode,
    modelCode,
    warrantyTypeCode,
}: WarrantyDetailsPageProps) {
    const machine = demoMachines.find((m) => m.machineCode === machineCode);
    const model = machine?.models.find((m) => m.modelCode === modelCode);
    const warranty = model?.warranties.find(
        (w) => w.warrantyTypeCode === warrantyTypeCode
    );

    if (!machine || !model || !warranty) {
        return (
            <>
                <AppHeader title="Warranty not found" />
                <main className="p-6">
                    <div className="rounded-xl border border-dashed py-16 text-center">
                        <p className="font-medium">
                            No warranty found with code{" "}
                            <span className="font-mono">{warrantyTypeCode}</span>
                        </p>
                        <Link
                            href={ROUTES.MACHINE_MODEL_DETAILS(machineCode, modelCode)}
                            className="mt-3 inline-block text-sm text-primary hover:underline"
                        >
                            Back to model
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <AppHeader
                title={warranty.warrantyTypeName}
                description={`Warranty details for ${model.modelName}.`}
            />

            <main className="space-y-6 p-6">
                <Link
                    href={ROUTES.MACHINE_MODEL_DETAILS(machineCode, modelCode)}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to {model.modelName}
                </Link>

                <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono text-[11px]">
                                        {warranty.warrantyTypeCode}
                                    </Badge>
                                    <Badge variant={warranty.isActive ? "secondary" : "destructive"}>
                                        {warranty.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <CardTitle className="mt-1.5 text-xl">
                                    {warranty.warrantyTypeName}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {machine.machineName} &middot; {model.modelName} (
                                    {model.modelCode})
                                </CardDescription>
                            </div>

                            {warranty.isActive ? (
                                <ShieldCheck className="size-8 text-emerald-500" />
                            ) : (
                                <ShieldX className="size-8 text-muted-foreground" />
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {warranty.description && (
                            <p className="text-sm text-muted-foreground">
                                {warranty.description}
                            </p>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl bg-muted/40 p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Warranty Period
                                </p>
                                <p className="mt-1 flex items-center gap-2 font-medium">
                                    <Clock className="size-4 text-primary" />
                                    {warranty.warrantyPeriod} {warranty.warrantyPeriodUnit}
                                </p>
                            </div>

                            <div className="rounded-xl bg-muted/40 p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Rule Type
                                </p>
                                <p className="mt-1 font-medium">
                                    {ruleTypeLabels[warranty.ruleType] ?? warranty.ruleType}
                                </p>
                            </div>

                            {warranty.warrantyCopyLimit != null && (
                                <div className="rounded-xl bg-muted/40 p-3">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Copy Limit
                                    </p>
                                    <p className="mt-1 flex items-center gap-2 font-medium">
                                        <Copy className="size-4 text-primary" />
                                        {warranty.warrantyCopyLimit.toLocaleString()} copies
                                    </p>
                                </div>
                            )}

                            {warranty.warrantyHourLimit != null && (
                                <div className="rounded-xl bg-muted/40 p-3">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Hour Limit
                                    </p>
                                    <p className="mt-1 flex items-center gap-2 font-medium">
                                        <Gauge className="size-4 text-primary" />
                                        {warranty.warrantyHourLimit.toLocaleString()} hours
                                    </p>
                                </div>
                            )}

                            <div className="rounded-xl bg-muted/40 p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Registered
                                </p>
                                <p className="mt-1 flex items-center gap-2 font-medium">
                                    <CalendarDays className="size-4 text-primary" />
                                    {formatDate(warranty.createdAt)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}