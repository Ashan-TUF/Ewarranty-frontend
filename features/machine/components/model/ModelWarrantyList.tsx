"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

import { MachinePagination } from "../MachinePagination";
import { WarrantyCard } from "../warranty/WarrantyCard";
import {
    WarrantyFilters,
    type WarrantyFilterValues,
} from "../warranty/WarrantyFilters";
import { WarrantyResponse } from "../../types/machine";

interface ModelWarrantyListProps {
    machineCode: string;
    modelCode: string;
    warranties: WarrantyResponse[];
}

const INITIAL_FILTERS: WarrantyFilterValues = {
    keyword: "",
    warrantyTypeCode: "",
    warrantyPeriod: "",
    warrantyPeriodUnit: "",
    ruleType: "",
};

export function ModelWarrantyList({
    machineCode,
    modelCode,
    warranties,
}: ModelWarrantyListProps) {
    const [filters, setFilters] =
        useState<WarrantyFilterValues>(INITIAL_FILTERS);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filteredWarranties = useMemo(() => {
        return warranties.filter((warranty) => {
            // Keyword
            if (filters.keyword.trim()) {
                const keyword = filters.keyword
                    .trim()
                    .toLowerCase();

                const searchableText = [
                    warranty.warrantyTypeName,
                    warranty.warrantyTypeCode,
                    warranty.description ?? "",
                    warranty.ruleType,
                    warranty.warrantyPeriodUnit,
                ]
                    .join(" ")
                    .toLowerCase();

                if (!searchableText.includes(keyword)) {
                    return false;
                }
            }

            // Warranty Type
            if (
                filters.warrantyTypeCode &&
                warranty.warrantyTypeCode !==
                filters.warrantyTypeCode
            ) {
                return false;
            }

            // Period + Unit
            const hasPeriod =
                filters.warrantyPeriod !== "";

            const hasPeriodUnit =
                filters.warrantyPeriodUnit !== "";

            if (hasPeriod && hasPeriodUnit) {
                const period = Number(
                    filters.warrantyPeriod
                );

                if (
                    warranty.warrantyPeriod !== period ||
                    warranty.warrantyPeriodUnit !==
                    filters.warrantyPeriodUnit
                ) {
                    return false;
                }
            }

            // Rule Type
            if (
                filters.ruleType &&
                warranty.ruleType !== filters.ruleType
            ) {
                return false;
            }

            return true;
        });
    }, [warranties, filters]);

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

    function handleFiltersChange(
        nextFilters: WarrantyFilterValues
    ) {
        setFilters(nextFilters);
        setPage(1);
    }

    function handleResetFilters() {
        setFilters(INITIAL_FILTERS);
        setPage(1);
    }

    function handlePageSizeChange(
        nextPageSize: number
    ) {
        setPageSize(nextPageSize);
        setPage(1);
    }

    if (warranties.length === 0) {
        return <WarrantyEmptyState />;
    }

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-sm font-semibold">
                    Warranties
                </h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                    {filteredWarranties.length ===
                        warranties.length
                        ? `${warranties.length} warranties`
                        : `${filteredWarranties.length} of ${warranties.length} warranties`}
                </p>
            </div>

            <WarrantyFilters
                filters={filters}
                warranties={warranties}
                onChange={handleFiltersChange}
                onReset={handleResetFilters}
            />

            {filteredWarranties.length === 0 ? (
                <WarrantyNoResults
                    onReset={handleResetFilters}
                />
            ) : (
                <>
                    <div className="grid gap-3">
                        {paginatedWarranties.map(
                            (warranty) => (
                                <WarrantyCard
                                    key={
                                        warranty.warrantyTypeCode
                                    }
                                    machineCode={
                                        machineCode
                                    }
                                    modelCode={
                                        modelCode
                                    }
                                    warranty={warranty}
                                />
                            )
                        )}
                    </div>

                    {filteredWarranties.length >
                        pageSize && (
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
                        )}
                </>
            )}
        </section>
    );
}

function WarrantyEmptyState() {
    return (
        <section className="space-y-3">
            <h2 className="text-sm font-semibold">
                Warranties
            </h2>

            <div className="rounded-xl border border-dashed py-12 text-center">
                <p className="font-medium">
                    No warranties added yet
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                    Add a warranty for this model to see
                    it listed here.
                </p>
            </div>
        </section>
    );
}

interface WarrantyNoResultsProps {
    onReset: () => void;
}

function WarrantyNoResults({
    onReset,
}: WarrantyNoResultsProps) {
    return (
        <div className="rounded-xl border border-dashed py-12 text-center">
            <p className="font-medium">
                No matching warranties
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
                Try changing the selected warranty filters.
            </p>

            <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={onReset}
            >
                Clear Filters
            </Button>
        </div>
    );
}