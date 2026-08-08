"use client";

import { CheckCircle2, Clock3, Eye, MapPin, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import type { InstallationReport } from "../types/installation-report";

interface InstallationReportsCardsProps {
    reports: InstallationReport[];
    onConfirmClick: (report: InstallationReport) => void;
    onViewDetailsClick: (report: InstallationReport) => void;
}

function getStatusClasses(status: InstallationReport["installationStatus"]) {
    if (status === "Confirmed") {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status === "Pending") {
        return "border-amber-200 bg-amber-50 text-amber-700";
    }

    if (status === "Cancelled") {
        return "border-rose-200 bg-rose-50 text-rose-700";
    }

    return "border-slate-200 bg-slate-50 text-slate-700";
}

function formatDate(dateValue: string) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(dateValue));
}

export function InstallationReportsCards({
    reports,
    onConfirmClick,
    onViewDetailsClick,
}: InstallationReportsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reports.map((report) => (
                <Card
                    key={report.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onViewDetailsClick(report)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onViewDetailsClick(report);
                        }
                    }}
                    className="group cursor-pointer overflow-hidden border-border/70 bg-card/95 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                    <CardHeader className="space-y-3 border-b bg-gradient-to-br from-muted/40 via-card to-card pb-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1.5">
                                <CardTitle className="truncate text-[15px] leading-tight">
                                    {report.customerName}
                                </CardTitle>

                                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <span className="rounded-full border bg-background/80 px-2 py-0.5">ID {report.id}</span>
                                    <span className="rounded-full border bg-background/80 px-2 py-0.5">{report.customerCode}</span>
                                </div>
                            </div>

                            <Badge
                                variant="outline"
                                className={`shrink-0 font-medium ${getStatusClasses(report.installationStatus)}`}
                            >
                                {report.installationStatus}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-4">
                        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                            <p className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/20 px-2.5 py-1.5">
                                <User className="size-3.5" />
                                {report.installedBy || "-"}
                            </p>

                            <p className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/20 px-2.5 py-1.5">
                                <MapPin className="size-3.5" />
                                {report.city || "-"}
                            </p>

                            <p className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/20 px-2.5 py-1.5 sm:col-span-2">
                                <Clock3 className="size-3.5" />
                                {formatDate(report.installationDate)}
                            </p>
                        </div>

                        <div className="rounded-xl bg-muted/35 p-3 text-sm">
                            <p className="font-medium text-foreground">Machine</p>
                            <p className="mt-0.5 text-muted-foreground">
                                {report.machineModel} · {report.machineDescription || "-"}
                            </p>

                            <p className="mt-2 text-xs text-muted-foreground">
                                Serial: {report.serialNumber || "-"}
                            </p>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Invoice Number</p>
                                <p className="truncate text-sm font-semibold">
                                    {report.invoiceNumber?.trim() ? report.invoiceNumber : "Not assigned"}
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onViewDetailsClick(report);
                                    }}
                                >
                                    <Eye className="size-4" />
                                    View Details
                                </Button>

                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onConfirmClick(report);
                                    }}
                                >
                                    <CheckCircle2 className="size-4" />
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
