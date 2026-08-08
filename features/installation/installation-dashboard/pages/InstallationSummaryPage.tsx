"use client";

import Link from "next/link";
import {
    ArrowRight,
    CheckCircle2,
    Clock3,
    Download,
    FileBarChart2,
    ListChecks,
    MapPin,
    RefreshCw,
} from "lucide-react";

import AppHeader from "@/components/layout/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { PageState } from "@/features/machine/components";

import { useInstallationReports } from "../../hooks";
import type {
    InstallationReport,
    InstallationReportSearchRequest,
} from "../../types/installation-report";

const dashboardRequest = {
    sortBy: "CreatedAt",
    sortOrder: "desc" as const,
    page: 1,
    pageSize: 100,
};

const pendingSummaryRequest: InstallationReportSearchRequest = {
    ...dashboardRequest,
    status: "Pending",
    pageSize: 1,
};

const completedSummaryRequest: InstallationReportSearchRequest = {
    ...dashboardRequest,
    status: "Completed",
    pageSize: 1,
};

const statusColors = [
    "bg-amber-500",
    "bg-emerald-500",
    "bg-sky-500",
    "bg-rose-500",
    "bg-violet-500",
];

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
    }).format(new Date(value));
}

function countBy<T extends string>(items: T[]) {
    return items.reduce<Record<string, number>>((acc, item) => {
        acc[item || "Unknown"] = (acc[item || "Unknown"] ?? 0) + 1;
        return acc;
    }, {});
}

