"use client";

import { useMemo, useState } from "react";
import { Boxes, Layers3, SearchX, Sparkles } from "lucide-react";

import AppHeader from "@/components/layout/AppHeader";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    AddMachineDialog,
    MachineCard,
    MachineFilterBar,
    MachinePagination,
    PageState,
    emptyFilters,
    type MachineFilterValues,
} from "@/features/machine/components";
import { useMachines } from "@/features/machine/hooks";

export default function MachineListPage() {
    const [filters, setFilters] =
        useState<MachineFilterValues>(emptyFilters);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const {
        data,
        isLoading,
        isError,
    } = useMachines();

    const machines = useMemo(
        () => data?.items ?? [],
        [data?.items]
    );

    /*
     * Filter Machines
     */
    const filteredMachines = useMemo(() => {
        const keyword = filters.keyword.trim().toLowerCase();
        const machineCode = filters.machineCode.trim().toLowerCase();
        const modelCode = filters.modelCode.trim().toLowerCase();
        const warrantyTypeCode =
            filters.warrantyTypeCode.trim().toLowerCase();
        const warrantyPeriod = filters.warrantyPeriod.trim();

        return machines.filter((machine) => {
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
                !machine.machineCode
                    .toLowerCase()
                    .includes(machineCode)
            ) {
                return false;
            }

            if (
                modelCode &&
                !machine.models.some((model) =>
                    model.modelCode
                        .toLowerCase()
                        .includes(modelCode)
                )
            ) {
                return false;
            }

            const warranties =
                machine.models.flatMap(
                    (model) => model.warranties
                );

            if (
                warrantyTypeCode &&
                !warranties.some((warranty) =>
                    warranty.warrantyTypeCode
                        .toLowerCase()
                        .includes(warrantyTypeCode)
                )
            ) {
                return false;
            }

            if (
                warrantyPeriod &&
                !warranties.some(
                    (warranty) =>
                        String(
                            warranty.warrantyPeriod
                        ) === warrantyPeriod
                )
            ) {
                return false;
            }

            if (
                filters.warrantyPeriodUnit &&
                !warranties.some(
                    (warranty) =>
                        warranty.warrantyPeriodUnit ===
                        filters.warrantyPeriodUnit
                )
            ) {
                return false;
            }

            if (
                filters.ruleType &&
                !warranties.some(
                    (warranty) =>
                        warranty.ruleType ===
                        filters.ruleType
                )
            ) {
                return false;
            }

            return true;
        });
    }, [machines, filters]);

    /*
     * Pagination
     */
    const totalItems = filteredMachines.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalItems / pageSize)
    );

    const currentPage = Math.min(page, totalPages);

    const paginatedMachines = useMemo(() => {
        const start =
            (currentPage - 1) * pageSize;

        return filteredMachines.slice(
            start,
            start + pageSize
        );
    }, [
        filteredMachines,
        currentPage,
        pageSize,
    ]);

    /*
     * Dashboard Summary
     */
    const totalCount = machines.length;

    const activeCount =
        machines.filter((m) => m.isActive).length;

    const categoryCount = new Set(
        machines.map((m) => m.category)
    ).size;

    /*
     * Handlers
     */
    function handleFilterChange(
        next: MachineFilterValues
    ) {
        setFilters(next);
        setPage(1);
    }

    function handlePageSizeChange(
        nextPageSize: number
    ) {
        setPageSize(nextPageSize);
        setPage(1);
    }

    /*
     * Loading State
     */
    if (isLoading) {
        return (
            <>
                <AppHeader title="Machines" />
                <main className="p-4 sm:p-6">
                    <PageState
                        title="Loading machines..."
                        description="Fetching machine data from the server."
                    />
                </main>
            </>
        );
    }

    /*
     * Error State
     */
    if (isError) {
        return (
            <>
                <AppHeader title="Machines" />
                <main className="p-4 sm:p-6">
                    <PageState
                        title="Failed to load machines"
                        description="Please refresh the page and try again."
                    />
                </main>
            </>
        );
    }

    return (
        <>
            <AppHeader
                title="Machines"
                description="Search and manage registered machines, models and warranties."
                actions={<AddMachineDialog />}
            />

            <main className="space-y-6 p-4 sm:p-6">

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                    <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-sky-500/10 shadow-sm">
                        <CardHeader className="relative pb-2">
                            <span className="pointer-events-none absolute -right-7 -top-7 size-16 rounded-full bg-sky-400/15 blur-xl" />
                            <div className="flex items-center justify-between gap-3">
                                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                                    Total Machines
                                </CardDescription>
                                <span className="inline-flex size-8 items-center justify-center rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300">
                                    <Boxes className="size-4" />
                                </span>
                            </div>

                            <CardTitle className="mt-2 text-3xl">
                                {totalCount}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="text-sm text-muted-foreground">
                            Registered machines.
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-emerald-500/10 shadow-sm">
                        <CardHeader className="relative pb-2">
                            <span className="pointer-events-none absolute -right-7 -top-7 size-16 rounded-full bg-emerald-400/15 blur-xl" />
                            <div className="flex items-center justify-between gap-3">
                                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                                    Active Machines
                                </CardDescription>
                                <span className="inline-flex size-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                                    <Sparkles className="size-4" />
                                </span>
                            </div>

                            <CardTitle className="mt-2 text-3xl">
                                {activeCount}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="text-sm text-muted-foreground">
                            Currently active.
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-violet-500/10 shadow-sm">
                        <CardHeader className="relative pb-2">
                            <span className="pointer-events-none absolute -right-7 -top-7 size-16 rounded-full bg-violet-400/15 blur-xl" />
                            <div className="flex items-center justify-between gap-3">
                                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                                    Categories
                                </CardDescription>
                                <span className="inline-flex size-8 items-center justify-center rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-300">
                                    <Layers3 className="size-4" />
                                </span>
                            </div>

                            <CardTitle className="mt-2 text-3xl">
                                {categoryCount}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="text-sm text-muted-foreground">
                            Registered categories.
                        </CardContent>
                    </Card>

                </section>

                <section className="space-y-4">

                    <MachineFilterBar
                        values={filters}
                        onChange={handleFilterChange}
                    />

                    {paginatedMachines.length > 0 ? (

                        <div className="grid gap-5 lg:grid-cols-2">

                            {paginatedMachines.map((machine) => (
                                <MachineCard
                                    key={machine.machineCode}
                                    machine={machine}
                                />
                            ))}

                        </div>

                    ) : (

                        <PageState
                            title="No machines found"
                            description="Try changing your filters."
                            icon={<SearchX className="size-8" />}
                        />

                    )}

                    {totalItems > 0 && (

                        <MachinePagination
                            page={currentPage}
                            pageSize={pageSize}
                            totalItems={totalItems}
                            onPageChange={setPage}
                            onPageSizeChange={
                                handlePageSizeChange
                            }
                        />

                    )}

                </section>

            </main>
        </>
    );
}