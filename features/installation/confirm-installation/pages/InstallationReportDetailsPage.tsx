"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileSearch } from "lucide-react";

import AppHeader from "@/components/layout/AppHeader";
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

import { useInstallationReport } from "../../hooks";
import type { InstallationReport } from "../../types/installation-report";

interface InstallationReportDetailsPageProps {
    id: number;
}

interface DetailItem {
    label: string;
    value: unknown;
}

function formatValue(value: unknown) {
    if (value == null || value === "") {
        return "-";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "string" && Number.isFinite(Date.parse(value))) {
        return new Intl.DateTimeFormat("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(value));
    }

    return String(value);
}

function DetailsSection({
    title,
    items,
}: {
    title: string;
    items: DetailItem[];
}) {
    return (
        <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-lg border border-border/70 bg-background/50 p-3"
                        >
                            <dt className="text-xs font-medium uppercase text-muted-foreground">
                                {item.label}
                            </dt>
                            <dd className="mt-1 break-words text-sm font-medium">
                                {formatValue(item.value)}
                            </dd>
                        </div>
                    ))}
                </dl>
            </CardContent>
        </Card>
    );
}

function buildSections(report: InstallationReport) {
    return [
        {
            title: "Customer Details",
            items: [
                { label: "Customer Code", value: report.customerCode },
                { label: "Customer Name", value: report.customerName },
                { label: "Address Line 1", value: report.addressLine1 },
                { label: "Address Line 2", value: report.addressLine2 },
                { label: "Address Line 3", value: report.addressLine3 },
                { label: "City", value: report.city },
                { label: "Phone", value: report.phone },
                { label: "Contact Person", value: report.contactPerson },
                { label: "Email", value: report.email },
                { label: "Fax", value: report.fax },
                { label: "Area", value: report.area },
            ],
        },
        {
            title: "Machine Details",
            items: [
                { label: "Machine Model", value: report.machineModel },
                { label: "Machine Description", value: report.machineDescription },
                { label: "Serial Number", value: report.serialNumber },
                { label: "Machine Reference No", value: report.machineReferenceNo },
            ],
        },
        {
            title: "Installation Details",
            items: [
                { label: "Installation ID", value: report.id },
                { label: "Installation Number", value: report.installationNumber },
                { label: "Installation Date", value: report.installationDate },
                { label: "Installed By", value: report.installedBy },
                { label: "Installation Status", value: report.installationStatus },
                { label: "Invoice Number", value: report.invoiceNumber },
                { label: "Quotation Number", value: report.quotationNumber },
                { label: "Remarks", value: report.remarks },
            ],
        },
        {
            title: "Location Details",
            items: [
                { label: "Department", value: report.department },
                { label: "Floor", value: report.floor },
                { label: "Building Description", value: report.buildingDescription },
                { label: "Street Name", value: report.streetName },
            ],
        },
        {
            title: "Counters And Team",
            items: [
                { label: "Copy Counter", value: report.copyCounter },
                { label: "Master Counter", value: report.masterCounter },
                { label: "Sales Executive", value: report.salesExecutive },
                { label: "Engineer", value: report.engineer },
            ],
        },
        {
            title: "Machine Options",
            items: [
                { label: "USB Enabled", value: report.isUsbEnabled },
                { label: "Network Enabled", value: report.isNetworkEnabled },
                { label: "Stand Alone", value: report.isStandAlone },
                { label: "Fax Enabled", value: report.isFaxEnabled },
                { label: "Ricoh Remote Enabled", value: report.ricohRemoteEnabled },
                { label: "Manual Received", value: report.isManualReceived },
            ],
        },
        {
            title: "System Details",
            items: [
                { label: "Active", value: report.isActive },
                { label: "Created At", value: report.createdAt },
                { label: "Updated At", value: report.updatedAt },
            ],
        },
    ];
}

export default function InstallationReportDetailsPage({
    id,
}: InstallationReportDetailsPageProps) {
    const {
        data: report,
        isLoading,
        isError,
        error,
    } = useInstallationReport(id);

    if (!Number.isFinite(id) || id <= 0) {
        return (
            <>
                <AppHeader
                    title="Installation Report Details"
                    description="Invalid installation report ID"
                />
                <main className="p-4 sm:p-6">
                    <PageState
                        title="Invalid installation report"
                        description="Please select a valid installation report."
                        icon={<FileSearch className="size-8" />}
                    />
                </main>
            </>
        );
    }

    if (isLoading) {
        return (
            <>
                <AppHeader
                    title="Installation Report Details"
                    description={`Loading report ID ${id}`}
                />
                <main className="p-4 sm:p-6">
                    <PageState
                        title="Loading installation report..."
                        description="Retrieving full installation details."
                    />
                </main>
            </>
        );
    }

    if (isError || !report) {
        return (
            <>
                <AppHeader
                    title="Installation Report Details"
                    description={`Report ID ${id}`}
                />
                <main className="p-4 sm:p-6">
                    <PageState
                        title="Installation report not found"
                        description={
                            error instanceof Error
                                ? error.message
                                : "No details were returned for this report."
                        }
                        icon={<FileSearch className="size-8" />}
                    />
                </main>
            </>
        );
    }

    const sections = buildSections(report);

    return (
        <>
            <AppHeader
                title="Installation Report Details"
                description={`${report.customerName} - ID ${report.id}`}
                actions={
                    <Button
                        render={<Link href={ROUTES.CONFIRM_INSTALLATIONS} prefetch />}
                        nativeButton={false}
                        variant="outline"
                        size="sm"
                    >
                        <ArrowLeft className="size-4" />
                        Back
                    </Button>
                }
            />

            <main className="space-y-6 p-4 sm:p-6">
                <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
                    <CardHeader>
                        <CardTitle>{report.customerName}</CardTitle>
                        <CardAction>
                            <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                <CheckCircle2 className="size-3.5" />
                                {report.installationStatus}
                            </span>
                        </CardAction>
                    </CardHeader>
                    <CardContent className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Machine</p>
                            <p className="font-medium">{report.machineModel}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Serial Number</p>
                            <p className="font-medium">{formatValue(report.serialNumber)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Invoice Number</p>
                            <p className="font-medium">{formatValue(report.invoiceNumber)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Installation Date</p>
                            <p className="font-medium">{formatValue(report.installationDate)}</p>
                        </div>
                    </CardContent>
                </Card>

                {sections.map((section) => (
                    <DetailsSection
                        key={section.title}
                        title={section.title}
                        items={section.items}
                    />
                ))}
            </main>
        </>
    );
}
