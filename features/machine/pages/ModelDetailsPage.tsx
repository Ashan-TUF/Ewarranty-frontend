"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    ShieldX,
} from "lucide-react";

import AppHeader from "@/components/layout/AppHeader";
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

import { demoMachines } from "../data/demo-machines";
import { MachinePagination } from "../components/MachinePagination";

interface ModelDetailsPageProps {
    machineCode: string;
    modelCode: string;
}

export default function ModelDetailsPage({
    machineCode,
    modelCode,
}: ModelDetailsPageProps) {
    const machine = demoMachines.find((m) => m.machineCode === machineCode);
    const model = machine?.models.find((m) => m.modelCode === modelCode);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    if (!machine || !model) {
        return (
            <>
                <AppHeader title="Model not found" />
                <main className="p-6">
                    <div className="rounded-xl border border-dashed py-16 text-center">
                        <p className="font-medium">
                            No model found with code{" "}
                            <span className="font-mono">{modelCode}</span>
                        </p>
                        <Link
                            href={ROUTES.MACHINE_DETAILS(machineCode)}
                            className="mt-3 inline-block text-sm text-primary hover:underline"
                        >
                            Back to machine
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    const totalPages = Math.max(1, Math.ceil(model.warranties.length / pageSize));
    const currentPage = Math.min(page, totalPages);

    const paginatedWarranties = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return model.warranties.slice(start, start + pageSize);
    }, [model.warranties, currentPage, pageSize]);

    function handlePageSizeChange(next: number) {
        setPageSize(next);
        setPage(1);
    }

    return (
        <>
            <AppHeader
                title={model.modelName}
                description={`Model details and warranties for ${model.modelCode}.`}
            />

            <main className="space-y-6 p-6">
                <Link
                    href={ROUTES.MACHINE_DETAILS(machineCode)}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to {machine.machineName}
                </Link>

                <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <Badge variant="outline" className="font-mono text-[11px]">
                                    {model.modelCode}
                                </Badge>
                                <CardTitle className="mt-1.5 text-xl">
                                    {model.modelName}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {machine.machineName} &middot; {machine.machineCode}
                                </CardDescription>
                            </div>

                            <div className="flex flex-wrap justify-end gap-1.5">
                                {model.colorType && (
                                    <Badge variant="secondary">{model.colorType}</Badge>
                                )}
                                {model.networkType && (
                                    <Badge variant="secondary">{model.networkType}</Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    {model.description && (
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {model.description}
                            </p>
                        </CardContent>
                    )}
                </Card>

                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-muted-foreground">
                        Warranties ({model.warranties.length})
                    </h2>

                    {model.warranties.length === 0 ? (
                        <div className="rounded-xl border border-dashed py-12 text-center">
                            <p className="font-medium">No warranties added yet</p>
                            <p className="text-sm text-muted-foreground">
                                Add a warranty for this model to see it listed here.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                {paginatedWarranties.map((warranty) => (
                                    <Link
                                        key={warranty.warrantyTypeCode}
                                        href={ROUTES.MACHINE_MODEL_WARRANTY_DETAILS(
                                            machineCode,
                                            modelCode,
                                            warranty.warrantyTypeCode
                                        )}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur transition-colors hover:bg-muted/40"
                                    >
                                        <div className="flex items-center gap-3">
                                            {warranty.isActive ? (
                                                <ShieldCheck className="size-5 text-emerald-500" />
                                            ) : (
                                                <ShieldX className="size-5 text-muted-foreground" />
                                            )}

                                            <div>
                                                <p className="font-medium">
                                                    {warranty.warrantyTypeName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {warranty.warrantyTypeCode} &middot;{" "}
                                                    {warranty.warrantyPeriod}{" "}
                                                    {warranty.warrantyPeriodUnit}
                                                </p>
                                            </div>
                                        </div>

                                        <div
                                            className={cn(
                                                buttonVariants({
                                                    variant: "ghost",
                                                    size: "icon-sm",
                                                })
                                            )}
                                            aria-label="View warranty details"
                                        >
                                            <ArrowRight className="size-4" />
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {model.warranties.length > pageSize && (
                                <MachinePagination
                                    page={currentPage}
                                    pageSize={pageSize}
                                    totalItems={model.warranties.length}
                                    onPageChange={setPage}
                                    onPageSizeChange={handlePageSizeChange}
                                />
                            )}
                        </>
                    )}
                </section>
            </main>
        </>
    );
}