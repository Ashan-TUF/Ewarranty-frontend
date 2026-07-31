"use client";

import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { WarrantyResponse } from "../../types/machine";

export interface WarrantyFilterValues {
    keyword: string;
    warrantyTypeCode: string;
    warrantyPeriod: string;
    warrantyPeriodUnit: string;
    ruleType: string;
}

interface WarrantyFiltersProps {
    filters: WarrantyFilterValues;
    warranties: WarrantyResponse[];
    onChange: (
        filters: WarrantyFilterValues
    ) => void;
    onReset: () => void;
}

export function WarrantyFilters({
    filters,
    warranties,
    onChange,
    onReset,
}: WarrantyFiltersProps) {
    const warrantyTypes = Array.from(
        new Map(
            warranties.map((warranty) => [
                warranty.warrantyTypeCode,
                {
                    code: warranty.warrantyTypeCode,
                    name: warranty.warrantyTypeName,
                },
            ])
        ).values()
    );

    const selectedWarrantyType = warrantyTypes.find(
        (type) => type.code === filters.warrantyTypeCode
    );

    const updateFilter = (
        field: keyof WarrantyFilterValues,
        value: string
    ) => {
        onChange({
            ...filters,
            [field]: value,
        });
    };

    const hasFilters =
        filters.keyword ||
        filters.warrantyTypeCode ||
        filters.warrantyPeriod ||
        filters.warrantyPeriodUnit ||
        filters.ruleType;

    return (
        <div className="rounded-xl border border-border/70 bg-card/60 p-4">
            <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        value={filters.keyword}
                        onChange={(event) =>
                            updateFilter(
                                "keyword",
                                event.target.value
                            )
                        }
                        placeholder="Search warranty type or description..."
                        className="pl-9"
                    />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    {/* Warranty Type */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Warranty Type
                        </label>

                        <Select
                            value={
                                filters.warrantyTypeCode ||
                                "all"
                            }
                            onValueChange={(value) =>
                                updateFilter(
                                    "warrantyTypeCode",
                                    !value ||
                                        value === "all"
                                        ? ""
                                        : value
                                )
                            }
                        >
                            <SelectTrigger className="w-full">
                                {selectedWarrantyType ? (
                                    <span>{selectedWarrantyType.name}</span>
                                ) : (
                                    <SelectValue placeholder="All warranty types" />
                                )}
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">
                                    All warranty types
                                </SelectItem>

                                {warrantyTypes.map(
                                    (type) => (
                                        <SelectItem
                                            key={type.code}
                                            value={type.code}
                                        >
                                            {type.name}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Warranty Period */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Warranty Period
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                type="number"
                                min={1}
                                value={
                                    filters.warrantyPeriod
                                }
                                onChange={(event) =>
                                    updateFilter(
                                        "warrantyPeriod",
                                        event.target.value
                                    )
                                }
                                placeholder="Period"
                            />

                            <Select
                                value={
                                    filters.warrantyPeriodUnit ||
                                    "none"
                                }
                                onValueChange={(value) =>
                                    updateFilter(
                                        "warrantyPeriodUnit",
                                        !value ||
                                            value ===
                                            "none"
                                            ? ""
                                            : value
                                    )
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Unit" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="none">
                                        Unit
                                    </SelectItem>

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

                        {Boolean(filters.warrantyPeriod) !==
                            Boolean(filters.warrantyPeriodUnit) && (
                                <p className="text-xs text-destructive">
                                    Warranty period and unit must be selected together.
                                </p>
                            )}
                    </div>

                    {/* Rule Type */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Rule Type
                        </label>

                        <Select
                            value={
                                filters.ruleType || "all"
                            }
                            onValueChange={(value) =>
                                updateFilter(
                                    "ruleType",
                                    !value ||
                                        value === "all"
                                        ? ""
                                        : value
                                )
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All rule types" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">
                                    All rule types
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

                {hasFilters && (
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                        >
                            <RotateCcw className="size-4" />
                            Reset Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}