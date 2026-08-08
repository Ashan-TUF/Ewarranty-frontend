"use client";

import { FormEvent, useMemo, useState } from "react";
import {
    ClipboardList,
    Loader2,
    Pencil,
    Plus,
    RefreshCw,
    Save,
    Search,
} from "lucide-react";
import { toast } from "sonner";

import AppHeader from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageState } from "@/features/machine/components";

import {
    useSubmitInstallationReport,
    useUpdateInstallationReport,
} from "../../hooks";
import { getInstallationReportById } from "../../services";
import type {
    CreateInstallationReportRequest,
    InstallationReport,
    UpdateInstallationReportRequest,
} from "../../types/installation-report";

type FormMode = "create" | "update";

interface InstallationFormState {
    customerCode: string;
    customerName: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    phone: string;
    contactPerson: string;
    email: string;
    machineDescription: string;
    machineModel: string;
    serialNo: string;
    referenceNo: string;
    invoiceNo: string;
    installationDate: string;
    installedBy: string;
    remarks: string;
    area: string;
    quotationNo: string;
    copyCounter: string;
    masterCounter: string;
    salesExecutive: string;
    engineer: string;
    department: string;
    floor: string;
    buildingDescription: string;
    streetName: string;
    fax: string;
    isUsbEnabled: boolean;
    isNetworkEnabled: boolean;
    isStandAlone: boolean;
    isFaxEnabled: boolean;
    ricohRemoteEnabled: boolean;
    isManualReceived: boolean;
}

const emptyForm: InstallationFormState = {
    customerCode: "",
    customerName: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    city: "",
    phone: "",
    contactPerson: "",
    email: "",
    machineDescription: "",
    machineModel: "",
    serialNo: "",
    referenceNo: "",
    invoiceNo: "",
    installationDate: "",
    installedBy: "",
    remarks: "",
    area: "",
    quotationNo: "",
    copyCounter: "",
    masterCounter: "",
    salesExecutive: "",
    engineer: "",
    department: "",
    floor: "",
    buildingDescription: "",
    streetName: "",
    fax: "",
    isUsbEnabled: true,
    isNetworkEnabled: true,
    isStandAlone: false,
    isFaxEnabled: false,
    ricohRemoteEnabled: false,
    isManualReceived: true,
};

const requiredCreateFields: Array<keyof InstallationFormState> = [
    "customerCode",
    "customerName",
    "addressLine1",
    "city",
    "phone",
    "contactPerson",
    "machineDescription",
    "machineModel",
    "serialNo",
    "installationDate",
    "installedBy",
];

function cleanText(value: string) {
    const trimmed = value.trim();
    return trimmed || undefined;
}

