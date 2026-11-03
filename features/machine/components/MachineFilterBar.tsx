"use client";

import { useState } from "react";
import { ChevronDown, ListFilter, RotateCcw, Search, X } from "lucide-react";

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
import { cn } from "@/lib/utils";

export interface MachineFilterValues {
    keyword: string;
    machineCode: string;
    modelCode: string;
    warrantyTypeCode: string;
    warrantyPeriod: string;
    warrantyPeriodUnit: string;
    ruleType: string;
}

export const emptyFilters: MachineFilterValues = {
    keyword: "",
    machineCode: "",
    modelCode: "",
    warrantyTypeCode: "",
    warrantyPeriod: "",
    warrantyPeriodUnit: "",
    ruleType: "",
};

interface MachineFilterBarProps {
    values: MachineFilterValues;
    onChange: (values: MachineFilterValues) => void;
}

const advancedFilterKeys: (keyof MachineFilterValues)[] = [
    "machineCode",
    "modelCode",
    "warrantyTypeCode",
    "warrantyPeriod",
    "warrantyPeriodUnit",
    "ruleType",
];

export function MachineFilterBar({ values, onChange }: MachineFilterBarProps) {
    const [draft, setDraft] = useState<MachineFilterValues>(values);
    const [isExpanded, setIsExpanded] = useState(false);

    const activeAdvancedCount = advancedFilterKeys.filter(
        (key) => values[key] !== ""
    ).length;

    function updateDraft<K extends keyof MachineFilterValues>(
        key: K,
        value: MachineFilterValues[K]
    ) {
        setDraft((prev) => ({ ...prev, [key]: value }));
    }

    function applyFilters() {
        onChange(draft);
    }

    function resetFilters() {
        setDraft(emptyFilters);
        onChange(emptyFilters);
    }

    function handleKeywordChange(keyword: string) {
        const next = { ...draft, keyword };
        setDraft(next);
        onChange(next);
    }

    return (
        <div className="space-y-2.5">
            <div className="flex flex-wrap gap-2 sm:items-center">
                <div className="relative w-full min-w-0 sm:max-w-[380px] sm:flex-1">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by machine name, manufacturer, or code..."
                        aria-label="Search machines"
                        className="h-9 pl-8 text-xs font-normal"
                        value={draft.keyword}
                        onChange={(e) => handleKeywordChange(e.target.value)}
                    />
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="h-9 shrink-0 px-2.5 text-xs font-normal"
                    aria-expanded={isExpanded}
                    aria-controls="machine-advanced-filters"
                >
                    <ListFilter className="size-4" />
                    Filters
                    {activeAdvancedCount > 0 && (
                        <Badge className="ml-1 h-4 px-1 text-[10px] font-normal" variant="secondary">
                            {activeAdvancedCount}
                        </Badge>
                    )}
                    <ChevronDown className={cn("size-3.5 transition-transform duration-200 motion-reduce:transition-none", isExpanded && "rotate-180")} />
                </Button>

                {(values.keyword || activeAdvancedCount > 0) && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="h-9 shrink-0 text-xs font-normal text-muted-foreground"
                    >
                        <RotateCcw className="size-3.5" />
                        Reset
                    </Button>
                )}
            </div>

            <div
                id="machine-advanced-filters"
                aria-hidden={!isExpanded}
                inert={!isExpanded}
                className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="min-h-0 overflow-hidden">
                    <div className="rounded-xl border border-border/70 bg-card p-3">
                        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-normal text-muted-foreground">
                                    Machine Code
                                </label>
                                <Input
                                    placeholder="e.g. MC000001"
                                    value={draft.machineCode}
                                    onChange={(e) => updateDraft("machineCode", e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-normal text-muted-foreground">
                                    Model Code
                                </label>
                                <Input
                                    placeholder="e.g. MM000001"
                                    value={draft.modelCode}
                                    onChange={(e) => updateDraft("modelCode", e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-normal text-muted-foreground">
                                    Warranty Type Code
                                </label>
                                <Input
                                    placeholder="e.g. WT000001"
                                    value={draft.warrantyTypeCode}
                                    onChange={(e) =>
                                        updateDraft("warrantyTypeCode", e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-normal text-muted-foreground">
                                    Warranty Period
                                </label>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="e.g. 12"
                                    value={draft.warrantyPeriod}
                                    onChange={(e) =>
                                        updateDraft("warrantyPeriod", e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-normal text-muted-foreground">
                                    Warranty Period Unit
                                </label>
                                <Select
                                    value={draft.warrantyPeriodUnit || undefined}
                                    onValueChange={(v) =>
                                        updateDraft("warrantyPeriodUnit", v ?? "")
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Any unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Days">Days</SelectItem>
                                        <SelectItem value="Months">Months</SelectItem>
                                        <SelectItem value="Years">Years</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-normal text-muted-foreground">
                                    Rule Type
                                </label>
                                <Select
                                    value={draft.ruleType || undefined}
                                    onValueChange={(v) => updateDraft("ruleType", v ?? "")}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Any rule type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TimeOnly">Time Only</SelectItem>
                                        <SelectItem value="TimeOrCopies">Time or Copies</SelectItem>
                                        <SelectItem value="TimeOrHours">
                                            Time or Hours
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-2 border-t pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setDraft(emptyFilters)}
                            >
                                <X className="size-3.5" />
                                Clear
                            </Button>
                            <Button type="button" size="sm" onClick={applyFilters}>
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
