"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import AppHeader from "@/components/layout/AppHeader";
import { ROUTES } from "@/constants/routes";

import {
    AddWarrantyDialog,
    ModelSummaryCard,
    ModelWarrantyList,
    PageState,
} from "@/features/machine/components";
import { useMachine } from "@/features/machine/hooks";

interface ModelDetailsPageProps {
    machineCode: string;
    modelCode: string;
}

export default function ModelDetailsPage({
    machineCode,
    modelCode,
}: ModelDetailsPageProps) {
    const [isAddWarrantyOpen, setIsAddWarrantyOpen] =
        useState(false);

    const {
        data: machine,
        isLoading,
        isError,
    } = useMachine(machineCode);

    if (isLoading) {
        return (
            <>
                <AppHeader title="Loading..." />
                <main className="p-4 sm:p-6">
                    <PageState
                        title="Loading model details..."
                        description="Fetching related machine information."
                    />
                </main>
            </>
        );
    }

    if (isError || !machine) {
        return (
            <ModelNotFound
                machineCode={machineCode}
                modelCode={modelCode}
            />
        );
    }

    const model = machine.models.find(
        (m) => m.modelCode === modelCode
    );

    if (!model) {
        return (
            <ModelNotFound
                machineCode={machineCode}
                modelCode={modelCode}
            />
        );
    }

    return (
        <>
            <AppHeader
                title={model.modelName}
                description={`Model details and warranties for ${model.modelCode}.`}
            />

            <main className="space-y-6 p-4 sm:p-6">
                <Link
                    href={ROUTES.MACHINE_DETAILS(machineCode)}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to {machine.machineName}
                </Link>

                <ModelSummaryCard
                    machine={machine}
                    model={model}
                    onAddWarranty={() =>
                        setIsAddWarrantyOpen(true)
                    }
                />

                <ModelWarrantyList
                    machineCode={machine.machineCode}
                    modelCode={model.modelCode}
                    warranties={model.warranties}
                />
            </main>

            <AddWarrantyDialog
                machineCode={machine.machineCode}
                modelCode={model.modelCode}
                open={isAddWarrantyOpen}
                onOpenChange={setIsAddWarrantyOpen}
            />
        </>
    );
}

interface ModelNotFoundProps {
    machineCode: string;
    modelCode: string;
}

function ModelNotFound({
    machineCode,
    modelCode,
}: ModelNotFoundProps) {
    return (
        <>
            <AppHeader
                title="Model not found"
                description="The requested machine model could not be found."
            />

            <main className="p-6">
                <PageState
                    title={`No model found with code ${modelCode}`}
                    actionLabel="Back to machine"
                    actionHref={ROUTES.MACHINE_DETAILS(machineCode)}
                />
            </main>
        </>
    );
}