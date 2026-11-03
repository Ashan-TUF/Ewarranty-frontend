"use client";

import { useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, FileSearch, FileText, Hash, Mail, MapPin, Pencil, Phone, Printer, Save, UserRound, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageState } from "@/features/machine/components";

import {
    useConfirmInstallationReport,
    useInstallationReport,
} from "../hooks";
import type { InstallationReport } from "../types/installation-report";

interface InstallationReportDetailsDialogProps {
    open: boolean;
    reportId: number | null;
    onOpenChange: (open: boolean) => void;
}

interface DetailItem {
    label: string;
    value: unknown;
}

function isDateLikeString(value: string) {
    const normalized = value.trim();

    // Avoid parsing plain numeric identifiers/codes like "00004" or "1012" as dates.
    if (/^\d+$/.test(normalized)) {
        return false;
    }

    // Accept common API date shapes such as 2026-08-06 or 2026-08-06T10:30:00.
    if (!/^\d{4}-\d{2}-\d{2}(?:[T\s].*)?$/.test(normalized)) {
        return false;
    }

    return Number.isFinite(Date.parse(normalized));
}

function formatValue(value: unknown) {
    if (value == null || value === "") {
        return "-";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "string" && isDateLikeString(value)) {
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
        <section className="space-y-2 border-t border-border/60 pt-3 first:border-t-0 first:pt-0">
            <h3 className="text-xs font-medium text-foreground">{title}</h3>
            <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
                {items.map((item) => (
                    <div key={item.label} className="min-w-0">
                        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground [&_svg]:size-3.5 [&_svg]:text-primary">{detailIcon(item.label)}{item.label}</p>
                        <p className="mt-0.5 break-words pl-5 text-xs leading-relaxed text-foreground">{formatValue(item.value)}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function detailIcon(label: string) {
    if (/date|created|updated/i.test(label)) return <CalendarDays />;
    if (/phone|fax/i.test(label)) return <Phone />;
    if (/email/i.test(label)) return <Mail />;
    if (/city|address|street|floor|building|area|department/i.test(label)) return <MapPin />;
    if (/machine|serial|model/i.test(label)) return <Printer />;
    if (/customer|contact|engineer|executive|installed by/i.test(label)) return <UserRound />;
    if (/number|code|counter|id/i.test(label)) return <Hash />;
    return <FileText />;
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

export function InstallationReportDetailsDialog({
    open,
    reportId,
    onOpenChange,
}: InstallationReportDetailsDialogProps) {
    const [isEditingInvoice, setIsEditingInvoice] = useState(false);
    const [invoiceDraft, setInvoiceDraft] = useState("");

    const enabledReportId = reportId ?? 0;
    const {
        data: report,
        isLoading,
        isError,
        error,
        refetch,
    } = useInstallationReport(enabledReportId);
    const confirmMutation = useConfirmInstallationReport();

    const sections = report ? buildSections(report) : [];

    async function handleInvoiceSave() {
        if (!reportId) {
            return;
        }

        try {
            const normalizedInvoice = invoiceDraft.trim();

            await confirmMutation.mutateAsync({
                id: reportId,
                payload: normalizedInvoice
                    ? { invoiceNumber: normalizedInvoice }
                    : {},
            });

            await refetch();
            setIsEditingInvoice(false);
            toast.success("Invoice number updated successfully.");
        } catch (updateError) {
            const message =
                updateError instanceof Error
                    ? updateError.message
                    : "Failed to update invoice number.";

            toast.error(message);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] gap-4 overflow-x-hidden overflow-y-auto sm:max-w-[800px]">
                <DialogHeader className="gap-2 border-b border-border/60 pb-3">
                    <Button type="button" variant="ghost" size="sm" className="-ml-2 h-auto w-fit gap-1 px-2 py-1 text-xs font-normal text-muted-foreground" onClick={() => onOpenChange(false)}>
                        <ArrowLeft className="size-3.5" />Back to reports
                    </Button>
                    <div className="flex items-start gap-3 pr-6">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText className="size-4" /></span>
                        <div><DialogTitle className="text-[15px] font-normal">Installation report</DialogTitle>
                        <DialogDescription className="text-[11px] font-normal">Report #{reportId ?? "-"}</DialogDescription></div>
                    </div>
                </DialogHeader>

                {isLoading && (
                    <PageState
                        title="Loading installation report..."
                        description="Retrieving full installation details."
                    />
                )}

                {(isError || (!isLoading && !report)) && (
                    <PageState
                        title="Installation report not found"
                        description={
                            error instanceof Error
                                ? error.message
                                : "No details were returned for this report."
                        }
                        icon={<FileSearch className="size-8" />}
                    />
                )}

                {report && (
                    <div className="space-y-4">
                        <section className="space-y-2">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h3 className="font-heading text-sm font-normal">
                                        {report.customerName}
                                    </h3>
                                    <p className="text-[11px] font-normal text-muted-foreground">
                                        {report.machineModel} - {formatValue(report.serialNumber)}
                                    </p>
                                </div>

                                <span className="inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-normal text-muted-foreground">
                                    <CheckCircle2 className="size-3.5" />
                                    {report.installationStatus}
                                </span>
                            </div>

                            <div className="grid gap-2 border-y border-border/70 py-2 text-xs sm:grid-cols-2">
                                <div>
                                    <p className="text-xs leading-none text-muted-foreground">Invoice Number</p>

                                    {isEditingInvoice ? (
                                        <div className="mt-1.5 flex items-center gap-1.5">
                                            <Input
                                                value={invoiceDraft}
                                                onChange={(event) => setInvoiceDraft(event.target.value)}
                                                placeholder="e.g. INV-2026-0001"
                                                className="h-9"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-7 w-7 shrink-0 p-0 text-muted-foreground"
                                                onClick={handleInvoiceSave}
                                                disabled={confirmMutation.isPending}
                                                aria-label="Save invoice number"
                                            >
                                                <Save className="size-3.5" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-7 w-7 shrink-0 p-0 text-muted-foreground"
                                                onClick={() => {
                                                    setInvoiceDraft(report.invoiceNumber ?? "");
                                                    setIsEditingInvoice(false);
                                                }}
                                                disabled={confirmMutation.isPending}
                                                aria-label="Cancel invoice edit"
                                            >
                                                <X className="size-3.5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="mt-1.5 flex items-center gap-1.5">
                                            <p className="font-normal">{formatValue(report.invoiceNumber)}</p>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 text-muted-foreground"
                                                onClick={() => {
                                                    setInvoiceDraft(report.invoiceNumber ?? "");
                                                    setIsEditingInvoice(true);
                                                }}
                                                aria-label="Edit invoice number"
                                            >
                                                <Pencil className="size-3.5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Installation Date</p>
                                    <p className="font-normal">{formatValue(report.installationDate)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Installed By</p>
                                    <p className="font-normal">{formatValue(report.installedBy)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">City</p>
                                    <p className="font-normal">{formatValue(report.city)}</p>
                                </div>
                            </div>
                        </section>

                        {sections.map((section) => (
                            <DetailsSection
                                key={section.title}
                                title={section.title}
                                items={section.items}
                            />
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
