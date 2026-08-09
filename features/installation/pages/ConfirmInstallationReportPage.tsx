"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, FileSearch, LayoutGrid, Table2 } from "lucide-react";
import { toast } from "sonner";

import AppHeader from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { PageState } from "@/features/machine/components";

import {
    ConfirmInstallationDialog,
    InstallationReportDetailsDialog,
    InstallationPagination,
    installationReportDefaultFilters,
    InstallationReportsCards,
    InstallationReportFilters,
    InstallationReportsTable,
} from "../components";
import {
    useConfirmInstallationReport,
    useInstallationReports,
} from "../hooks";
import type {
    InstallationReport,
    InstallationReportSearchRequest,
} from "../types/installation-report";

export default function ConfirmInstallationReportPage() {
    const [viewMode, setViewMode] = useState<"table" | "card">("card");

    const [draftFilters, setDraftFilters] =
        useState<InstallationReportSearchRequest>(installationReportDefaultFilters);

    const [appliedFilters, setAppliedFilters] =
        useState<InstallationReportSearchRequest>(installationReportDefaultFilters);

    const [isFilterExpanded, setIsFilterExpanded] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [selectedReport, setSelectedReport] =
        useState<InstallationReport | null>(null);
    const [selectedDetailsReportId, setSelectedDetailsReportId] =
        useState<number | null>(null);

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
    } = useInstallationReports();

    const confirmMutation = useConfirmInstallationReport();

    const reports = useMemo(() => data?.items ?? [], [data?.items]);

    const filteredReports = useMemo(() => {
        const keyword = appliedFilters.keyword?.trim().toLowerCase() ?? "";
        const fromDate = appliedFilters.fromDate
            ? new Date(appliedFilters.fromDate).setHours(0, 0, 0, 0)
            : null;
        const toDate = appliedFilters.toDate
            ? new Date(appliedFilters.toDate).setHours(23, 59, 59, 999)
            : null;

        const filtered = reports.filter((report) => {
            if (appliedFilters.id != null && report.id !== appliedFilters.id) {
                return false;
            }

            if (
                appliedFilters.status &&
                report.installationStatus !== appliedFilters.status
            ) {
                return false;
            }

            if (keyword) {
                const searchable = [
                    report.customerCode,
                    report.customerName,
                    report.machineModel,
                    report.machineDescription,
                    report.city,
                    report.phone,
                    report.serialNumber,
                    report.invoiceNumber,
                    report.installedBy,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                if (!searchable.includes(keyword)) {
                    return false;
                }
            }

            const installationTime = new Date(report.installationDate).getTime();

            if (fromDate != null && installationTime < fromDate) {
                return false;
            }

            if (toDate != null && installationTime > toDate) {
                return false;
            }

            return true;
        });

        const sortBy = appliedFilters.sortBy ?? "CreatedAt";
        const sortOrder = appliedFilters.sortOrder ?? "desc";

        const sortFieldMap: Record<string, keyof InstallationReport> = {
            Id: "id",
            CustomerName: "customerName",
            City: "city",
            MachineModel: "machineModel",
            InstallationDate: "installationDate",
            Status: "installationStatus",
            CreatedAt: "createdAt",
        };

        const sortField =
            sortFieldMap[sortBy] ??
            ((sortBy.charAt(0).toLowerCase() + sortBy.slice(1)) as keyof InstallationReport);

        filtered.sort((left, right) => {
            const leftValue = left[sortField];
            const rightValue = right[sortField];

            if (leftValue == null && rightValue == null) {
                return 0;
            }

            if (leftValue == null) {
                return sortOrder === "asc" ? -1 : 1;
            }

            if (rightValue == null) {
                return sortOrder === "asc" ? 1 : -1;
            }

            if (typeof leftValue === "number" && typeof rightValue === "number") {
                return sortOrder === "asc"
                    ? leftValue - rightValue
                    : rightValue - leftValue;
            }

            const leftDate = Date.parse(String(leftValue));
            const rightDate = Date.parse(String(rightValue));
            const bothDates = Number.isFinite(leftDate) && Number.isFinite(rightDate);

            if (bothDates) {
                return sortOrder === "asc" ? leftDate - rightDate : rightDate - leftDate;
            }

            const stringCompare = String(leftValue).localeCompare(String(rightValue));
            return sortOrder === "asc" ? stringCompare : -stringCompare;
        });

        return filtered;
    }, [appliedFilters, reports]);

    const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
    const displayPage = Math.min(page, totalPages);

    const displayReports = useMemo(() => {
        const start = (displayPage - 1) * pageSize;
        return filteredReports.slice(start, start + pageSize);
    }, [displayPage, filteredReports, pageSize]);

    const displayTotalCount = filteredReports.length;
    const displayPageSize = pageSize;

    const summary = {
        totalCount: displayTotalCount,
        pendingCount: displayReports.filter((report) => report.installationStatus === "Pending").length,
        confirmedCount: reports.filter((report) => {
            const status = (report.installationStatus ?? "").trim().toLowerCase();
            return status === "completed" || status === "confirmed";
        }).length,
    };

    function handleApplyFilters() {
        setAppliedFilters(draftFilters);
        setPage(1);
    }

    function handleResetFilters() {
        setDraftFilters(installationReportDefaultFilters);
        setAppliedFilters(installationReportDefaultFilters);
        setPage(1);
    }

    async function handleConfirmReport(invoiceNumber?: string) {
        if (!selectedReport) {
            return;
        }

        try {
            await confirmMutation.mutateAsync({
                id: selectedReport.id,
                payload: invoiceNumber ? { invoiceNumber } : {},
            });

            toast.success("Installation report confirmed successfully.");
            setSelectedReport(null);
        } catch (confirmError) {
            const message =
                confirmError instanceof Error
                    ? confirmError.message
                    : "Failed to confirm installation report.";

            toast.error(message);
        }
    }

    if (isLoading) {
        return (
            <>
                <AppHeader
                    title="Installations"
                    description="Confirm Installation Report section"
                />
                <main className="p-4 sm:p-6">
                    <PageState
                        title="Loading installation reports..."
                        description="Retrieving reports and preparing filters."
                    />
                </main>
            </>
        );
    }

    if (isError) {
        return (
            <>
                <AppHeader
                    title="Installations"
                    description="Confirm Installation Report section"
                />
                <main className="p-4 sm:p-6">
                    <PageState
                        title="Failed to load installation reports"
                        description={error instanceof Error ? error.message : "Please try again."}
                    />
                </main>
            </>
        );
    }

    return (
        <>
            <AppHeader
                title="Installations"
                description="Confirm Installation Report section"
            />

            <main className="space-y-6 p-4 sm:p-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-sky-500/10 shadow-sm">
                        <CardHeader className="relative pb-2">
                            <span className="absolute -right-6 -top-6 size-16 rounded-full bg-sky-400/15 blur-xl" />
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Reports</p>
                                <span className="inline-flex size-8 items-center justify-center rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300">
                                    <FileSearch className="size-4" />
                                </span>
                            </div>
                            <CardTitle className="mt-2 text-3xl">{summary.totalCount}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Total installation reports
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-amber-500/10 shadow-sm">
                        <CardHeader className="relative pb-2">
                            <span className="absolute -right-6 -top-6 size-16 rounded-full bg-amber-400/15 blur-xl" />
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pending</p>
                                <span className="inline-flex size-8 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300">
                                    <Clock3 className="size-4" />
                                </span>
                            </div>
                            <CardTitle className="mt-2 text-3xl">{summary.pendingCount}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Pending reports in current page
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-emerald-500/10 shadow-sm">
                        <CardHeader className="relative pb-2">
                            <span className="absolute -right-6 -top-6 size-16 rounded-full bg-emerald-400/15 blur-xl" />
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Confirmed</p>
                                <span className="inline-flex size-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                                    <CheckCircle2 className="size-4" />
                                </span>
                            </div>
                            <CardTitle className="mt-2 text-3xl">{summary.confirmedCount}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Confirmed reports in current page
                        </CardContent>
                    </Card>
                </section>

                <InstallationReportFilters
                    values={draftFilters}
                    isExpanded={isFilterExpanded}
                    onExpandToggle={() => setIsFilterExpanded((current) => !current)}
                    onChange={setDraftFilters}
                    onApply={handleApplyFilters}
                    onReset={handleResetFilters}
                />

                <div className="flex items-center justify-end">
                    <div className="inline-flex items-center gap-1 rounded-lg border bg-card p-1">
                        <Button
                            type="button"
                            size="sm"
                            variant={viewMode === "table" ? "default" : "ghost"}
                            onClick={() => setViewMode("table")}
                        >
                            <Table2 className="size-4" />
                            Table
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            variant={viewMode === "card" ? "default" : "ghost"}
                            onClick={() => setViewMode("card")}
                        >
                            <LayoutGrid className="size-4" />
                            Cards
                        </Button>
                    </div>
                </div>

                {displayReports.length === 0 ? (
                    <PageState
                        title="No installation reports found"
                        description="Try adjusting filters or date range."
                        icon={<FileSearch className="size-8" />}
                    />
                ) : (
                    <>
                        {viewMode === "table" ? (
                            <InstallationReportsTable
                                reports={displayReports}
                                onConfirmClick={setSelectedReport}
                            />
                        ) : (
                            <InstallationReportsCards
                                reports={displayReports}
                                onConfirmClick={setSelectedReport}
                                onViewDetailsClick={(report) =>
                                    setSelectedDetailsReportId(report.id)
                                }
                            />
                        )}

                        <InstallationPagination
                            page={displayPage}
                            pageSize={displayPageSize}
                            totalItems={displayTotalCount}
                            onPageChange={setPage}
                            onPageSizeChange={(nextPageSize) => {
                                setPageSize(nextPageSize);
                                setPage(1);
                            }}
                        />
                    </>
                )}

                {isFetching && !isLoading && (
                    <p className="text-xs text-muted-foreground">Refreshing reports...</p>
                )}
            </main>

            <ConfirmInstallationDialog
                key={selectedReport?.id ?? "none"}
                open={Boolean(selectedReport)}
                reportId={selectedReport?.id ?? null}
                customerName={selectedReport?.customerName}
                defaultInvoiceNumber={selectedReport?.invoiceNumber ?? ""}
                isSubmitting={confirmMutation.isPending}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedReport(null);
                    }
                }}
                onSubmit={handleConfirmReport}
            />

            <InstallationReportDetailsDialog
                open={selectedDetailsReportId != null}
                reportId={selectedDetailsReportId}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedDetailsReportId(null);
                    }
                }}
            />
        </>
    );
}
