"use client";

import { ListFilter, RotateCcw, Search } from "lucide-react";

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

import type { InstallationReportSearchRequest } from "../types/installation-report";

export const installationReportDefaultFilters: InstallationReportSearchRequest = {
    id: undefined,
    keyword: "",
    status: "",
    fromDate: "",
    toDate: "",
    sortBy: "CreatedAt",
    sortOrder: "desc",
};

interface InstallationReportFiltersProps {
    values: InstallationReportSearchRequest;
    isExpanded: boolean;
    onExpandToggle: () => void;
    onChange: (next: InstallationReportSearchRequest) => void;
    onApply: () => void;
    onReset: () => void;
}

export function InstallationReportFilters({
    values,
    isExpanded,
    onExpandToggle,
    onChange,
    onApply,
    onReset,
}: InstallationReportFiltersProps) {
    const activeAdvancedCount = [
        values.id != null,
        Boolean(values.status),
        Boolean(values.fromDate),
        Boolean(values.toDate),
        values.sortBy !== "CreatedAt",
        values.sortOrder !== "desc",
    ].filter(Boolean).length;

    const hasFilters =
        Boolean(values.keyword?.trim()) ||
        activeAdvancedCount > 0;

    return (
        <section className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={values.keyword ?? ""}
                        onChange={(event) =>
                            onChange({
                                ...values,
                                keyword: event.target.value,
                            })
                        }
                        placeholder="Search customer, machine model, city, phone or serial number..."
                        className="pl-8"
                    />
                </div>

                <Button type="button" variant="outline" size="sm" onClick={onExpandToggle} className="shrink-0">
                    <ListFilter className="size-4" />
                    Filters
                    {activeAdvancedCount > 0 && (
                        <Badge variant="secondary" className="ml-1 h-4.5 px-1.5">
                            {activeAdvancedCount}
                        </Badge>
                    )}
                </Button>

                {hasFilters && (
                    <Button type="button" variant="ghost" size="sm" onClick={onReset} className="shrink-0 text-muted-foreground">
                        <RotateCcw className="size-3.5" />
                        Reset
                    </Button>
                )}
            </div>

            <div
                className={cn(
                    "grid overflow-hidden transition-all duration-200 ease-out",
                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="min-h-0">
                    <div className="rounded-xl border bg-card/50 p-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Installation ID</label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={values.id ?? ""}
                                    onChange={(event) =>
                                        onChange({
                                            ...values,
                                            id: event.target.value ? Number(event.target.value) : undefined,
                                        })
                                    }
                                    placeholder="e.g. 15"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Status</label>
                                <Select
                                    value={values.status || "all"}
                                    onValueChange={(value) =>
                                        onChange({
                                            ...values,
                                            status: !value || value === "all" ? "" : value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">From Date</label>
                                <Input
                                    type="date"
                                    value={values.fromDate ?? ""}
                                    onChange={(event) =>
                                        onChange({
                                            ...values,
                                            fromDate: event.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">To Date</label>
                                <Input
                                    type="date"
                                    value={values.toDate ?? ""}
                                    onChange={(event) =>
                                        onChange({
                                            ...values,
                                            toDate: event.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Sort By</label>
                                <Select
                                    value={values.sortBy ?? "CreatedAt"}
                                    onValueChange={(value) =>
                                        onChange({
                                            ...values,
                                            sortBy: value || "CreatedAt",
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="CreatedAt" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CreatedAt">Created At</SelectItem>
                                        <SelectItem value="InstallationDate">Installation Date</SelectItem>
                                        <SelectItem value="CustomerName">Customer Name</SelectItem>
                                        <SelectItem value="City">City</SelectItem>
                                        <SelectItem value="Status">Status</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Sort Order</label>
                                <Select
                                    value={values.sortOrder ?? "desc"}
                                    onValueChange={(value) =>
                                        onChange({
                                            ...values,
                                            sortOrder: value === "asc" ? "asc" : "desc",
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Descending" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desc">Descending</SelectItem>
                                        <SelectItem value="asc">Ascending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={onReset}>
                                Clear
                            </Button>
                            <Button type="button" size="sm" onClick={onApply}>
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
