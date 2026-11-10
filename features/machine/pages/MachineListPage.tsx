"use client";

import { useState } from "react";
import { Boxes, Download, Layers3, Loader2, SearchX, Sparkles, Upload } from "lucide-react";

import AppHeader from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import { MachineImportReportDialog } from "@/features/machine/components/MachineImportReportDialog";
import { MachineImportSuccessDialog } from "@/features/machine/components/MachineImportSuccessDialog";
import { useMachineImport } from "@/features/machine/hooks/useMachineImport";

import {
    AddMachineDialog,
    MachineCard,
    MachineFilterBar,
    MachinePagination,
    PageState,
    emptyFilters,
    type MachineFilterValues,
} from "@/features/machine/components";
import { useMachines, useMachineStatistics } from "@/features/machine/hooks/useMachine";

function MachineKpi({ label, value, detail, icon }: { label: string; value: number | null; detail: string; icon: React.ReactNode }) {
    return <Card size="sm" className="border border-border/70 shadow-none"><CardContent className="space-y-2"><div className="flex items-start justify-between gap-2"><CardDescription className="text-[11px] font-normal">{label}</CardDescription><span className="flex size-7 items-center justify-center rounded-lg bg-muted text-primary [&_svg]:size-3.5">{icon}</span></div><CardTitle className="text-[24px] leading-none font-normal tabular-nums">{value?.toLocaleString() ?? "—"}</CardTitle><p className="text-[11px] text-muted-foreground">{detail}</p></CardContent></Card>;
}

export default function MachineListPage() {

    const [filters, setFilters] =
        useState<MachineFilterValues>(emptyFilters);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const searchParams = {
        page,
        pageSize,
        keyword: filters.keyword.trim() || undefined,
        machineCode: filters.machineCode.trim() || undefined,
        modelCode: filters.modelCode.trim() || undefined,
        warrantyTypeCode: filters.warrantyTypeCode.trim() || undefined,
        warrantyPeriod: filters.warrantyPeriod ? Number(filters.warrantyPeriod) : undefined,
        warrantyPeriodUnit: filters.warrantyPeriodUnit || undefined,
        ruleType: filters.ruleType || undefined,
    };
    const { data, isLoading, isError, isFetching } = useMachines(searchParams);
    const { data: statistics } = useMachineStatistics();
    const { fileInputRef, isUploading, report, successResult, closeReport, closeSuccess, pickFile, uploadFile } = useMachineImport();

    const paginatedMachines = data?.items ?? [];
    const totalItems = data?.totalCount ?? 0;
    const totalCount = statistics?.totalMachines ?? data?.totalCount ?? null;
    const activeCount = statistics?.activeMachines ?? null;
    const categoryCount = statistics?.categories ?? null;

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
        pickFile();
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
                            onChange={uploadFile}
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

                    {isFetching ? <PageState title="Loading machines..." description="Fetching matching machines." /> : paginatedMachines.length > 0 ? (

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
                            page={page}
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
            <MachineImportReportDialog report={report} onClose={closeReport} />
            <MachineImportSuccessDialog result={successResult} onClose={closeSuccess} />
        </>
    );
}
