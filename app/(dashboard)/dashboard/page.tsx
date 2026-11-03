"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Boxes, CheckCircle2, Clock3, Layers3, Package, PackageSearch, ShieldCheck, Wrench } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useInstallationReports } from "@/features/installation/hooks";
import { PageState } from "@/features/machine/components";
import { useMachines } from "@/features/machine/hooks/useMachine";
import type { ReactNode } from "react";

const installationRequest = { sortBy: "CreatedAt", sortOrder: "desc" as const, page: 1, pageSize: 100 };
const pendingRequest = { ...installationRequest, status: "Pending" as const, pageSize: 1 };
const completedRequest = { ...installationRequest, status: "Completed" as const, pageSize: 1 };

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date);
}

function DashboardCard({ title, description, children, action }: { title: string; description?: string; children: ReactNode; action?: ReactNode }) {
  return <Card size="sm" className="min-w-0 border border-border/70 shadow-none">
    <CardHeader className="flex flex-row items-start justify-between gap-2"><div><CardTitle className="text-sm font-medium">{title}</CardTitle>{description && <CardDescription className="mt-0.5 text-[11px]">{description}</CardDescription>}</div>{action}</CardHeader>
    <CardContent>{children}</CardContent>
  </Card>;
}

function KpiCard({ label, value, detail, icon }: { label: string; value: number; detail: string; icon: ReactNode }) {
  return <Card size="sm" className="border border-border/70 shadow-none transition-colors hover:border-primary/30 motion-reduce:transition-none">
    <CardContent className="space-y-2"><div className="flex items-start justify-between gap-2"><p className="text-[11px] font-normal text-muted-foreground">{label}</p><span className="flex size-7 items-center justify-center rounded-lg bg-muted text-primary [&_svg]:size-3.5">{icon}</span></div><p className="text-[25px] leading-none font-normal tabular-nums">{value.toLocaleString()}</p><p className="text-[11px] text-muted-foreground">{detail}</p></CardContent>
  </Card>;
}

function InstallationStatusChart({ completed, pending, total }: { completed: number; pending: number; total: number }) {
  if (total === 0) return <div className="flex min-h-40 flex-col items-center justify-center gap-1 text-center"><Wrench className="mb-1 size-5 text-muted-foreground" /><p className="text-xs">No installations yet</p><p className="max-w-60 text-[11px] text-muted-foreground">Installation activity will appear here once reports are available.</p><Link href={ROUTES.INSTALLATION_SUMMARY} className="mt-2 text-xs text-primary hover:underline">View installations</Link></div>;
  const other = Math.max(0, total - completed - pending);
  const segments = [{ label: "Completed", value: completed, color: "var(--chart-2, #10b981)" }, { label: "Pending", value: pending, color: "var(--chart-4, #f59e0b)" }, { label: "Other", value: other, color: "var(--chart-3, #38bdf8)" }].filter((segment) => segment.value > 0);
  const circumference = 2 * Math.PI * 42;
  let offset = 0;
  return <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap"><div className="relative mx-auto size-32 shrink-0 sm:mx-0"><svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img" aria-label={`${completed} completed, ${pending} pending, ${other} other installations`}><circle cx="60" cy="60" r="42" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted" />{segments.map((segment) => { const length = segment.value / total * circumference; const currentOffset = offset; offset += length; return <circle key={segment.label} cx="60" cy="60" r="42" fill="none" stroke={segment.color} strokeWidth="12" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-currentOffset} />; })}</svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-normal tabular-nums">{Math.round(completed / total * 100)}%</span><span className="text-[10px] text-muted-foreground">completed</span></div></div><div className="min-w-0 flex-1 space-y-2">{segments.map((segment) => <div key={segment.label} className="flex items-center justify-between gap-4 text-xs"><span className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ backgroundColor: segment.color }} />{segment.label}</span><span className="tabular-nums text-muted-foreground">{segment.value.toLocaleString()}</span></div>)}<p className="border-t border-border/60 pt-2 text-[11px] text-muted-foreground">{total.toLocaleString()} total installations</p></div></div>;
}

