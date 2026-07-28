"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, SearchX } from "lucide-react";

import AppHeader from "@/components/layout/AppHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import { demoMachines } from "../data/demo-machines";
import {
    MachineFilterBar,
    emptyFilters,
    type MachineFilterValues,
} from "../components/MachineFilterBar";
import { MachineCard } from "../components/MachineCard";
import { MachinePagination } from "../components/MachinePagination";

export default function MachineListPage() {
    const [filters, setFilters] = useState<MachineFilterValues>(emptyFilters);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filteredMachines = useMemo(() => {
        const keyword = filters.keyword.trim().toLowerCase();
        const machineCode = filters.machineCode.trim().toLowerCase();
        const modelCode = filters.modelCode.trim().toLowerCase();
        const warrantyTypeCode = filters.warrantyTypeCode.trim().toLowerCase();
        const warrantyPeriod = filters.warrantyPeriod.trim();

        return demoMachines.filter((machine) => {
            if (
                keyword &&
                !`${machine.machineName} ${machine.manufacturer} ${machine.machineCode}`
                    .toLowerCase()
                    .includes(keyword)
            ) {
                return false;
            }

            if (
                machineCode &&
                !machine.machineCode.toLowerCase().includes(machineCode)
            ) {
                return false;
            }

            const models = machine.models;

            if (
                modelCode &&
                !models.some((m) => m.modelCode.toLowerCase().includes(modelCode))
            ) {
                return false;
            }

            const warranties = models.flatMap((m) => m.warranties);

            if (
                warrantyTypeCode &&
                !warranties.some((w) =>
                    w.warrantyTypeCode.toLowerCase().includes(warrantyTypeCode)
                )
            ) {
                return false;
            }

            if (
                warrantyPeriod &&
                !warranties.some((w) => String(w.warrantyPeriod) === warrantyPeriod)
            ) {
                return false;
            }

            if (
                filters.warrantyPeriodUnit &&
                !warranties.some(
                    (w) => w.warrantyPeriodUnit === filters.warrantyPeriodUnit
                )
            ) {
                return false;
            }

            if (
                filters.ruleType &&
                !warranties.some((w) => w.ruleType === filters.ruleType)
            ) {
                return false;
            }

            return true;
        });
    }, [filters]);

    const totalItems = filteredMachines.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(page, totalPages);

    const paginatedMachines = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredMachines.slice(start, start + pageSize);
    }, [filteredMachines, currentPage, pageSize]);

    function handleFilterChange(next: MachineFilterValues) {
        setFilters(next);
        setPage(1);
    }

    function handlePageSizeChange(next: number) {
        setPageSize(next);
        setPage(1);
    }

    const totalCount = demoMachines.length;
    const activeCount = demoMachines.filter((m) => m.isActive).length;
    const categoryCount = new Set(demoMachines.map((m) => m.category)).size;

    return (
        <>
            <AppHeader
                title="Machines"
                description="Search and manage registered machines, models, and warranties."
                actions={(
                    <Link
                        href={ROUTES.MACHINE_CREATE}
                        className={cn(buttonVariants({ size: "sm" }))}
                    >
                        <Plus className="size-4" />
                        Register New Machine
                    </Link>
                )}
            />

            <main className="space-y-6 p-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardDescription>Total Machines</CardDescription>
                            <CardTitle className="text-3xl">{totalCount}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Registered machines across all categories.
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Active Machines</CardDescription>
                            <CardTitle className="text-3xl">{activeCount}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Currently active in the system.
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Categories</CardDescription>
                            <CardTitle className="text-3xl">{categoryCount}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Distinct machine categories registered.
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <MachineFilterBar values={filters} onChange={handleFilterChange} />

                    {paginatedMachines.length > 0 ? (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {paginatedMachines.map((machine) => (
                                <MachineCard key={machine.machineCode} machine={machine} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
                            <SearchX className="size-8 text-muted-foreground" />
                            <p className="font-medium">No machines found</p>
                            <p className="text-sm text-muted-foreground">
                                Try adjusting or clearing your filters.
                            </p>
                        </div>
                    )}

                    {totalItems > 0 && (
                        <MachinePagination
                            page={currentPage}
                            pageSize={pageSize}
                            totalItems={totalItems}
                            onPageChange={setPage}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    )}
                </section>
            </main>
        </>
    );
}