"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Cpu, Factory, Plus, Wrench } from "lucide-react";

import AppHeader from "@/components/layout/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { MachineCategory } from "@/types/enums";

type MachineStatus = "Active" | "Maintenance" | "Pending";

const machines = [
    {
        id: "MCH-001",
        name: "Apex Pro 500",
        manufacturer: "Canon",
        category: MachineCategory.MultifunctionPrinter,
        status: "Active" as MachineStatus,
        location: "Main Office - Floor 2",
        installedOn: "2025-11-12",
        warranty: "Valid until 2027-11",
    },
    {
        id: "MCH-002",
        name: "SwiftScan X2",
        manufacturer: "Epson",
        category: MachineCategory.Scanner,
        status: "Maintenance" as MachineStatus,
        location: "Branch Office - Reception",
        installedOn: "2025-08-04",
        warranty: "Valid until 2026-08",
    },
    {
        id: "MCH-003",
        name: "DocuPrint 760",
        manufacturer: "HP",
        category: MachineCategory.Printer,
        status: "Active" as MachineStatus,
        location: "Admin Block - Printing Bay",
        installedOn: "2026-01-20",
        warranty: "Valid until 2028-01",
    },
    {
        id: "MCH-004",
        name: "VisionBeam 4K",
        manufacturer: "BenQ",
        category: MachineCategory.Projector,
        status: "Pending" as MachineStatus,
        location: "Training Room A",
        installedOn: "2026-07-02",
        warranty: "Pending activation",
    },
];

const statusStyles: Record<MachineStatus, string> = {
    Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    Maintenance: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    Pending: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
};

const categoryLabels: Record<MachineCategory, string> = {
    [MachineCategory.Copier]: "Copier",
    [MachineCategory.Printer]: "Printer",
    [MachineCategory.MultifunctionPrinter]: "Multifunction Printer",
    [MachineCategory.Projector]: "Projector",
    [MachineCategory.Duplicator]: "Duplicator",
    [MachineCategory.Scanner]: "Scanner",
};

function formatDate(dateValue: string) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(dateValue));
}

export default function MachineListPage() {
    return (
        <>
            <AppHeader
                title="Machines"
                description="Overview of registered machines and their current state."
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
                            <CardTitle className="text-3xl">24</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Active devices across all branches.
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Under Maintenance</CardDescription>
                            <CardTitle className="text-3xl">3</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Machines waiting for service or inspection.
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Pending Registration</CardDescription>
                            <CardTitle className="text-3xl">2</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Newly added items not yet activated.
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-5 lg:grid-cols-2">
                    {machines.map((machine) => (
                        <Card key={machine.id} className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Cpu className="size-4 text-primary" />
                                            {machine.name}
                                        </CardTitle>
                                        <CardDescription className="mt-1 flex items-center gap-2">
                                            <Factory className="size-4" />
                                            {machine.manufacturer} • {machine.id}
                                        </CardDescription>
                                    </div>

                                    <Badge className={statusStyles[machine.status]} variant="outline">
                                        {machine.status}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl bg-muted/40 p-3">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Category
                                        </p>
                                        <p className="mt-1 font-medium">{categoryLabels[machine.category]}</p>
                                    </div>

                                    <div className="rounded-xl bg-muted/40 p-3">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Location
                                        </p>
                                        <p className="mt-1 font-medium">{machine.location}</p>
                                    </div>

                                    <div className="rounded-xl bg-muted/40 p-3">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Installed
                                        </p>
                                        <p className="mt-1 flex items-center gap-2 font-medium">
                                            <CalendarDays className="size-4 text-primary" />
                                            {formatDate(machine.installedOn)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-muted/40 p-3">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Warranty
                                        </p>
                                        <p className="mt-1 flex items-center gap-2 font-medium">
                                            <Wrench className="size-4 text-primary" />
                                            {machine.warranty}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary">{machine.manufacturer}</Badge>
                                    <Badge variant="outline">{categoryLabels[machine.category]}</Badge>
                                    <Badge variant="ghost">Ready for service</Badge>
                                </div>

                                <div className="flex flex-wrap gap-3 pt-1">
                                    <Button variant="outline" size="sm" type="button">
                                        View details
                                        <ArrowRight className="size-4" />
                                    </Button>

                                    <Button variant="secondary" size="sm" type="button">
                                        Schedule maintenance
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            </main>
        </>
    );
}