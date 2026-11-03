"use client";

import { useMemo, useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Clock,
    ChevronDown,
    Copy,
    Gauge,
    Network,
    Palette,
    Plus,
    RotateCcw,
    SearchX,
    ShieldCheck,
    ShieldX,
    SlidersHorizontal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DetailRow } from "@/components/ui/detail-row";
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
import type { CreateWarrantyTypeForm } from "../../schemas/warranty-type.schema";

import { MachinePagination } from "../MachinePagination";
import { useWarrantyTypes } from "../../hooks/useWarrantyTypes";
import { useCreateWarrantyType } from "../../hooks/useCreateWarrantyType";
import { AddWarrantyTypeDialog } from "./AddWarrantyTypeDialog";
import { ModelAccessoryList } from "@/features/accessory/ModelAccessoryList";

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
    const [warrantyTypeOpen, setWarrantyTypeOpen] =
        useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

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

    const createWarrantyType = useCreateWarrantyType();

    /* ---------------------------------------------------------
       Model Warranties
    --------------------------------------------------------- */

    const warranties = useMemo(
        () => model?.warranties ?? [],
        [model]
    );

    const warrantyTypeFilterOptions = useMemo(() => {
        const typeMap = new Map<string, { code: string; name: string }>();

        warrantyTypes.forEach((type) => {
            typeMap.set(type.warrantyTypeCode, {
                code: type.warrantyTypeCode,
                name: type.warrantyTypeName,
            });
        });

        warranties.forEach((warranty) => {
            if (!typeMap.has(warranty.warrantyTypeCode)) {
                typeMap.set(warranty.warrantyTypeCode, {
                    code: warranty.warrantyTypeCode,
                    name: warranty.warrantyTypeName,
                });
            }
        });

        return Array.from(typeMap.values());
    }, [warranties, warrantyTypes]);

    const selectedWarrantyType = warrantyTypeFilterOptions.find(
        (type) => type.code === warrantyTypeCode
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
    const activeFilterCount = Number(!!warrantyTypeCode) + Number(hasPeriod) + Number(hasPeriodUnit) + Number(ruleType !== "all");

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

    async function handleCreateWarrantyType(
        values: CreateWarrantyTypeForm
    ) {
        const created = await createWarrantyType.mutateAsync(values);
        setWarrantyTypeCode(created.warrantyTypeCode);
        setPage(1);
        setWarrantyTypeOpen(false);
    }

    function handleOpenChange(next: boolean) {
        onOpenChange(next);

        if (!next) {
            setSelectedWarrantyCode(null);
            resetWarrantyFilters();
            setWarrantyTypeOpen(false);
            setFiltersOpen(false);
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
            <DialogContent className={`max-h-[85vh] w-full gap-4 overflow-x-hidden overflow-y-auto ${selectedWarranty ? "!max-w-[480px]" : "!max-w-[740px]"}`}>
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

                        <DialogHeader className="sticky top-0 z-10 -mx-4 -mt-4 gap-1 border-b border-border/60 bg-popover px-4 pt-4 pb-3">
                            <div className="flex items-start justify-between gap-3 pr-6">
                                <div className="min-w-0 space-y-1">
                                    <Badge
                                        variant="outline"
                                        className="font-mono text-xs font-normal"
                                    >
                                        {model.modelCode}
                                    </Badge>
                                    <Badge variant={model.isActive ? "secondary" : "destructive"} className="text-[11px] font-normal">
                                        {model.isActive ? "Active" : "Inactive"}
                                    </Badge>

                                    <DialogTitle className="text-[15px] font-normal">
                                        {model.modelName}
                                    </DialogTitle>

                                    <DialogDescription className="text-xs font-normal">
                                        {machine.machineName}
                                        {" · "}
                                        {machine.machineCode}
                                    </DialogDescription>
                                </div>

                            </div>
                        </DialogHeader>

                        {/* Model Description */}

                        {model.description && (
                            <p className="rounded-lg bg-muted/35 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                                {model.description}
                            </p>
                        )}
                        <div className="grid gap-x-4 border-b border-border/60 pb-2 sm:grid-cols-3">
                            {model.colorType && <DetailRow label="Color Type" icon={<Palette />} value={model.colorType} />}
                            {model.networkType && <DetailRow label="Network Type" icon={<Network />} value={model.networkType} />}
                            <DetailRow label="Registered" icon={<CalendarDays />} value={formatDate(model.createdAt)} />
                        </div>

                        {/* =================================================
                            WARRANTIES
                        ================================================= */}

                        <section className="space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                                <div>
                                    <h3 className="text-sm font-normal">Warranties</h3>
                                    <p className="text-xs font-normal text-muted-foreground">Showing {filteredWarranties.length} of {warranties.length} warranties</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-1">
                                    <Button type="button" variant="outline" size="sm" className="text-xs font-normal" aria-expanded={filtersOpen} aria-controls="warranty-filter-panel" onClick={() => setFiltersOpen((value) => !value)}>
                                        <SlidersHorizontal className="size-3.5" /> Filters
                                        {activeFilterCount > 0 && <Badge variant="secondary" className="px-1.5 text-[10px]">{activeFilterCount}</Badge>}
                                        <ChevronDown className={`size-3.5 transition-transform duration-200 motion-reduce:transition-none ${filtersOpen ? "rotate-180" : ""}`} />
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" className="text-xs font-normal" onClick={() => setWarrantyTypeOpen(true)}><Plus className="size-3.5" /> Add Type</Button>
                                    {activeFilterCount > 0 && <Button type="button" variant="ghost" size="sm" className="text-xs font-normal" onClick={resetWarrantyFilters}><RotateCcw className="size-3.5" /> Reset</Button>}
                                </div>
                            </div>

                            {/* =================================================
                                FILTER PANEL
                            ================================================= */}

                            <div id="warranty-filter-panel" className={`grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none ${filtersOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} aria-hidden={!filtersOpen} inert={!filtersOpen}>
                                <div className="min-h-0 overflow-hidden">
                                <div className="grid gap-2.5 rounded-lg border border-border/70 bg-muted/20 p-3 sm:grid-cols-2">
                                    {/* =================================================
                                        WARRANTY TYPE
                                    ================================================= */}

                                    <div className="space-y-1">
                                        <label className="text-xs font-normal text-muted-foreground">
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
                                            <SelectTrigger className="h-8 w-full px-2 text-xs font-normal">
                                                {selectedWarrantyType ? (
                                                    <span className="text-xs font-normal">{selectedWarrantyType.name}</span>
                                                ) : (
                                                    <SelectValue
                                                        className="text-xs font-normal"
                                                        placeholder={
                                                            isWarrantyTypesLoading
                                                                ? "Loading warranty types..."
                                                                : "Select warranty type"
                                                        }
                                                    />
                                                )}
                                            </SelectTrigger>

                                            <SelectContent>
                                                {warrantyTypeFilterOptions.map(
                                                    (warrantyType) => (
                                                        <SelectItem
                                                            className="text-xs font-normal"
                                                            key={
                                                                warrantyType.code
                                                            }
                                                            value={
                                                                warrantyType.code
                                                            }
                                                        >
                                                            {
                                                                warrantyType.name
                                                            }
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* =================================================
                                        WARRANTY PERIOD GROUP
                                    ================================================= */}

                                    <div className="space-y-1">
                                        <label className="text-xs font-normal text-muted-foreground">
                                            Warranty Period
                                        </label>

                                        <div className="grid grid-cols-2 gap-1.5">
                                            <Input
                                                className="h-8 px-2 text-xs font-normal placeholder:text-xs placeholder:font-normal md:text-xs"
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
                                                <SelectTrigger className="h-8 w-full px-2 text-xs font-normal">
                                                    <SelectValue className="text-xs font-normal" placeholder="Select unit" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem className="text-xs font-normal" value="Days">
                                                        Days
                                                    </SelectItem>

                                                    <SelectItem className="text-xs font-normal" value="Months">
                                                        Months
                                                    </SelectItem>

                                                    <SelectItem className="text-xs font-normal" value="Years">
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

                                    <div className="space-y-1">
                                        <label className="text-xs font-normal text-muted-foreground">
                                            Rule Type
                                        </label>

                                        <Select
                                            value={ruleType}
                                            onValueChange={
                                                handleRuleTypeChange
                                            }
                                        >
                                            <SelectTrigger className="h-8 w-full px-2 text-xs font-normal">
                                                <SelectValue className="text-xs font-normal" placeholder="Select rule type" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem className="text-xs font-normal" value="all">
                                                    All Rules
                                                </SelectItem>

                                                <SelectItem className="text-xs font-normal" value="TimeOnly">
                                                    Time Only
                                                </SelectItem>

                                                <SelectItem className="text-xs font-normal" value="TimeOrCopies">
                                                    Time or Copies
                                                </SelectItem>

                                                <SelectItem className="text-xs font-normal" value="TimeOrHours">
                                                    Time or Hours
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            </div>

                            {/* =================================================
                                NO WARRANTIES
                            ================================================= */}

                            {warranties.length === 0 ? (
                                <div className="rounded-lg bg-muted/35 px-3 py-4 text-center">
                                    <p className="text-xs font-normal">
                                        No warranties added yet
                                    </p>

                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        Add a warranty for this model
                                        to see it listed here.
                                    </p>
                                </div>
                            ) : filteredWarranties.length === 0 ? (
                                /* =================================================
                                   NO MATCHING RESULTS
                                ================================================= */

                                <div className="rounded-lg border border-dashed px-3 py-2.5">
                                    <div className="flex items-start gap-2">
                                        <SearchX className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0 space-y-0.5">
                                            <p className="text-xs font-normal">No matching warranties</p>
                                            <p className="text-[11px] font-normal text-muted-foreground">No warranties match the selected filters.</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 text-xs font-normal"
                                        onClick={resetWarrantyFilters}
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

                                    <div className="space-y-1">
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
                                                    className="group flex w-full min-w-0 items-center justify-between gap-2 rounded-lg bg-muted/25 px-3 py-2 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                                                >
                                                    <div className="flex min-w-0 items-center gap-2.5">
                                                        {warranty.isActive ? (
                                                            <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
                                                        ) : (
                                                            <ShieldX className="size-4 shrink-0 text-muted-foreground" />
                                                        )}

                                                        <div className="min-w-0">
                                                            <p className="truncate text-xs font-normal">
                                                                {
                                                                    warranty.warrantyTypeName
                                                                }
                                                            </p>

                                                            <p className="truncate text-[11px] font-normal text-muted-foreground">
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

                                                            <p className="text-[11px] font-normal text-muted-foreground">
                                                                {ruleTypeLabels[
                                                                    warranty
                                                                        .ruleType
                                                                ] ??
                                                                    warranty.ruleType}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                                                </button>
                                            )
                                        )}
                                    </div>

                                    {/* =================================================
                                        PAGINATION
                                    ================================================= */}

                                    {filteredWarranties.length > pageSize && <div className="pt-1">
                                        <MachinePagination
                                            page={currentPage}
                                            pageSize={pageSize}
                                            totalItems={
                                                filteredWarranties.length
                                            }
                                            itemLabel="warranties"
                                            compact
                                            onPageChange={setPage}
                                            onPageSizeChange={
                                                handlePageSizeChange
                                            }
                                        />
                                    </div>}
                                </>
                            )}
                        </section>
                        <ModelAccessoryList modelCode={model.modelCode} enabled={open} compact />
                    </>
                )}
            </DialogContent>

            <AddWarrantyTypeDialog
                open={warrantyTypeOpen}
                onOpenChange={setWarrantyTypeOpen}
                onSubmit={handleCreateWarrantyType}
            />
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
            <DialogHeader className="gap-1.5 border-b border-border/60 pb-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="-ml-2 h-auto w-fit gap-1 px-2 py-1 text-xs font-normal text-muted-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    Back to {model.modelName}
                </Button>

                <div className="flex items-start gap-2 pr-6">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><ShieldCheck className="size-[15px]" /></span>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <Badge
                                variant="outline"
                                className="h-4.5 px-1.5 py-0 text-[11px] font-normal"
                            >
                                {warranty.warrantyTypeCode}
                            </Badge>

                            <Badge
                                className="h-4.5 px-1.5 py-0 text-[10px] font-normal"
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

                        <DialogTitle className="mt-0.5 text-[13px] font-normal">
                            {warranty.warrantyTypeName}
                        </DialogTitle>

                        <DialogDescription className="mt-0.5 text-[11px] font-normal">
                            {machine.machineName}
                            {" · "}
                            {model.modelName}
                            {" ("}
                            {model.modelCode}
                            {")"}
                        </DialogDescription>
                    </div>

                </div>
            </DialogHeader>
            {warranty.description && (
                <p className="rounded-lg bg-muted/35 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                    {warranty.description}
                </p>
            )}

            <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                    <p className="min-w-28 text-[11px] font-normal text-muted-foreground">
                        Warranty Period
                    </p>

                    <p className="flex items-center gap-2 text-xs font-normal">
                        <Clock className="size-4 text-primary" />

                        {warranty.warrantyPeriod}{" "}
                        {warranty.warrantyPeriodUnit}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                    <p className="min-w-28 text-[11px] font-normal text-muted-foreground">
                        Rule Type
                    </p>

                    <p className="flex items-center gap-2 text-xs font-normal">
                        <ShieldCheck className="size-4 text-primary" />
                        {ruleTypeLabels[warranty.ruleType] ??
                            warranty.ruleType}
                    </p>
                </div>

                {warranty.warrantyCopyLimit != null && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                        <p className="min-w-28 text-[11px] font-normal text-muted-foreground">
                            Copy Limit
                        </p>

                        <p className="flex items-center gap-2 text-xs font-normal">
                            <Copy className="size-4 text-primary" />

                            {warranty.warrantyCopyLimit.toLocaleString()}{" "}
                            copies
                        </p>
                    </div>
                )}

                {warranty.warrantyHourLimit != null && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                        <p className="min-w-28 text-[11px] font-normal text-muted-foreground">
                            Hour Limit
                        </p>

                        <p className="flex items-center gap-2 text-xs font-normal">
                            <Gauge className="size-4 text-primary" />

                            {warranty.warrantyHourLimit.toLocaleString()}{" "}
                            hours
                        </p>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                    <p className="min-w-28 text-[11px] font-normal text-muted-foreground">
                        Registered
                    </p>

                    <p className="flex items-center gap-2 text-xs font-normal">
                        <CalendarDays className="size-4 text-primary" />

                        {formatDate(warranty.createdAt)}
                    </p>
                </div>
            </div>
        </>
    );
}
