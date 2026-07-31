"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

import AppHeader from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

import {
    AddModelDialog,
    AddWarrantyDialog,
    AddWarrantyTypeDialog,
    MachineModelsSection,
    MachineSummaryCard,
    ModelDetailsDialog,
    PageState,
} from "@/features/machine/components";
import {
    useCreateWarrantyType,
    useMachine,
    useMachineDialogs,
    useMachineModels,
} from "@/features/machine/hooks";

interface MachineDetailsPageProps {
    machineCode: string;
}

export default function MachineDetailsPage({
    machineCode,
}: MachineDetailsPageProps) {
    const [isAddWarrantyTypeOpen, setIsAddWarrantyTypeOpen] =
        useState(false);

    const createWarrantyType = useCreateWarrantyType();

    const {
        data: machine,
        isLoading,
        isError,
    } = useMachine(machineCode);

    const {
        selectedModel,
        isModelDialogOpen,

        warrantyModel,
        isWarrantyDialogOpen,

        openModelDetails,
        openAddWarranty,

        handleModelDialogOpenChange,
        handleWarrantyDialogOpenChange,
    } = useMachineDialogs();

    const {
        keyword,
        pageSize,
        filteredModels,
        paginatedModels,
        currentPage,
        setPage,
        handleKeywordChange,
        handlePageSizeChange,
    } = useMachineModels({
        models: machine?.models ?? [],
    });

    if (isLoading) {
        return (
            <>
                <AppHeader title="Loading machine..." />

                <main className="p-4 sm:p-6">
                    <PageState
                        title="Loading machine details..."
                        description="Fetching machine models and warranties."
                    />
                </main>
            </>
        );
    }

    if (isError) {
        return (
            <>
                <AppHeader title="Failed to load machine" />

                <main className="p-4 sm:p-6">
                    <PageState
                        title="Failed to load machine details"
                        description="Please refresh and try again."
                    />
                </main>
            </>
        );
    }

    if (!machine) {
        return (
            <>
                <AppHeader title="Machine not found" />

                <main className="p-4 sm:p-6">
                    <PageState
                        title={`No machine found with code ${machineCode}`}
                        actionLabel="Back to machines"
                        actionHref={ROUTES.MACHINES}
                    />
                </main>
            </>
        );
    }
    return (
        <>
            <AppHeader
                title={machine.machineName}
                description={`Machine details, models, and warranties for ${machine.machineCode}.`}
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setIsAddWarrantyTypeOpen(true)
                            }
                        >
                            <Plus className="size-4" />
                            Add Warranty Type
                        </Button>

                        <AddModelDialog
                            machineCode={machine.machineCode}
                        />
                    </div>
                }
            />

            <main className="space-y-6 p-4 sm:p-6">

                <Link
                    href={ROUTES.MACHINES}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to machines
                </Link>
                <MachineSummaryCard
                    machine={machine}
                    totalModels={machine.models.length}
                />

                <MachineModelsSection
                    machine={machine}
                    models={paginatedModels}
                    totalModels={machine.models.length}
                    filteredModelsCount={filteredModels.length}
                    keyword={keyword}
                    page={currentPage}
                    pageSize={pageSize}
                    onKeywordChange={handleKeywordChange}
                    onPageChange={setPage}
                    onPageSizeChange={handlePageSizeChange}
                    onViewDetails={openModelDetails}
                    onAddWarranty={openAddWarranty}
                />
            </main>

            <ModelDetailsDialog
                machine={machine}
                model={selectedModel}
                open={isModelDialogOpen}
                onOpenChange={
                    handleModelDialogOpenChange
                }
            />

            {warrantyModel && (
                <AddWarrantyDialog
                    machineCode={
                        machine.machineCode
                    }
                    modelCode={
                        warrantyModel.modelCode
                    }
                    open={
                        isWarrantyDialogOpen
                    }
                    onOpenChange={
                        handleWarrantyDialogOpenChange
                    }
                />
            )}

            <AddWarrantyTypeDialog
                open={isAddWarrantyTypeOpen}
                onOpenChange={setIsAddWarrantyTypeOpen}
                onSubmit={async (values) => {
                    await createWarrantyType.mutateAsync(values);
                }}
            />
        </>
    );
}