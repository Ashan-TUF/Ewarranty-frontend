"use client";

import Link from "next/link";
import {
  Activity,
  Boxes,
  CheckCircle2,
  Clock3,
  Layers3,
  PackageSearch,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import AppHeader from "@/components/layout/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useInstallationReports } from "@/features/installation/hooks";
import { PageState } from "@/features/machine/components";
import { useMachines } from "@/features/machine/hooks/useMachine";

const installationRequest = {
  sortBy: "CreatedAt",
  sortOrder: "desc" as const,
  page: 1,
  pageSize: 100,
};

const pendingRequest = {
  ...installationRequest,
  status: "Pending" as const,
  pageSize: 1,
};

const completedRequest = {
  ...installationRequest,
  status: "Completed" as const,
  pageSize: 1,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function countBy(items: string[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = item || "Unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function InstallationStatusChart({
  completed,
  pending,
  total,
}: {
  completed: number;
  pending: number;
  total: number;
}) {
  const review = Math.max(total - completed - pending, 0);
  const normalizedTotal = Math.max(total, completed + pending + review, 1);
  const completionRate = Math.round((completed / normalizedTotal) * 100);

  const segments = [
    { key: "completed", value: completed, color: "#10b981", label: "Completed" },
    { key: "pending", value: pending, color: "#f59e0b", label: "Pending" },
    { key: "review", value: review, color: "#38bdf8", label: "Review" },
  ].filter((segment) => segment.value > 0);

  const radius = 54;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const colors = ["#10b981", "#f59e0b", "#38bdf8"];
  let offset = 0;

  return (
    <div className="grid gap-5 sm:grid-cols-[150px_1fr] sm:items-center">
      <div className="relative mx-auto flex size-36 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-500/15 via-cyan-500/15 to-emerald-500/15 blur-lg" />

        <svg viewBox="0 0 140 140" className="size-full -rotate-90 animate-[spin_16s_linear_infinite]" aria-hidden="true">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeWidth={strokeWidth}
            className="text-muted-foreground"
          />
          {segments.map((segment) => {
            const length = (segment.value / normalizedTotal) * circumference;
            const dash = `${length} ${circumference - length}`;
            const circle = (
              <circle
                key={segment.key}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
              />
            );

            offset += length;
            return circle;
          })}
        </svg>

        {segments.map((segment, index) => {
          const angle = (index / Math.max(1, segments.length)) * Math.PI * 2;
          const orbit = 64;
          const x = Math.cos(angle) * orbit;
          const y = Math.sin(angle) * orbit;

          return (
            <span
              key={`status-orb-${segment.key}`}
              className="absolute size-2.5 rounded-full border border-white/40 shadow-sm animate-pulse"
              style={{
                transform: `translate(${x}px, ${y}px)`,
                backgroundColor: colors[index % colors.length],
                animationDelay: `${index * 0.2}s`,
              }}
            />
          );
        })}

        <div className="absolute inset-[13px] rounded-full border border-white/40 bg-background/75" />

        <div className="relative flex size-24 flex-col items-center justify-center rounded-full border border-border/70 bg-card/90 shadow-sm backdrop-blur">
          <p className="text-2xl font-semibold">{completionRate}%</p>
          <p className="text-[11px] text-muted-foreground">completion</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {segments.map((segment, index) => (
          <div key={segment.key} className="rounded-lg border border-border/70 bg-background/60 p-2.5">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 font-medium">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: segment.color }}
                  aria-hidden="true"
                />
                {segment.label}
              </span>
              <span className="text-muted-foreground">
                {segment.value} ({Math.round((segment.value / normalizedTotal) * 100)}%)
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(4, (segment.value / normalizedTotal) * 100)}%`,
                  backgroundColor: segment.color,
                  animationDelay: `${index * 0.12}s`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const machinesQuery = useMachines();
  const installationsQuery = useInstallationReports(installationRequest);
  const pendingQuery = useInstallationReports(pendingRequest);
  const completedQuery = useInstallationReports(completedRequest);

  const isLoading = machinesQuery.isLoading || installationsQuery.isLoading;
  const isError = machinesQuery.isError || installationsQuery.isError;

  const primaryError =
    (machinesQuery.error instanceof Error && machinesQuery.error.message) ||
    (installationsQuery.error instanceof Error && installationsQuery.error.message) ||
    "Failed to load dashboard data.";

  const machines = machinesQuery.data?.items ?? [];
  const installations = installationsQuery.data?.items ?? [];

  const totalMachines = machinesQuery.data?.totalCount ?? machines.length;
  const activeMachines = machines.filter((machine) => machine.isActive).length;
  const categoryCount = new Set(machines.map((machine) => machine.category)).size;
  const totalModels = machines.reduce((sum, machine) => sum + machine.models.length, 0);
  const totalWarranties = machines.reduce(
    (sum, machine) => sum + machine.models.reduce((modelSum, model) => modelSum + model.warranties.length, 0),
    0
  );

  const totalInstallations = installationsQuery.data?.totalCount ?? installations.length;
  const pendingInstallations =
    pendingQuery.data?.totalCount ??
    installations.filter((report) => report.installationStatus === "Pending").length;
  const completedInstallations =
    completedQuery.data?.totalCount ??
    installations.filter((report) => report.installationStatus === "Completed").length;

  const machineCategoryCounts = Object.entries(
    countBy(machines.map((machine) => machine.category || "Unknown"))
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxCategory = Math.max(1, ...machineCategoryCounts.map(([, count]) => count));

  const recentActivity = [
    ...machines.map((machine) => ({
      id: `machine-${machine.machineCode}`,
      title: machine.machineName,
      meta: `${machine.machineCode} · ${machine.manufacturer}`,
      date: machine.createdAt,
      type: "machine" as const,
      href: ROUTES.MACHINE_DETAILS(machine.machineCode),
    })),
    ...installations.map((report) => ({
      id: `installation-${report.id}`,
      title: report.customerName,
      meta: `${report.machineModel} · ${report.installationStatus}`,
      date: report.createdAt,
      type: "installation" as const,
      href: ROUTES.CONFIRM_INSTALLATION_DETAILS(report.id),
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <>
      <AppHeader
        title="Dashboard"
        description="Real-time business overview across machines and installations"
        actions={
          <div className="flex items-center gap-2">
            <Button render={<Link href={ROUTES.MACHINES} prefetch />} nativeButton={false} size="sm" variant="outline">
              <Boxes className="size-4" />
              Machines
            </Button>
            <Button render={<Link href={ROUTES.INSTALLATION_SUMMARY} prefetch />} nativeButton={false} size="sm">
              <Wrench className="size-4" />
              Installations
            </Button>
          </div>
        }
      />

      <main className="space-y-6 p-4 sm:p-6">
        {isLoading && (
          <PageState
            title="Loading dashboard..."
            description="Fetching machine and installation insights."
          />
        )}

        {isError && (
          <PageState
            title="Failed to load dashboard"
            description={primaryError}
          />
        )}

        {!isLoading && !isError && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card className="bg-card/80 backdrop-blur">
                <CardHeader className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-card via-card to-sky-500/10 pb-2">
                  <span className="pointer-events-none absolute -right-7 -top-7 size-16 rounded-full bg-sky-400/15 blur-xl" />
                  <div className="flex items-center justify-between gap-3">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">Total Machines</CardDescription>
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300">
                      <Boxes className="size-4" />
                    </span>
                  </div>
                  <CardTitle className="mt-2 text-3xl">{totalMachines}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Registered machine inventory
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur">
                <CardHeader className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-card via-card to-cyan-500/10 pb-2">
                  <span className="pointer-events-none absolute -right-7 -top-7 size-16 rounded-full bg-cyan-400/15 blur-xl" />
                  <div className="flex items-center justify-between gap-3">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">Total Installations</CardDescription>
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-300">
                      <Wrench className="size-4" />
                    </span>
                  </div>
                  <CardTitle className="mt-2 text-3xl">{totalInstallations}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Installation reports tracked
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur">
                <CardHeader className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-card via-card to-amber-500/10 pb-2">
                  <span className="pointer-events-none absolute -right-7 -top-7 size-16 rounded-full bg-amber-400/15 blur-xl" />
                  <div className="flex items-center justify-between gap-3">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">Pending Installations</CardDescription>
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300">
                      <Clock3 className="size-4" />
                    </span>
                  </div>
                  <CardTitle className="mt-2 text-3xl">{pendingInstallations}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Waiting for completion workflows
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur">
                <CardHeader className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-card via-card to-emerald-500/10 pb-2">
                  <span className="pointer-events-none absolute -right-7 -top-7 size-16 rounded-full bg-emerald-400/15 blur-xl" />
                  <div className="flex items-center justify-between gap-3">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">Completed Installations</CardDescription>
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                      <CheckCircle2 className="size-4" />
                    </span>
                  </div>
                  <CardTitle className="mt-2 text-3xl">{completedInstallations}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Completed service deliveries
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1fr_1fr_1.2fr]">
              <Card className="bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="inline-flex items-center gap-2">
                    <PackageSearch className="size-4" />
                    Machine Mix
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative overflow-hidden rounded-xl border border-cyan-500/25 bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-teal-500/10 px-3 py-2.5">
                    <span className="pointer-events-none absolute -left-2 top-0 size-9 rounded-full bg-sky-300/20 blur-md" />
                    <span className="pointer-events-none absolute right-0 top-1 size-10 rounded-full bg-cyan-300/20 blur-md" />

                    <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-sky-700 dark:text-sky-300">
                        <Activity className="size-3.5" />
                        Category Garden
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-cyan-700 dark:text-cyan-300">
                        <span className="relative inline-flex size-1.5">
                          <span className="absolute inset-0 rounded-full bg-cyan-400/80 animate-ping" />
                          <span className="relative inline-flex size-1.5 rounded-full bg-cyan-500" />
                        </span>
                        {machineCategoryCounts.length} categories
                      </span>
                    </div>

                    <div className="relative grid grid-cols-8 items-end gap-1" aria-hidden="true">
                      {[42, 70, 52, 78, 36, 64, 48, 72].map((height, index) => (
                        <span
                          key={`mix-mini-${height}-${index}`}
                          className="h-9 rounded-md bg-gradient-to-t from-sky-500 via-cyan-400 to-teal-300 animate-bounce"
                          style={{
                            height: `${height}%`,
                            animationDelay: `${index * 0.08}s`,
                            animationDuration: `${1.2 + (index % 3) * 0.25}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {machineCategoryCounts.map(([category, count], index) => (
                    <div
                      key={category}
                      className="rounded-xl border border-border/70 bg-gradient-to-r from-background/90 via-background/70 to-cyan-500/5 p-2.5"
                    >
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <span className="size-2 rounded-full bg-cyan-500" />
                          <span className="truncate">{category}</span>
                        </span>
                        <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-700 dark:text-cyan-300">
                          {count}
                        </span>
                      </div>
                      <div className="machine-mix-track h-2.5 rounded-full bg-muted">
                        <div
                          className="machine-mix-fill relative h-2.5 rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-400"
                          style={{
                            width: `${Math.max(6, (count / maxCategory) * 100)}%`,
                            animationDelay: `${index * 0.12}s`,
                          }}
                        >
                          <span className="machine-mix-fill-spark" />
                          <span className="machine-mix-fill-orb" />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="inline-flex items-center gap-2">
                    <Layers3 className="size-4" />
                    Machine Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="machine-heart-panel rounded-xl border border-border/70 bg-background/55 p-3">
                    <div className="mb-2.5 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-300">
                        <Activity className="size-3.5" />
                        Health Stream
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-cyan-700 dark:text-cyan-300">
                        <span className="relative inline-flex size-2">
                          <span className="absolute inset-0 rounded-full bg-emerald-400/80 animate-ping" />
                          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                        </span>
                        Live
                      </span>
                    </div>

                    <div className="relative h-16 overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 px-3 py-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)]">
                      <span className="pointer-events-none absolute -left-2 top-1 size-8 rounded-full bg-emerald-400/15 blur-md" />
                      <span className="pointer-events-none absolute -right-2 bottom-1 size-9 rounded-full bg-cyan-400/15 blur-md" />

                      <div className="relative flex h-full items-end justify-between gap-1" aria-hidden="true">
                        {[56, 30, 68, 42, 76, 34, 62, 28, 72].map((height, index) => (
                          <span
                            key={`machine-signal-bar-${height}-${index}`}
                            className="w-full max-w-2 rounded-full bg-gradient-to-t from-emerald-500 via-teal-400 to-cyan-300 animate-bounce"
                            style={{
                              height: `${height}%`,
                              animationDelay: `${index * 0.1}s`,
                              animationDuration: `${1.4 + (index % 3) * 0.3}s`,
                            }}
                          />
                        ))}
                      </div>

                      <span className="absolute left-[14%] top-[24%] size-2 rounded-full bg-emerald-300/70 animate-pulse" aria-hidden="true" />
                      <span className="absolute left-[42%] top-[12%] size-1.5 rounded-full bg-cyan-300/80 animate-pulse" style={{ animationDelay: "0.45s" }} aria-hidden="true" />
                      <span className="absolute left-[70%] top-[30%] size-2 rounded-full bg-teal-300/70 animate-pulse" style={{ animationDelay: "0.8s" }} aria-hidden="true" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-lg border border-border/70 bg-background/55 p-2.5">
                      <p className="text-[11px] text-muted-foreground">Active Machines</p>
                      <p className="mt-1 text-base font-semibold">{activeMachines}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-background/55 p-2.5">
                      <p className="text-[11px] text-muted-foreground">Categories</p>
                      <p className="mt-1 text-base font-semibold">{categoryCount}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-background/55 p-2.5">
                      <p className="text-[11px] text-muted-foreground">Models</p>
                      <p className="mt-1 text-base font-semibold">{totalModels}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-background/55 p-2.5">
                      <p className="text-[11px] text-muted-foreground">Warranties</p>
                      <p className="mt-1 text-base font-semibold">{totalWarranties}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="inline-flex items-center gap-2">
                    <ShieldCheck className="size-4" />
                    Installation Status Report
                  </CardTitle>
                  <CardDescription>Completion vs pending distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <InstallationStatusChart
                    completed={completedInstallations}
                    pending={pendingInstallations}
                    total={totalInstallations}
                  />
                </CardContent>
              </Card>
            </section>

            <section>
              <Card className="bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest machine and installation events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-background/60 p-3 transition-colors hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.meta}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant={item.type === "machine" ? "secondary" : "outline"}>
                          {item.type === "machine" ? "Machine" : "Installation"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                      </div>
                    </Link>
                  ))}

                  {recentActivity.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No recent activity found.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <Link href={ROUTES.MACHINES} className="rounded-xl border border-border/70 bg-card/70 p-4 transition-colors hover:bg-muted/40">
                <p className="text-sm text-muted-foreground">Machine Management</p>
                <p className="mt-1 text-base font-semibold">View machines, models, and warranty setup</p>
              </Link>

              <Link href={ROUTES.CONFIRM_INSTALLATIONS} className="rounded-xl border border-border/70 bg-card/70 p-4 transition-colors hover:bg-muted/40">
                <p className="text-sm text-muted-foreground">Installation Operations</p>
                <p className="mt-1 text-base font-semibold">Review and confirm installation reports</p>
              </Link>
            </section>
          </>
        )}

        {(pendingQuery.isFetching || completedQuery.isFetching) && (
          <p className="text-xs text-muted-foreground">Refreshing installation status summaries...</p>
        )}
      </main>
    </>
  );
}