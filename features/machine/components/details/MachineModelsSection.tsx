"use client";

import { useMemo } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import { MachinePagination } from "../MachinePagination";
import { ModelSummaryCard } from "../model/ModelSummaryCard";
import { ModelEmptyState } from "./ModelEmptyState";

import type {
    MachineResponse,
    MachineModelResponse,
} from "../../types/machine";

interface MachineModelsSectionProps {
    machine: MachineResponse;
    models: MachineModelResponse[];

    keyword: string;
    page: number;
    pageSize: number;

    onKeywordChange: (value: string) => void;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;

    onViewDetails?: (model: MachineModelResponse) => void;
    onAddWarranty?: (model: MachineModelResponse) => void;
}

export function MachineModelsSection({
    machine,
    models,

    keyword,
    page,
    pageSize,

    onKeywordChange,
    onPageChange,
    onPageSizeChange,

    onViewDetails,
    onAddWarranty,
}: MachineModelsSectionProps) {

    const filteredModels = useMemo(() => {

        const search = keyword.trim().toLowerCase();

        if (!search) {
            return models;
        }

        return models.filter((model) => {

            const searchable = [
                model.modelCode,
                model.modelName,
                model.description ?? "",
                model.colorType ?? "",
                model.networkType ?? "",
            ]
                .join(" ")
                .toLowerCase();

            return searchable.includes(search);
        });

    }, [models, keyword]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredModels.length / pageSize)
    );

    const currentPage = Math.min(
        page,
        totalPages
    );

    const paginatedModels = useMemo(() => {

        const start =
            (currentPage - 1) * pageSize;

        return filteredModels.slice(
            start,
            start + pageSize
        );

    }, [
        filteredModels,
        currentPage,
        pageSize,
    ]);

    return (
        <section className="space-y-4">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <h2 className="text-sm font-semibold">
                        Models
                    </h2>

                    <p className="text-xs text-muted-foreground">

                        {keyword
                            ? `${filteredModels.length} of ${models.length} models`
                            : `${models.length} models`}

                    </p>

                </div>

                <div className="relative sm:w-72">

                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        value={keyword}
                        placeholder="Search models..."
                        className="pl-8"
                        onChange={(event) =>
                            onKeywordChange(
                                event.target.value
                            )
                        }
                    />

                </div>

            </div>
            {filteredModels.length === 0 ? (
                <ModelEmptyState
                    hasModels={models.length > 0}
                />
            ) : (
                <>
                    <div className="grid gap-4 lg:grid-cols-2">
                        {paginatedModels.map((model) => (
                            <ModelSummaryCard
                                key={model.modelCode}
                                machine={machine}
                                model={model}
                                onViewDetails={
                                    onViewDetails
                                }
                                onAddWarranty={
                                    onAddWarranty
                                }
                            />
                        ))}
                    </div>

                    <MachinePagination
                        page={currentPage}
                        pageSize={pageSize}
                        totalItems={filteredModels.length}
                        onPageChange={onPageChange}
                        onPageSizeChange={
                            onPageSizeChange
                        }
                    />
                </>
            )}
        </section>
    );
}