function cleanNumber(value: string) {
    if (!value.trim()) {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function toApiDate(value: string) {
    if (!value) {
        return "";
    }

    return value.length === 16 ? `${value}:00` : value;
}

function toDateTimeInput(value?: string) {
    if (!value) {
        return "";
    }

    return value.slice(0, 16);
}

function mapReportToForm(report: InstallationReport): InstallationFormState {
    return {
        ...emptyForm,
        customerCode: report.customerCode ?? "",
        customerName: report.customerName ?? "",
        addressLine1: report.addressLine1 ?? "",
        addressLine2: report.addressLine2 ?? "",
        addressLine3: report.addressLine3 ?? "",
        city: report.city ?? "",
        phone: report.phone ?? "",
        contactPerson: report.contactPerson ?? "",
        email: report.email ?? "",
        machineDescription: report.machineDescription ?? "",
        machineModel: report.machineModel ?? "",
        serialNo: report.serialNumber ?? "",
        referenceNo: report.machineReferenceNo ?? "",
        invoiceNo: report.invoiceNumber ?? "",
        installationDate: toDateTimeInput(report.installationDate),
        installedBy: report.installedBy ?? "",
        remarks: report.remarks ?? "",
        area: report.area ?? "",
        quotationNo: report.quotationNumber ?? "",
        copyCounter: report.copyCounter == null ? "" : String(report.copyCounter),
        masterCounter: report.masterCounter == null ? "" : String(report.masterCounter),
        salesExecutive: report.salesExecutive ?? "",
        engineer: report.engineer ?? "",
        department: report.department ?? "",
        floor: report.floor ?? "",
        buildingDescription: report.buildingDescription ?? "",
        streetName: report.streetName ?? "",
        fax: report.fax ?? "",
        isUsbEnabled: Boolean(report.isUsbEnabled),
        isNetworkEnabled: Boolean(report.isNetworkEnabled),
        isStandAlone: Boolean(report.isStandAlone),
        isFaxEnabled: Boolean(report.isFaxEnabled),
        ricohRemoteEnabled: Boolean(report.ricohRemoteEnabled),
        isManualReceived: Boolean(report.isManualReceived),
    };
}

function buildCreatePayload(form: InstallationFormState): CreateInstallationReportRequest {
    return {
        customerCode: form.customerCode.trim(),
        customerName: form.customerName.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: cleanText(form.addressLine2),
        addressLine3: cleanText(form.addressLine3),
        city: form.city.trim(),
        phone: form.phone.trim(),
        contactPerson: form.contactPerson.trim(),
        email: cleanText(form.email),
        machineDescription: form.machineDescription.trim(),
        machineModel: form.machineModel.trim(),
        serialNo: form.serialNo.trim(),
        referenceNo: cleanText(form.referenceNo),
        invoiceNo: cleanText(form.invoiceNo),
        installationDate: toApiDate(form.installationDate),
        installedBy: form.installedBy.trim(),
        remarks: cleanText(form.remarks),
        area: cleanText(form.area),
        quotationNo: cleanText(form.quotationNo),
        copyCounter: cleanNumber(form.copyCounter),
        masterCounter: cleanNumber(form.masterCounter),
        salesExecutive: cleanText(form.salesExecutive),
        engineer: cleanText(form.engineer),
        department: cleanText(form.department),
        floor: cleanText(form.floor),
        buildingDescription: cleanText(form.buildingDescription),
        streetName: cleanText(form.streetName),
        fax: cleanText(form.fax),
        isUsbEnabled: form.isUsbEnabled,
        isNetworkEnabled: form.isNetworkEnabled,
        isStandAlone: form.isStandAlone,
        isFaxEnabled: form.isFaxEnabled,
        ricohRemoteEnabled: form.ricohRemoteEnabled,
        isManualReceived: form.isManualReceived,
    };
}

function buildUpdatePayload(form: InstallationFormState): UpdateInstallationReportRequest {
    return {
        customerName: cleanText(form.customerName),
        addressLine1: cleanText(form.addressLine1),
        addressLine2: cleanText(form.addressLine2),
        addressLine3: cleanText(form.addressLine3),
        city: cleanText(form.city),
        phone: cleanText(form.phone),
        contactPerson: cleanText(form.contactPerson),
        email: cleanText(form.email),
        machineDescription: cleanText(form.machineDescription),
        machineReferenceNo: cleanText(form.referenceNo),
        installationDate: form.installationDate ? toApiDate(form.installationDate) : undefined,
        installedBy: cleanText(form.installedBy),
        remarks: cleanText(form.remarks),
        area: cleanText(form.area),
        quotationNumber: cleanText(form.quotationNo),
        copyCounter: cleanNumber(form.copyCounter),
        masterCounter: cleanNumber(form.masterCounter),
        salesExecutive: cleanText(form.salesExecutive),
        engineer: cleanText(form.engineer),
        department: cleanText(form.department),
        floor: cleanText(form.floor),
        buildingDescription: cleanText(form.buildingDescription),
        streetName: cleanText(form.streetName),
        fax: cleanText(form.fax),
        isUsbEnabled: form.isUsbEnabled,
        isNetworkEnabled: form.isNetworkEnabled,
        isStandAlone: form.isStandAlone,
        isFaxEnabled: form.isFaxEnabled,
        ricohRemoteEnabled: form.ricohRemoteEnabled,
        isManualReceived: form.isManualReceived,
    };
}

function Field({
    label,
    value,
    onChange,
    type = "text",
    required = false,
    disabled = false,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
}) {
    return (
        <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
                {label}
                {required ? " *" : ""}
            </span>
            <Input
                type={type}
                value={value}
                disabled={disabled}
                required={required}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
            />
        </label>
    );
}

function TextareaField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="space-y-1.5 sm:col-span-2 xl:col-span-3">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            <Textarea
                value={value}
                rows={3}
                onChange={(event) => onChange(event.target.value)}
            />
        </label>
    );
}

function OptionField({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex min-h-11 items-center gap-3 rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-sm font-medium">
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="size-4 accent-primary"
            />
            {label}
        </label>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {children}
            </CardContent>
        </Card>
    );
}

