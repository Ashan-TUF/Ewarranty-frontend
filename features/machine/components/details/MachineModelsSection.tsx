"use client";

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
    totalModels: number;
    filteredModelsCount: number;

    keyword: string;
    page: number;
    pageSize: number;

    onKeywordChange: (value: string) => void;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;

    onViewDetails?: (model: MachineModelResponse) => void;
    onAddWarranty?: (model: MachineModelResponse) => void;
    onAddAccessory?: (model: MachineModelResponse) => void;
}

export function MachineModelsSection({
    machine,
    models,
    totalModels,
    filteredModelsCount,

    keyword,
    page,
    pageSize,

    onKeywordChange,
    onPageChange,
    onPageSizeChange,

    onViewDetails,
    onAddWarranty,
    onAddAccessory,
}: MachineModelsSectionProps) {
    return (
        <section className="space-y-3">

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <h2 className="text-[13px] font-normal">
                        Models
                    </h2>

                    <p className="text-[11px] font-normal text-muted-foreground">

                        {keyword
                            ? `${filteredModelsCount} of ${totalModels} models`
                            : `${totalModels} models`}

                    </p>

                </div>

                <div className="relative sm:w-72">

                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        value={keyword}
                        placeholder="Search models..."
                        className="pl-8 text-xs font-normal placeholder:text-xs"
                        onChange={(event) =>
                            onKeywordChange(
                                event.target.value
                            )
                        }
                    />

                </div>

            </div>
            {filteredModelsCount === 0 ? (
                <ModelEmptyState
                    hasModels={totalModels > 0}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {models.map((model) => (
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
                                onAddAccessory={onAddAccessory}
                            />
                        ))}
                    </div>

                    <MachinePagination
                        page={page}
                        pageSize={pageSize}
                        totalItems={filteredModelsCount}
                        itemLabel="models"
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