export default function DashboardPage() {
  const [showAllActivity, setShowAllActivity] = useState(false);
  const machinesQuery = useMachines();
  const installationsQuery = useInstallationReports(installationRequest);
  const pendingQuery = useInstallationReports(pendingRequest);
  const completedQuery = useInstallationReports(completedRequest);
  const isLoading = machinesQuery.isLoading || installationsQuery.isLoading;
  const isError = machinesQuery.isError || installationsQuery.isError;
  const primaryError = (machinesQuery.error instanceof Error && machinesQuery.error.message) || (installationsQuery.error instanceof Error && installationsQuery.error.message) || "Failed to load dashboard data.";
  const machines = machinesQuery.data?.items ?? [];
  const installations = installationsQuery.data?.items ?? [];
  const totalMachines = machinesQuery.data?.totalCount ?? machines.length;
  const activeMachines = machines.filter((machine) => machine.isActive).length;
  const inactiveMachines = machines.filter((machine) => !machine.isActive).length;
  const categories = machines.reduce<Record<string, number>>((counts, machine) => { const key = machine.category?.trim() || "Unknown"; counts[key] = (counts[key] ?? 0) + 1; return counts; }, {});
  const categoryEntries = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  const maxCategory = Math.max(1, ...categoryEntries.map(([, count]) => count));
  const totalModels = machines.reduce((sum, machine) => sum + machine.models.length, 0);
  const totalWarranties = machines.reduce((sum, machine) => sum + machine.models.reduce((count, model) => count + model.warranties.length, 0), 0);
  const totalInstallations = installationsQuery.data?.totalCount ?? installations.length;
  const pendingInstallations = pendingQuery.data?.totalCount ?? installations.filter((report) => report.installationStatus === "Pending").length;
  const completedInstallations = completedQuery.data?.totalCount ?? installations.filter((report) => report.installationStatus === "Completed").length;
  const recentActivity = [
    ...machines.map((machine) => ({ id: `machine-${machine.machineCode}`, title: machine.machineName || "Unnamed machine", description: "Machine registered", code: machine.machineCode, date: machine.createdAt, type: "machine" as const, href: ROUTES.MACHINE_DETAILS(machine.machineCode) })),
    ...installations.map((report) => ({ id: `installation-${report.id}`, title: report.customerName || report.machineModel || "Installation report", description: `Installation ${report.installationStatus || "recorded"}`, code: report.installationNumber || report.serialNumber || "", date: report.createdAt, type: "installation" as const, href: ROUTES.CONFIRM_INSTALLATION_DETAILS(report.id) })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const visibleActivity = showAllActivity ? recentActivity : recentActivity.slice(0, 5);

  return <><AppHeader title="Dashboard" description="Machines and installations at a glance" actions={<div className="flex items-center gap-2"><Button render={<Link href={ROUTES.MACHINES} prefetch />} nativeButton={false} size="sm" variant="outline"><Boxes className="size-4" />Machines</Button><Button render={<Link href={ROUTES.INSTALLATION_SUMMARY} prefetch />} nativeButton={false} size="sm"><Wrench className="size-4" />Installations</Button></div>} />
    <main className="space-y-4 p-4 sm:p-6">
      {isLoading && <PageState title="Loading dashboard..." description="Fetching machine and installation insights." />}
      {isError && <PageState title="Failed to load dashboard" description={primaryError} />}
      {!isLoading && !isError && <>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
          <KpiCard label="Total Machines" value={totalMachines} detail="Registered inventory" icon={<Boxes />} />
          <KpiCard label="Total Installations" value={totalInstallations} detail="Installation reports" icon={<Wrench />} />
          <KpiCard label="Pending Installations" value={pendingInstallations} detail="Awaiting completion" icon={<Clock3 />} />
          <KpiCard label="Completed Installations" value={completedInstallations} detail="Completed reports" icon={<CheckCircle2 />} />
        </section>
        <section className="grid items-start gap-3 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <DashboardCard title="Machine Distribution" description="Machines by category" action={<PackageSearch className="size-4 text-muted-foreground" />}>
            {categoryEntries.length ? <div className="max-h-64 space-y-2.5 overflow-y-auto pr-1" role="img" aria-label="Machine counts by category">{categoryEntries.map(([category, count]) => <div key={category} title={`${category}: ${count} machines`} className="grid grid-cols-[minmax(80px,120px)_minmax(0,1fr)_2rem] items-center gap-2 text-[11px]"><span className="truncate text-muted-foreground" title={category}>{category}</span><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${count / maxCategory * 100}%` }} /></div><span className="text-right tabular-nums">{count}</span></div>)}</div> : <p className="py-8 text-center text-xs text-muted-foreground">No machines to display yet.</p>}
            <p className="mt-3 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">{categoryEntries.length} categories{totalMachines > machines.length ? ` · based on ${machines.length} loaded machines` : ""}</p>
          </DashboardCard>
          <DashboardCard title="Inventory Overview" description={totalMachines > machines.length ? `Based on ${machines.length} loaded machines` : "Current machine inventory"} action={<Layers3 className="size-4 text-muted-foreground" />}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">{[["Active machines", activeMachines], ["Inactive machines", inactiveMachines], ["Categories", categoryEntries.length], ["Models", totalModels], ["Warranties", totalWarranties]].map(([label, count]) => <div key={label} className="border-b border-border/50 pb-2"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-0.5 text-base font-normal tabular-nums">{count}</p></div>)}</div>
          </DashboardCard>
        </section>
        <section className="grid items-start gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <DashboardCard title="Installation Status" description="Completion and pending distribution" action={<ShieldCheck className="size-4 text-muted-foreground" />}><InstallationStatusChart completed={completedInstallations} pending={pendingInstallations} total={totalInstallations} /></DashboardCard>
          <DashboardCard title="Recent Activity" description="Latest machines and installation reports" action={<Activity className="size-4 text-muted-foreground" />}>
            {visibleActivity.length ? <div className="divide-y divide-border/60">{visibleActivity.map((item) => <Link key={item.id} href={item.href} className="flex min-w-0 items-center gap-2.5 py-2 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">{item.type === "machine" ? <Boxes className="size-3.5" /> : <Wrench className="size-3.5" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-normal">{item.title}</span><span className="block truncate text-[11px] text-muted-foreground">{item.description}{item.code ? ` · ${item.code}` : ""}</span></span><time className="shrink-0 text-[10px] text-muted-foreground" dateTime={item.date}>{formatDate(item.date)}</time></Link>)}</div> : <p className="py-8 text-center text-xs text-muted-foreground">No recent activity found.</p>}
            {recentActivity.length > 5 && <div className="mt-2 border-t border-border/60 pt-2"><Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs font-normal" onClick={() => setShowAllActivity((value) => !value)}>{showAllActivity ? "Show Less" : "View More"}<ArrowRight className="size-3.5" /></Button></div>}
          </DashboardCard>
        </section>
        <nav aria-label="Quick actions" className="flex flex-wrap gap-2"><Link href={ROUTES.MACHINES} className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 py-2 text-xs transition-colors hover:bg-muted/50"><Boxes className="size-3.5 text-primary" />Manage Machines</Link><Link href={ROUTES.ACCESSORIES} className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 py-2 text-xs transition-colors hover:bg-muted/50"><Package className="size-3.5 text-primary" />Manage Accessories</Link><Link href={ROUTES.CONFIRM_INSTALLATIONS} className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 py-2 text-xs transition-colors hover:bg-muted/50"><Wrench className="size-3.5 text-primary" />View Installations</Link></nav>
      </>}
      {(pendingQuery.isFetching || completedQuery.isFetching) && <p className="text-[11px] text-muted-foreground">Refreshing installation status summaries...</p>}
    </main>
  </>;
}