export default function SubmitMachineInstallationPage() {
    const [mode, setMode] = useState<FormMode>("create");
    const [form, setForm] = useState<InstallationFormState>(emptyForm);
    const [reportIdInput, setReportIdInput] = useState("");
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isLoadingReport, setIsLoadingReport] = useState(false);

    const submitMutation = useSubmitInstallationReport();
    const updateMutation = useUpdateInstallationReport();

    const isSubmitting = submitMutation.isPending || updateMutation.isPending;

    const canUpdate = useMemo(
        () => Number.isFinite(Number(reportIdInput)) && Number(reportIdInput) > 0,
        [reportIdInput]
    );

    function setField<TKey extends keyof InstallationFormState>(
        key: TKey,
        value: InstallationFormState[TKey]
    ) {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
    }

    function resetForm() {
        setForm(emptyForm);
        setReportIdInput("");
        setLoadError(null);
    }

    function validateCreate() {
        const missingField = requiredCreateFields.find((field) => {
            const value = form[field];
            return typeof value === "string" && !value.trim();
        });

        if (missingField) {
            toast.error("Please fill all required fields.");
            return false;
        }

        return true;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            if (mode === "create") {
                if (!validateCreate()) {
                    return;
                }

                const result = await submitMutation.mutateAsync(buildCreatePayload(form));
                toast.success(`Installation report submitted. ID ${result.id}.`);
                resetForm();
                return;
            }

            const id = Number(reportIdInput);
            if (!Number.isFinite(id) || id <= 0) {
                toast.error("Please enter a valid installation report ID.");
                return;
            }

            const result = await updateMutation.mutateAsync({
                id,
                payload: buildUpdatePayload(form),
            });
            toast.success(`Installation report ${result.id} updated.`);
        } catch (submitError) {
            toast.error(
                submitError instanceof Error
                    ? submitError.message
                    : "Failed to save installation report."
            );
        }
    }

    async function handleLoadReport() {
        const id = Number(reportIdInput);

        if (!Number.isFinite(id) || id <= 0) {
            toast.error("Please enter a valid installation report ID.");
            return;
        }

        setIsLoadingReport(true);
        setLoadError(null);

        try {
            const report = await getInstallationReportById(id);

            if (!report) {
                setLoadError("No installation report was returned for this ID.");
                return;
            }

            setForm(mapReportToForm(report));
            toast.success(`Installation report ${report.id} loaded.`);
        } catch (loadReportError) {
            const message =
                loadReportError instanceof Error
                    ? loadReportError.message
                    : "Failed to load installation report.";

            setLoadError(message);
            toast.error(message);
        } finally {
            setIsLoadingReport(false);
        }
    }

    return (
        <>
            <AppHeader
                title="Submit Installations"
                description="Create and update machine installation reports"
            />

            <main className="space-y-6 p-4 sm:p-6">
                <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="size-5" />
                            Installation Report Form
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                            <div className="inline-flex w-fit items-center gap-1 rounded-lg border bg-background p-1">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={mode === "create" ? "default" : "ghost"}
                                    onClick={() => {
                                        setMode("create");
                                        resetForm();
                                    }}
                                >
                                    <Plus className="size-4" />
                                    Create
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={mode === "update" ? "default" : "ghost"}
                                    onClick={() => {
                                        setMode("update");
                                        resetForm();
                                    }}
                                >
                                    <Pencil className="size-4" />
                                    Update
                                </Button>
                            </div>

                            {mode === "update" && (
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                                    <Field
                                        label="Installation Report ID"
                                        value={reportIdInput}
                                        type="number"
                                        placeholder="e.g. 10"
                                        onChange={setReportIdInput}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={!canUpdate || isLoadingReport}
                                        onClick={handleLoadReport}
                                    >
                                        {isLoadingReport ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Search className="size-4" />
                                        )}
                                        Load
                                    </Button>
                                </div>
                            )}
                        </div>

                        {mode === "update" && loadError && (
                            <PageState
                                title="Failed to load installation report"
                                description={loadError}
                            />
                        )}
                    </CardContent>
                </Card>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Section title="Customer Details">
                        <Field
                            label="Customer Code"
                            value={form.customerCode}
                            required={mode === "create"}
                            disabled={mode === "update"}
                            onChange={(value) => setField("customerCode", value)}
                        />
                        <Field
                            label="Customer Name"
                            value={form.customerName}
                            required={mode === "create"}
                            onChange={(value) => setField("customerName", value)}
                        />
                        <Field
                            label="Address Line 1"
                            value={form.addressLine1}
                            required={mode === "create"}
                            onChange={(value) => setField("addressLine1", value)}
                        />
                        <Field
                            label="Address Line 2"
                            value={form.addressLine2}
                            onChange={(value) => setField("addressLine2", value)}
                        />
                        <Field
                            label="Address Line 3"
                            value={form.addressLine3}
                            onChange={(value) => setField("addressLine3", value)}
                        />
                        <Field
                            label="City"
                            value={form.city}
                            required={mode === "create"}
                            onChange={(value) => setField("city", value)}
                        />
                        <Field
                            label="Phone"
                            value={form.phone}
                            required={mode === "create"}
                            onChange={(value) => setField("phone", value)}
                        />
                        <Field
                            label="Contact Person"
                            value={form.contactPerson}
                            required={mode === "create"}
                            onChange={(value) => setField("contactPerson", value)}
                        />
                        <Field
                            label="Email"
                            value={form.email}
                            type="email"
                            onChange={(value) => setField("email", value)}
                        />
                        <Field
                            label="Area"
                            value={form.area}
                            onChange={(value) => setField("area", value)}
                        />
                        <Field
                            label="Fax"
                            value={form.fax}
                            onChange={(value) => setField("fax", value)}
                        />
                    </Section>

                    <Section title="Machine Details">
                        <Field
                            label="Machine Model"
                            value={form.machineModel}
                            required={mode === "create"}
                            disabled={mode === "update"}
                            onChange={(value) => setField("machineModel", value)}
                        />
                        <Field
                            label="Machine Description"
                            value={form.machineDescription}
                            required={mode === "create"}
                            onChange={(value) => setField("machineDescription", value)}
                        />
                        <Field
                            label="Serial No"
                            value={form.serialNo}
                            required={mode === "create"}
                            disabled={mode === "update"}
                            onChange={(value) => setField("serialNo", value)}
                        />
                        <Field
                            label="Reference No"
                            value={form.referenceNo}
                            onChange={(value) => setField("referenceNo", value)}
                        />
                    </Section>

                    <Section title="Installation Details">
                        <Field
                            label="Invoice No"
                            value={form.invoiceNo}
                            disabled={mode === "update"}
                            onChange={(value) => setField("invoiceNo", value)}
                        />
                        <Field
                            label="Installation Date"
                            value={form.installationDate}
                            type="datetime-local"
                            required={mode === "create"}
                            onChange={(value) => setField("installationDate", value)}
                        />
                        <Field
                            label="Installed By"
                            value={form.installedBy}
                            required={mode === "create"}
                            onChange={(value) => setField("installedBy", value)}
                        />
                        <Field
                            label="Quotation No"
                            value={form.quotationNo}
                            onChange={(value) => setField("quotationNo", value)}
                        />
                        <Field
                            label="Department"
                            value={form.department}
                            onChange={(value) => setField("department", value)}
                        />
                        <Field
                            label="Floor"
                            value={form.floor}
                            onChange={(value) => setField("floor", value)}
                        />
                        <Field
                            label="Building Description"
                            value={form.buildingDescription}
                            onChange={(value) => setField("buildingDescription", value)}
                        />
                        <Field
                            label="Street Name"
                            value={form.streetName}
                            onChange={(value) => setField("streetName", value)}
                        />
                        <TextareaField
                            label="Remarks"
                            value={form.remarks}
                            onChange={(value) => setField("remarks", value)}
                        />
                    </Section>

                    <Section title="Counters And Team">
                        <Field
                            label="Copy Counter"
                            value={form.copyCounter}
                            type="number"
                            onChange={(value) => setField("copyCounter", value)}
                        />
                        <Field
                            label="Master Counter"
                            value={form.masterCounter}
                            type="number"
                            onChange={(value) => setField("masterCounter", value)}
                        />
                        <Field
                            label="Sales Executive"
                            value={form.salesExecutive}
                            onChange={(value) => setField("salesExecutive", value)}
                        />
                        <Field
                            label="Engineer"
                            value={form.engineer}
                            onChange={(value) => setField("engineer", value)}
                        />
                    </Section>

                    <Section title="Machine Options">
                        <OptionField
                            label="USB Enabled"
                            checked={form.isUsbEnabled}
                            onChange={(checked) => setField("isUsbEnabled", checked)}
                        />
                        <OptionField
                            label="Network Enabled"
                            checked={form.isNetworkEnabled}
                            onChange={(checked) => setField("isNetworkEnabled", checked)}
                        />
                        <OptionField
                            label="Stand Alone"
                            checked={form.isStandAlone}
                            onChange={(checked) => setField("isStandAlone", checked)}
                        />
                        <OptionField
                            label="Fax Enabled"
                            checked={form.isFaxEnabled}
                            onChange={(checked) => setField("isFaxEnabled", checked)}
                        />
                        <OptionField
                            label="Ricoh Remote Enabled"
                            checked={form.ricohRemoteEnabled}
                            onChange={(checked) => setField("ricohRemoteEnabled", checked)}
                        />
                        <OptionField
                            label="Manual Received"
                            checked={form.isManualReceived}
                            onChange={(checked) => setField("isManualReceived", checked)}
                        />
                    </Section>

                    <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t bg-background/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetForm}
                            disabled={isSubmitting}
                        >
                            <RefreshCw className="size-4" />
                            Clear
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || (mode === "update" && !canUpdate)}
                        >
                            {isSubmitting ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Save className="size-4" />
                            )}
                            {mode === "create" ? "Submit Installation" : "Update Installation"}
                        </Button>
                    </div>
                </form>
            </main>
        </>
    );
}
