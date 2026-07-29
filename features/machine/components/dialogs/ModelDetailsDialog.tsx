"use client";

import { useMemo, useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Clock,
    Copy,
    Gauge,
    RotateCcw,
    ShieldCheck,
    ShieldX,
    SlidersHorizontal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import type {
    MachineResponse,
    MachineModelResponse,
    WarrantyResponse,
} from "../../types/machine";

import { MachinePagination } from "../MachinePagination";
import { useWarrantyTypes } from "../../hooks/useWarrantyTypes";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(dateValue?: string) {
    if (!dateValue) return "—";

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(dateValue));
}

const ruleTypeLabels: Record<string, string> = {
    TimeOnly: "Time Only",
    TimeOrCopies: "Time or Copies",
    TimeOrHours: "Time or Hours",
};

/* =========================================================
   TYPES
========================================================= */

interface ModelDetailsDialogProps {
    machine: MachineResponse;
    model: MachineModelResponse | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/* =========================================================
   MODEL DETAILS DIALOG
========================================================= */

export function ModelDetailsDialog({
    machine,
    model,
    open,
    onOpenChange,
}: ModelDetailsDialogProps) {
    /* ---------------------------------------------------------
       Detail View
    --------------------------------------------------------- */

    const [selectedWarrantyCode, setSelectedWarrantyCode] =
        useState<string | null>(null);

    /* ---------------------------------------------------------
       Pagination
    --------------------------------------------------------- */

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    /* ---------------------------------------------------------
       Filters
    --------------------------------------------------------- */

    const [warrantyTypeCode, setWarrantyTypeCode] =
        useState("");

    const [warrantyPeriod, setWarrantyPeriod] =
        useState("");

    const [warrantyPeriodUnit, setWarrantyPeriodUnit] =
        useState("");

    const [ruleType, setRuleType] =
        useState("all");

    /* ---------------------------------------------------------
       Warranty Types
    --------------------------------------------------------- */

    const {
        data: warrantyTypes = [],
        isLoading: isWarrantyTypesLoading,
    } = useWarrantyTypes();

    /* ---------------------------------------------------------
       Model Warranties
    --------------------------------------------------------- */

    const warranties = useMemo(
        () => model?.warranties ?? [],
        [model]
    );

    const selectedWarranty = warranties.find(
        (warranty) =>
            warranty.warrantyTypeCode === selectedWarrantyCode
    );

    /* =========================================================
       PERIOD FILTER STATE
    ========================================================= */

    const hasPeriod =
        warrantyPeriod.trim() !== "";

    const hasPeriodUnit =
        warrantyPeriodUnit !== "";

    const hasCompletePeriodFilter =
        hasPeriod && hasPeriodUnit;

    const hasIncompletePeriodFilter =
        hasPeriod !== hasPeriodUnit;

    /* =========================================================
       FILTERING
    ========================================================= */

    const filteredWarranties = useMemo(() => {
        return warranties.filter((warranty) => {
            /* Warranty Type */

            const matchesWarrantyType =
                !warrantyTypeCode ||
                warranty.warrantyTypeCode === warrantyTypeCode;

            /* Warranty Period + Unit

               Filter only when BOTH are selected.
            */

            const matchesWarrantyPeriod =
                !hasCompletePeriodFilter ||
                (
                    warranty.warrantyPeriod ===
                    Number(warrantyPeriod) &&
                    warranty.warrantyPeriodUnit ===
                    warrantyPeriodUnit
                );

            /* Rule Type */

            const matchesRuleType =
                ruleType === "all" ||
                warranty.ruleType === ruleType;

            return (
                matchesWarrantyType &&
                matchesWarrantyPeriod &&
                matchesRuleType
            );
        });
    }, [
        warranties,
        warrantyTypeCode,
        warrantyPeriod,
        warrantyPeriodUnit,
        ruleType,
        hasCompletePeriodFilter,
    ]);

    /* =========================================================
       PAGINATION
    ========================================================= */

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredWarranties.length / pageSize
        )
    );

    const currentPage = Math.min(
        page,
        totalPages
    );

    const paginatedWarranties = useMemo(() => {
        const start =
            (currentPage - 1) * pageSize;

        return filteredWarranties.slice(
            start,
            start + pageSize
        );
    }, [
        filteredWarranties,
        currentPage,
        pageSize,
    ]);

    /* =========================================================
       HANDLERS
    ========================================================= */

    function handlePageSizeChange(
        nextPageSize: number
    ) {
        setPageSize(nextPageSize);
        setPage(1);
    }

    function handleWarrantyTypeChange(
        value: string | null
    ) {
        setWarrantyTypeCode(value ?? "");
        setPage(1);
    }

    function handleWarrantyPeriodChange(
        value: string
    ) {
        setWarrantyPeriod(value);
        setPage(1);
    }

    function handleWarrantyPeriodUnitChange(
        value: string | null
    ) {
        setWarrantyPeriodUnit(value ?? "");
        setPage(1);
    }

    function handleRuleTypeChange(
        value: string | null
    ) {
        setRuleType(value ?? "all");
        setPage(1);
    }

    function resetWarrantyFilters() {
        setWarrantyTypeCode("");
        setWarrantyPeriod("");
        setWarrantyPeriodUnit("");
        setRuleType("all");
        setPage(1);
    }

    function handleOpenChange(next: boolean) {
        onOpenChange(next);

        if (!next) {
            setSelectedWarrantyCode(null);
            resetWarrantyFilters();
        }
    }

    if (!model) {
        return null;
    }

    /* =========================================================
       UI
    ========================================================= */

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
        >
            <DialogContent className="max-h-[85vh] w-full !max-w-2xl overflow-y-auto sm:max-w-2xl">
                {selectedWarranty ? (
                    <WarrantyView
                        machine={machine}
                        model={model}
                        warranty={selectedWarranty}
                        onBack={() =>
                            setSelectedWarrantyCode(null)
                        }
                    />
                ) : (
                    <>
                        {/* =================================================
                            MODEL HEADER
                        ================================================= */}

                        <DialogHeader>
                            <div className="flex items-start justify-between gap-3 pr-6">
                                <div>
                                    <Badge
                                        variant="outline"
                                        className="font-mono text-[11px]"
                                    >
                                        {model.modelCode}
                                    </Badge>

                                    <DialogTitle className="mt-1.5 text-xl">
                                        {model.modelName}
                                    </DialogTitle>

                                    <DialogDescription className="mt-1">
                                        {machine.machineName}
                                        {" · "}
                                        {machine.machineCode}
                                    </DialogDescription>
                                </div>

                                <div className="flex flex-wrap justify-end gap-1.5">
                                    {model.colorType && (
                                        <Badge variant="secondary">
                                            {model.colorType}
                                        </Badge>
                                    )}

                                    {model.networkType && (
                                        <Badge variant="secondary">
                                            {model.networkType}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Model Description */}

                        {model.description && (
                            <p className="text-sm text-muted-foreground">
                                {model.description}
                            </p>
                        )}

                        {/* =================================================
                            WARRANTIES
                        ================================================= */}

                        <section className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Warranties
                                </h3>

                                <p className="text-xs text-muted-foreground">
                                    Showing{" "}
                                    {filteredWarranties.length} of{" "}
                                    {warranties.length} warranties
                                </p>
                            </div>

                            {/* =================================================
                                FILTER PANEL
                            ================================================= */}

                            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                                {/* Filter Header */}

                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <SlidersHorizontal className="size-4 text-muted-foreground" />

                                        <div>
                                            <p className="text-sm font-medium">
                                                Filter Warranties
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                Filter by warranty type,
                                                period and rule.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={
                                            resetWarrantyFilters
                                        }
                                    >
                                        <RotateCcw className="size-3.5" />
                                        Reset
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {/* =================================================
                                        WARRANTY TYPE
                                    ================================================= */}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Warranty Type
                                        </label>

                                        <Select
                                            value={warrantyTypeCode}
                                            onValueChange={
                                                handleWarrantyTypeChange
                                            }
                                            disabled={
                                                isWarrantyTypesLoading
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue
                                                    placeholder={
                                                        isWarrantyTypesLoading
                                                            ? "Loading warranty types..."
                                                            : "Select warranty type"
                                                    }
                                                />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {warrantyTypes.map(
                                                    (warrantyType) => (
                                                        <SelectItem
                                                            key={
                                                                warrantyType.warrantyTypeCode
                                                            }
                                                            value={
                                                                warrantyType.warrantyTypeCode
                                                            }
                                                        >
                                                            {
                                                                warrantyType.warrantyTypeName
                                                            }
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>

                                        {warrantyTypeCode && (
                                            <p className="text-xs text-muted-foreground">
                                                Selected code:{" "}
                                                <span className="font-mono">
                                                    {warrantyTypeCode}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    {/* =================================================
                                        WARRANTY PERIOD GROUP
                                    ================================================= */}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Warranty Period
                                        </label>

                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                type="number"
                                                min={1}
                                                value={
                                                    warrantyPeriod
                                                }
                                                placeholder="e.g. 12"
                                                onChange={(event) =>
                                                    handleWarrantyPeriodChange(
                                                        event.target.value
                                                    )
                                                }
                                            />

                                            <Select
                                                value={
                                                    warrantyPeriodUnit
                                                }
                                                onValueChange={
                                                    handleWarrantyPeriodUnitChange
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select unit" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="Days">
                                                        Days
                                                    </SelectItem>

                                                    <SelectItem value="Months">
                                                        Months
                                                    </SelectItem>

                                                    <SelectItem value="Years">
                                                        Years
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {hasIncompletePeriodFilter && (
                                            <p className="text-xs text-amber-600">
                                                Enter both warranty
                                                period and period unit
                                                to apply this filter.
                                            </p>
                                        )}
                                    </div>

                                    {/* =================================================
                                        RULE TYPE
                                    ================================================= */}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Rule Type
                                        </label>

                                        <Select
                                            value={ruleType}
                                            onValueChange={
                                                handleRuleTypeChange
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select rule type" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Rules
                                                </SelectItem>

                                                <SelectItem value="TimeOnly">
                                                    Time Only
                                                </SelectItem>

                                                <SelectItem value="TimeOrCopies">
                                                    Time or Copies
                                                </SelectItem>

                                                <SelectItem value="TimeOrHours">
                                                    Time or Hours
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* =================================================
                                NO WARRANTIES
                            ================================================= */}

                            {warranties.length === 0 ? (
                                <div className="rounded-xl border border-dashed py-10 text-center">
                                    <p className="font-medium">
                                        No warranties added yet
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        Add a warranty for this model
                                        to see it listed here.
                                    </p>
                                </div>
                            ) : filteredWarranties.length === 0 ? (
                                /* =================================================
                                   NO MATCHING RESULTS
                                ================================================= */

                                <div className="rounded-xl border border-dashed py-10 text-center">
                                    <p className="font-medium">
                                        No matching warranties
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        No warranties match the
                                        selected filters.
                                    </p>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={
                                            resetWarrantyFilters
                                        }
                                    >
                                        <RotateCcw className="size-3.5" />
                                        Clear Filters
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {/* =================================================
                                        WARRANTY CARDS
                                    ================================================= */}

                                    <div className="space-y-2">
                                        {paginatedWarranties.map(
                                            (warranty) => (
                                                <button
                                                    key={
                                                        warranty.warrantyTypeCode
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedWarrantyCode(
                                                            warranty.warrantyTypeCode
                                                        )
                                                    }
                                                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/80 p-4 text-left shadow-sm backdrop-blur transition-colors hover:bg-muted/40"
                                                >
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        {warranty.isActive ? (
                                                            <ShieldCheck className="size-5 shrink-0 text-emerald-500" />
                                                        ) : (
                                                            <ShieldX className="size-5 shrink-0 text-muted-foreground" />
                                                        )}

                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium">
                                                                {
                                                                    warranty.warrantyTypeName
                                                                }
                                                            </p>

                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    warranty.warrantyTypeCode
                                                                }
                                                                {" · "}
                                                                {
                                                                    warranty.warrantyPeriod
                                                                }{" "}
                                                                {
                                                                    warranty.warrantyPeriodUnit
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                {ruleTypeLabels[
                                                                    warranty
                                                                        .ruleType
                                                                ] ??
                                                                    warranty.ruleType}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                                                </button>
                                            )
                                        )}
                                    </div>

                                    {/* =================================================
                                        PAGINATION
                                    ================================================= */}

                                    <div className="border-t pt-4">
                                        <MachinePagination
                                            page={currentPage}
                                            pageSize={pageSize}
                                            totalItems={
                                                filteredWarranties.length
                                            }
                                            onPageChange={setPage}
                                            onPageSizeChange={
                                                handlePageSizeChange
                                            }
                                        />
                                    </div>
                                </>
                            )}
                        </section>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

/* =========================================================
   WARRANTY DETAIL VIEW
========================================================= */

interface WarrantyViewProps {
    machine: MachineResponse;
    model: MachineModelResponse;
    warranty: WarrantyResponse;
    onBack: () => void;
}

function WarrantyView({
    machine,
    model,
    warranty,
    onBack,
}: WarrantyViewProps) {
    return (
        <>
            {/* =================================================
                HEADER
            ================================================= */}

            <DialogHeader>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="-ml-2 h-auto w-fit gap-1.5 px-2 py-1 text-muted-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to {model.modelName}
                </Button>

                <div className="flex items-start justify-between gap-3 pr-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className="font-mono text-[11px]"
                            >
                                {warranty.warrantyTypeCode}
                            </Badge>

                            <Badge
                                variant={
                                    warranty.isActive
                                        ? "secondary"
                                        : "destructive"
                                }
                            >
                                {warranty.isActive
                                    ? "Active"
                                    : "Inactive"}
                            </Badge>
                        </div>

                        <DialogTitle className="mt-1.5 text-xl">
                            {warranty.warrantyTypeName}
                        </DialogTitle>

                        <DialogDescription className="mt-1">
                            {machine.machineName}
                            {" · "}
                            {model.modelName}
                            {" ("}
                            {model.modelCode}
                            {")"}
                        </DialogDescription>
                    </div>

                    {warranty.isActive ? (
                        <ShieldCheck className="size-8 shrink-0 text-emerald-500" />
                    ) : (
                        <ShieldX className="size-8 shrink-0 text-muted-foreground" />
                    )}
                </div>
            </DialogHeader>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            {warranty.description && (
                <p className="text-sm text-muted-foreground">
                    {warranty.description}
                </p>
            )}

            {/* =================================================
                DETAILS
            ================================================= */}

            <div className="grid gap-3 sm:grid-cols-2">
                {/* Warranty Period */}

                <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Warranty Period
                    </p>

                    <p className="mt-1 flex items-center gap-2 font-medium">
                        <Clock className="size-4 text-primary" />

                        {warranty.warrantyPeriod}{" "}
                        {warranty.warrantyPeriodUnit}
                    </p>
                </div>

                {/* Rule Type */}

                <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Rule Type
                    </p>

                    <p className="mt-1 font-medium">
                        {ruleTypeLabels[warranty.ruleType] ??
                            warranty.ruleType}
                    </p>
                </div>

                {/* Copy Limit */}

                {warranty.warrantyCopyLimit != null && (
                    <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Copy Limit
                        </p>

                        <p className="mt-1 flex items-center gap-2 font-medium">
                            <Copy className="size-4 text-primary" />

                            {warranty.warrantyCopyLimit.toLocaleString()}{" "}
                            copies
                        </p>
                    </div>
                )}

                {/* Hour Limit */}

                {warranty.warrantyHourLimit != null && (
                    <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Hour Limit
                        </p>

                        <p className="mt-1 flex items-center gap-2 font-medium">
                            <Gauge className="size-4 text-primary" />

                            {warranty.warrantyHourLimit.toLocaleString()}{" "}
                            hours
                        </p>
                    </div>
                )}

                {/* Registered */}

                <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Registered
                    </p>

                    <p className="mt-1 flex items-center gap-2 font-medium">
                        <CalendarDays className="size-4 text-primary" />

                        {formatDate(warranty.createdAt)}
                    </p>
                </div>
            </div>
        </>
    );
}