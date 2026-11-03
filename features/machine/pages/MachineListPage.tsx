"use client";

import { useMemo, useRef, useState } from "react";
import { Boxes, Download, Layers3, Loader2, SearchX, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import AppHeader from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import { apiUrl } from "@/lib/api-url";

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

function MachineKpi({ label, value, detail, icon }: { label: string; value: number; detail: string; icon: React.ReactNode }) {
    return <Card size="sm" className="border border-border/70 shadow-none"><CardContent className="space-y-2"><div className="flex items-start justify-between gap-2"><CardDescription className="text-[11px] font-normal">{label}</CardDescription><span className="flex size-7 items-center justify-center rounded-lg bg-muted text-primary [&_svg]:size-3.5">{icon}</span></div><CardTitle className="text-[24px] leading-none font-normal tabular-nums">{value.toLocaleString()}</CardTitle><p className="text-[11px] text-muted-foreground">{detail}</p></CardContent></Card>;
}

export default function MachineListPage() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [filters, setFilters] =
        useState<MachineFilterValues>(emptyFilters);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const {
        data,
        isLoading,
        isError,
        refetch,
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

    function handleTemplateDownload() {
        const link = document.createElement("a");
        link.href = "/machine_bulk_upload_template.xlsx";
        link.download = "machine_bulk_upload_template.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function handlePickFile() {
        if (isUploading) {
            return;
        }

        fileInputRef.current?.click();
    }

    async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const isExcelFile =
            file.name.toLowerCase().endsWith(".xlsx") ||
            file.name.toLowerCase().endsWith(".xls");

        if (!isExcelFile) {
            toast.error("Please select an Excel file (.xlsx or .xls).");
            event.target.value = "";
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(apiUrl("/machine-imports"), {
                method: "POST",
                body: formData,
            });

            const responseText = await response.text();
            let payload: {
                success?: boolean;
                message?: string;
                data?: {
                    errors?: string[];
                };
            } | null = null;

            try {
                payload = responseText ? JSON.parse(responseText) : null;
            } catch {
                // Keep the raw response for servers that return non-JSON errors.
            }

            if (!response.ok) {
                const message =
                    payload?.message ||
                    responseText ||
                    `Machine bulk upload failed (HTTP ${response.status}).`;

                throw new Error(message);
            }

            const importErrors = payload?.data?.errors?.filter(Boolean) ?? [];

            await refetch();

            if (importErrors.length > 0) {
                toast.success(payload?.message || "Machine bulk upload completed successfully.");
                toast.error(
                    `Import completed with ${importErrors.length} row error(s): ${importErrors.join(" | ")}`
                );
                return;
            }

            toast.success(payload?.message || "Machine bulk upload completed successfully.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Machine bulk upload failed.");
        } finally {
            setIsUploading(false);
            event.target.value = "";
        }
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
                actions={
                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            className="hidden"
                            onChange={handleUploadFile}
                        />

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleTemplateDownload}
                        >
                            <Download className="size-4" />
                            Download Template
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            onClick={handlePickFile}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Upload className="size-4" />
                            )}
                            Upload Excel
                        </Button>

                        <AddMachineDialog />
                    </div>
                }
            />

            <main className="space-y-6 p-4 sm:p-6">

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <MachineKpi label="Total Machines" value={totalCount} detail="Registered inventory" icon={<Boxes />} />
                    <MachineKpi label="Active Machines" value={activeCount} detail="Currently active" icon={<Sparkles />} />
                    <MachineKpi label="Categories" value={categoryCount} detail="Machine categories" icon={<Layers3 />} />
                </section>

                <section className="space-y-4">

                    <MachineFilterBar
                        values={filters}
                        onChange={handleFilterChange}
                    />

                    {paginatedMachines.length > 0 ? (

                        <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-2 xl:grid-cols-3">

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