function normalizeCityLabel(value: string | null | undefined) {
    const trimmed = value?.trim();

    if (!trimmed) {
        return "Unknown";
    }

    // Merge labels like "colombo", "COLOMBO", and extra spaces into one city bucket.
    return trimmed
        .toLowerCase()
        .replace(/\s+/g, " ")
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function escapeCsv(value: unknown) {
    const text = value == null ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
}

function generateCsv(reports: InstallationReport[]) {
    const headers = [
        "Id",
        "Customer Code",
        "Customer Name",
        "City",
        "Machine Model",
        "Machine Description",
        "Serial Number",
        "Invoice Number",
        "Installation Date",
        "Installed By",
        "Status",
        "Area",
        "Engineer",
        "Created At",
    ];

    const rows = reports.map((report) => [
        report.id,
        report.customerCode,
        report.customerName,
        report.city,
        report.machineModel,
        report.machineDescription,
        report.serialNumber,
        report.invoiceNumber,
        report.installationDate,
        report.installedBy,
        report.installationStatus,
        report.area,
        report.engineer,
        report.createdAt,
    ]);

    return [
        headers.map(escapeCsv).join(","),
        ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");
}

function downloadReport(reports: InstallationReport[]) {
    const csv = generateCsv(reports);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `installation-summary-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function StatusDonut({
    statusCounts,
    total,
}: {
    statusCounts: [string, number][];
    total: number;
}) {
    const colors = ["#f59e0b", "#10b981", "#0ea5e9", "#f43f5e", "#8b5cf6"];
    const displayCounts = statusCounts.filter(([, count]) => count > 0);

    return (
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="relative mx-auto flex size-48 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-500/10 via-teal-500/10 to-emerald-500/10 blur-xl" />
                <span className="absolute inset-2 rounded-full border border-cyan-300/30" />
                <span className="absolute inset-4 rounded-full border border-sky-300/20 animate-pulse" />

                <div
                    className="absolute inset-0 rounded-full animate-[spin_22s_linear_infinite]"
                    style={{
                        background: total
                            ? `conic-gradient(${displayCounts
                                .map(([, count], index) => {
                                    const previous = displayCounts
                                        .slice(0, index)
                                        .reduce((sum, [, value]) => sum + value, 0);
                                    const start = (previous / total) * 100;
                                    const end = ((previous + count) / total) * 100;
                                    return `${colors[index % colors.length]} ${start}% ${end}%`;
                                })
                                .join(", ")})`
                            : undefined,
                    }}
                />

                <div className="absolute inset-[18px] rounded-full border border-white/35 bg-background/85" />

                <div className="relative flex size-28 flex-col items-center justify-center rounded-full border border-border/70 bg-card/95 shadow-sm backdrop-blur animate-bounce [animation-duration:2.8s]">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Total</span>
                    <span className="text-3xl font-semibold leading-none">{total}</span>
                    <span className="mt-1 text-[11px] text-muted-foreground">reports</span>
                </div>

                {displayCounts.slice(0, 5).map(([status], index) => {
                    const angle = (index / Math.max(1, displayCounts.length)) * Math.PI * 2;
                    const orbit = 100;
                    const x = Math.cos(angle) * orbit;
                    const y = Math.sin(angle) * orbit;

                    return (
                        <span
                            key={`status-orb-${status}`}
                            className="absolute size-3.5 rounded-full border border-white/50 shadow-sm animate-pulse"
                            style={{
                                transform: `translate(${x}px, ${y}px)`,
                                backgroundColor: colors[index % colors.length],
                                animationDelay: `${index * 0.22}s`,
                            }}
                        />
                    );
                })}
            </div>

            <div className="grid flex-1 gap-2.5">
                {displayCounts.map(([status, count], index) => (
                    <div
                        key={status}
                        className="rounded-full border border-border/70 bg-gradient-to-r from-background/75 via-background/70 to-transparent px-3 py-2"
                    >
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="inline-flex min-w-0 items-center gap-2 font-medium">
                                <span className="size-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                                <span className="truncate">{status}</span>
                            </span>
                            {status.toLowerCase() === "pending" ? (
                                <span className="relative inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-700 dark:text-amber-300">
                                    <span className="absolute -left-1 -top-1 size-2 rounded-full bg-amber-400/70 animate-ping" />
                                    <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    {count} ({total ? Math.round((count / total) * 100) : 0}%)
                                </span>
                            ) : (
                                <span className="text-muted-foreground">
                                    {count} ({total ? Math.round((count / total) * 100) : 0}%)
                                </span>
                            )}
                        </div>
                    </div>
                ))}

                {displayCounts.length === 0 && (
                    <p className="text-sm text-muted-foreground">No status data available.</p>
                )}
            </div>
        </div>
    );
}

function WeeklyInstallationPulse({
    weeklyCounts,
}: {
    weeklyCounts: [string, number][];
}) {
    const max = Math.max(1, ...weeklyCounts.map(([, count]) => count));

    if (weeklyCounts.length === 0) {
        return <p className="text-sm text-muted-foreground">No weekly report data available.</p>;
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-7 items-end gap-2 rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-cyan-500/5 p-3.5">
                {weeklyCounts.map(([day, count], index) => {
                    const height = Math.max(10, Math.round((count / max) * 100));

                    return (
                        <div key={day} className="flex flex-col items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-muted-foreground">{count}</span>
                            <div className="flex h-32 w-full items-end justify-center rounded-lg bg-muted/50 p-1">
                                <div
                                    className="relative w-full max-w-8 overflow-hidden rounded-md bg-gradient-to-t from-cyan-600 via-sky-500 to-teal-400 shadow-sm animate-pulse"
                                    style={{
                                        height: `${height}%`,
                                        animationDelay: `${index * 0.14}s`,
                                        animationDuration: "2.4s",
                                    }}
                                >
                                    <span className="absolute inset-x-0 top-0 h-1.5 bg-white/35" />
                                </div>
                            </div>
                            <span className="text-[11px] text-muted-foreground">{day}</span>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2 py-0.5 text-sky-700 dark:text-sky-300">
                    <span className="size-1.5 rounded-full bg-sky-500" />
                    Daily installation pulse
                </span>
            </div>
        </div>
    );
}

function AreaDistribution({
    areaCounts,
}: {
    areaCounts: [string, number][];
}) {
    if (areaCounts.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                No area data available yet.
            </div>
        );
    }

    const max = Math.max(1, ...areaCounts.map(([, count]) => count));
    const total = areaCounts.reduce((sum, [, count]) => sum + count, 0);
    const areaStyles = [
        {
            shell: "from-rose-500/10 via-pink-500/5 to-background",
            dot: "bg-rose-500",
            track: "from-rose-100 to-pink-100 dark:from-rose-950/45 dark:to-pink-950/45",
            fill: "from-rose-500 via-pink-500 to-fuchsia-500",
            chip: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
        },
        {
            shell: "from-sky-500/10 via-cyan-500/5 to-background",
            dot: "bg-sky-500",
            track: "from-sky-100 to-cyan-100 dark:from-sky-950/45 dark:to-cyan-950/45",
            fill: "from-sky-500 via-cyan-500 to-teal-500",
            chip: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
        },
        {
            shell: "from-amber-500/10 via-orange-500/5 to-background",
            dot: "bg-amber-500",
            track: "from-amber-100 to-orange-100 dark:from-amber-950/45 dark:to-orange-950/45",
            fill: "from-amber-500 via-orange-500 to-yellow-500",
            chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
        },
        {
            shell: "from-emerald-500/10 via-teal-500/5 to-background",
            dot: "bg-emerald-500",
            track: "from-emerald-100 to-teal-100 dark:from-emerald-950/45 dark:to-teal-950/45",
            fill: "from-emerald-500 via-teal-500 to-cyan-500",
            chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        },
        {
            shell: "from-violet-500/10 via-indigo-500/5 to-background",
            dot: "bg-violet-500",
            track: "from-violet-100 to-indigo-100 dark:from-violet-950/45 dark:to-indigo-950/45",
            fill: "from-violet-500 via-indigo-500 to-blue-500",
            chip: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
        },
        {
            shell: "from-fuchsia-500/10 via-purple-500/5 to-background",
            dot: "bg-fuchsia-500",
            track: "from-fuchsia-100 to-purple-100 dark:from-fuchsia-950/45 dark:to-purple-950/45",
            fill: "from-fuchsia-500 via-purple-500 to-violet-500",
            chip: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
        },
    ];

    return (
        <div className="space-y-3">
            {areaCounts.map(([area, count], index) => {
                const style = areaStyles[index % areaStyles.length];
                const width = (count / max) * 100;
                const percent = total ? Math.round((count / total) * 100) : 0;

                return (
                    <div
                        key={area}
                        className={`rounded-2xl border border-border/70 bg-gradient-to-r ${style.shell} p-3.5 shadow-sm`}
                    >
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                            <span className="inline-flex min-w-0 items-center gap-2 font-medium">
                                <span className={`size-2.5 shrink-0 rounded-full ${style.dot} shadow-sm`} />
                                <span className="truncate">{area}</span>
                            </span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style.chip}`}>
                                #{index + 1}
                            </span>
                        </div>

                        <div className={`h-2.5 rounded-full bg-gradient-to-r ${style.track}`}>
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${style.fill} transition-[width] duration-700 ease-out`}
                            style={{ width: `${width}%` }}
                        />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{count} reports</span>
                            <span>{percent}% share</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function InstallationSummaryPage() {
    const dashboardQuery = useInstallationReports(dashboardRequest);
    const pendingSummaryQuery = useInstallationReports(pendingSummaryRequest);
    const completedSummaryQuery = useInstallationReports(completedSummaryRequest);

    const {
        data,
        isLoading,
        isError,
        error,
    } = dashboardQuery;

    const reports = data?.items ?? [];
    const totalReports = data?.totalCount ?? reports.length;
    const pendingReports = pendingSummaryQuery.data?.totalCount ?? 0;
    const completedReports = completedSummaryQuery.data?.totalCount ?? 0;
    const activeReports = reports.filter((report) => report.isActive).length;

    const statusCounts: [string, number][] = [
        ["Pending", pendingReports],
        ["Complete", completedReports],
    ];
    const statusTotal = pendingReports + completedReports;
    const isRefreshing =
        dashboardQuery.isFetching ||
        pendingSummaryQuery.isFetching ||
        completedSummaryQuery.isFetching;
    const hasSummaryError =
        isError ||
        pendingSummaryQuery.isError ||
        completedSummaryQuery.isError;
    const summaryError =
        error ||
        pendingSummaryQuery.error ||
        completedSummaryQuery.error;

    const weekdayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekdayCounts = reports.reduce<Record<string, number>>((acc, report) => {
        const day = new Intl.DateTimeFormat("en", { weekday: "short" }).format(
            new Date(report.installationDate)
        );
        const normalized = day === "Thu" ? "Thu" : day.slice(0, 3);
        acc[normalized] = (acc[normalized] ?? 0) + 1;
        return acc;
    }, {});
    const weeklyCounts: [string, number][] = weekdayOrder.map((day) => [day, weekdayCounts[day] ?? 0]);

    const areaCounts = Object.entries(
        countBy(reports.map((report) => normalizeCityLabel(report.city)))
    )
        .sort((left, right) => right[1] - left[1])
        .slice(0, 6);

    const latestReports = [...reports]
        .sort(
            (left, right) =>
                new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
        )
        .slice(0, 6);

    return (
        <>
            <AppHeader
                title="Installation Summary"
                description="API-powered dashboard for installation report activity"
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                dashboardQuery.refetch();
                                pendingSummaryQuery.refetch();
                                completedSummaryQuery.refetch();
                            }}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className="size-4" />
                            Refresh
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => downloadReport(reports)}
                            disabled={reports.length === 0}
                        >
                            <Download className="size-4" />
                            Generate Report
                        </Button>
                    </div>
                }
            />

            <main className="space-y-6 p-4 sm:p-6">
                {hasSummaryError && (
                    <PageState
                        title="Failed to load installation dashboard"
                        description={summaryError instanceof Error ? summaryError.message : "Please try again."}
                    />
                )}

                {isLoading ? (
                    <PageState
                        title="Loading installation dashboard..."
                        description="Retrieving installation reports from API."
                    />
                ) : (
                    <>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
                                <CardHeader className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-card via-card to-sky-500/10 pb-2">
                                    <span className="pointer-events-none absolute -right-7 -top-7 size-16 rounded-full bg-sky-400/15 blur-xl" />
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Reports</p>
                                        <span className="inline-flex size-8 items-center justify-center rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300">
                                            <FileBarChart2 className="size-4" />
                                        </span>
                                    </div>
                                    <CardTitle className="mt-2 text-3xl font-semibold">{totalReports}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Installation reports recorded
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
                                <CardHeader className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-card via-card to-amber-500/10 pb-2">
                                    <span className="pointer-events-none absolute -right-7 -top-7 size-16 rounded-full bg-amber-400/15 blur-xl" />
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pending</p>
                                        <span className="inline-flex size-8 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300">
                                            <Clock3 className="size-4" />
                                        </span>
                                    </div>
                                    <CardTitle className="mt-2 inline-flex items-center gap-2 text-3xl font-semibold">
                                        {pendingReports}
                                        <span className="relative inline-flex size-2.5">
                                            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400/70 animate-ping" />
                                            <span className="relative inline-flex size-2.5 rounded-full bg-amber-500" />
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Waiting for confirmation
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
                                <CardHeader className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-card via-card to-emerald-500/10 pb-2">
                                    <span className="pointer-events-none absolute -right-7 -top-7 size-16 rounded-full bg-emerald-400/15 blur-xl" />
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Complete</p>
                                        <span className="inline-flex size-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                                            <CheckCircle2 className="size-4" />
                                        </span>
                                    </div>
                                    <CardTitle className="mt-2 text-3xl font-semibold">{completedReports}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Completed installation reports
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
                                <CardHeader className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-card via-card to-violet-500/10 pb-2">
                                    <span className="pointer-events-none absolute -right-7 -top-7 size-16 rounded-full bg-violet-400/15 blur-xl" />
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active</p>
                                        <span className="inline-flex size-8 items-center justify-center rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-300">
                                            <ListChecks className="size-4" />
                                        </span>
                                    </div>
                                    <CardTitle className="mt-2 text-3xl font-semibold">{activeReports}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Active installation records
                                    </p>
                                </CardContent>
                            </Card>
                        </section>

                        <section className="grid gap-4 xl:grid-cols-[1fr_1.35fr]">
                            <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
                                <CardHeader>
                                    <CardTitle>Status Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <StatusDonut
                                        statusCounts={statusCounts}
                                        total={statusTotal}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
                                <CardHeader>
                                    <CardTitle>Weekly Installation Pulse</CardTitle>
                                    <p className="text-sm text-muted-foreground">Animated daily installation activity report</p>
                                </CardHeader>
                                <CardContent>
                                    <WeeklyInstallationPulse weeklyCounts={weeklyCounts} />
                                </CardContent>
                            </Card>
                        </section>

                        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.4fr]">
                            <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
                                <CardHeader>
                                    <CardTitle>City Distribution</CardTitle>
                                    <CardAction>
                                        <MapPin className="size-5 text-muted-foreground" />
                                    </CardAction>
                                </CardHeader>
                                <CardContent>
                                    <AreaDistribution areaCounts={areaCounts} />
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
                                <CardHeader>
                                    <CardTitle>Recent Installation Reports</CardTitle>
                                    <CardAction>
                                        <Button
                                            render={<Link href={ROUTES.CONFIRM_INSTALLATIONS} prefetch />}
                                            nativeButton={false}
                                            variant="outline"
                                            size="sm"
                                        >
                                            View All
                                            <ArrowRight className="size-4" />
                                        </Button>
                                    </CardAction>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {latestReports.map((report) => (
                                        <div
                                            key={report.id}
                                            className="flex flex-col gap-2 rounded-lg border border-border/70 bg-background/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">
                                                    {report.customerName}
                                                </p>
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {report.machineModel} - {report.serialNumber ?? "No serial"}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
                                                <span>{formatDate(report.installationDate)}</span>
                                                <Badge variant="outline">
                                                    {report.installationStatus}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </section>
                    </>
                )}
            </main>
        </>
    );
}
