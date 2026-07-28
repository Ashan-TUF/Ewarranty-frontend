"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Boxes,
    CalendarDays,
    Factory,
    Search,
    ShieldCheck,
} from "lucide-react";

import AppHeader from "@/components/layout/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";

import { demoMachines, type DemoModel } from "../data/demo-machines";
import { AddModelDialog } from "../components/AddModelDialog";
import { MachinePagination } from "../components/MachinePagination";
import { ModelDetailsDialog } from "../components/ModelDetailsDialog";
import type { CreateMachineModelForm } from "../schemas/machine-model.schema";
import { AddWarrantyDialog } from "../components/AddWarrantyDialog";

function formatDate(dateValue: string) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(dateValue));
}

interface MachineDetailsPageProps {
    machineCode: string;
}

export default function MachineDetailsPage({
    machineCode,
}: MachineDetailsPageProps) {
    const machine = demoMachines.find((m) => m.machineCode === machineCode);

    // Local demo state so "Add Model" visibly appends a card — swap this
    // for a react-query list once the models are fetched from the API.
    const [extraModels, setExtraModels] = useState<DemoModel[]>([]);
    const [modelKeyword, setModelKeyword] = useState("");
    const [modelPage, setModelPage] = useState(1);
    const [modelPageSize, setModelPageSize] = useState(10);

    // Selected model for the "View details" popup — replaces the old
    // navigation to a separate model-details page.
    const [selectedModel, setSelectedModel] = useState<DemoModel | null>(null);
    const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);

    function handleViewModel(model: DemoModel) {
        setSelectedModel(model);
        setIsModelDialogOpen(true);
    }

    if (!machine) {
        return (
            <>
                <AppHeader title="Machine not found" />
                <main className="p-6">
                    <div className="rounded-xl border border-dashed py-16 text-center">
                        <p className="font-medium">
                            No machine found with code{" "}
                            <span className="font-mono">{machineCode}</span>
                        </p>
                        <Link
                            href={ROUTES.MACHINES}
                            className="mt-3 inline-block text-sm text-primary hover:underline"
                        >
                            Back to machines
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    const allModels = [...machine.models, ...extraModels];

    const visibleModels = useMemo(() => {
        const keyword = modelKeyword.trim().toLowerCase();
        if (!keyword) return allModels;

        return allModels.filter((model) =>
            `${model.modelName} ${model.modelCode}`.toLowerCase().includes(keyword)
        );
    }, [allModels, modelKeyword]);

    const modelTotalPages = Math.max(
        1,
        Math.ceil(visibleModels.length / modelPageSize)
    );
    const currentModelPage = Math.min(modelPage, modelTotalPages);

    const paginatedModels = useMemo(() => {
        const start = (currentModelPage - 1) * modelPageSize;
        return visibleModels.slice(start, start + modelPageSize);
    }, [visibleModels, currentModelPage, modelPageSize]);

    function handleModelKeywordChange(value: string) {
        setModelKeyword(value);
        setModelPage(1);
    }

    function handleModelPageSizeChange(next: number) {
        setModelPageSize(next);
        setModelPage(1);
    }

    function handleAddModel(values: CreateMachineModelForm) {
        setExtraModels((prev) => [
            ...prev,
            {
                modelCode: `MM${String(Date.now()).slice(-6)}`,
                modelName: values.modelName,
                description: values.description || undefined,
                colorType: values.colorType as DemoModel["colorType"],
                networkType: values.networkType as DemoModel["networkType"],
                warranties: [],
            },
        ]);
    }

    return (
        <>
            <AppHeader
                title={machine.machineName}
                description={`Machine details, models, and warranties for ${machine.machineCode}.`}
                actions={<AddModelDialog machineCode={machine.machineCode} onAdd={handleAddModel} />}
            />

            <main className="space-y-6 p-6">
                <Link
                    href={ROUTES.MACHINES}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to machines
                </Link>

                <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono text-[11px]">
                                        {machine.machineCode}
                                    </Badge>
                                    <Badge variant={machine.isActive ? "secondary" : "destructive"}>
                                        {machine.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <CardTitle className="mt-1.5 text-xl">
                                    {machine.machineName}
                                </CardTitle>
                                <CardDescription className="mt-1 flex items-center gap-2">
                                    <Factory className="size-4" />
                                    {machine.manufacturer}
                                </CardDescription>
                            </div>

                            <Badge variant="secondary">{machine.category}</Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {machine.description && (
                            <p className="text-sm text-muted-foreground">
                                {machine.description}
                            </p>
                        )}

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl bg-muted/40 p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Models
                                </p>
                                <p className="mt-1 flex items-center gap-2 font-medium">
                                    <Boxes className="size-4 text-primary" />
                                    {allModels.length}
                                </p>
                            </div>

                            <div className="rounded-xl bg-muted/40 p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Registered
                                </p>
                                <p className="mt-1 flex items-center gap-2 font-medium">
                                    <CalendarDays className="size-4 text-primary" />
                                    {formatDate(machine.createdAt)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <section className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-sm font-semibold text-muted-foreground">
                            Models ({visibleModels.length}
                            {modelKeyword && ` of ${allModels.length}`})
                        </h2>

                        <div className="relative sm:w-72">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search models by name or code..."
                                className="pl-8"
                                value={modelKeyword}
                                onChange={(e) => handleModelKeywordChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {visibleModels.length === 0 ? (
                        <div className="rounded-xl border border-dashed py-12 text-center">
                            <p className="font-medium">
                                {allModels.length === 0
                                    ? "No models registered yet"
                                    : "No models match your search"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {allModels.length === 0
                                    ? 'Use "Add Model" to register the first model for this machine.'
                                    : "Try a different model name or code."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 lg:grid-cols-2">
                                {paginatedModels.map((model) => (
                                    <Card key={model.modelCode} className="border-border/70">
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <Badge
                                                        variant="outline"
                                                        className="font-mono text-[11px]"
                                                    >
                                                        {model.modelCode}
                                                    </Badge>
                                                    <CardTitle className="mt-1.5 text-base">
                                                        {model.modelName}
                                                    </CardTitle>
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
                                        </CardHeader>

                                        <CardContent className="space-y-3">
                                            {model.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {model.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
                                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <ShieldCheck className="size-4 text-primary" />
                                                    {model.warranties.length}{" "}
                                                    {model.warranties.length === 1
                                                        ? "warranty"
                                                        : "warranties"}{" "}
                                                    registered
                                                </span>
                                            </div>

                                            <div className="flex justify-end gap-2">
                                                <AddWarrantyDialog
    machineCode={machine.machineCode}
    modelCode={model.modelCode}
/>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewModel(model)}
                                                >
                                                    View details
                                                    <ArrowRight className="size-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {visibleModels.length > modelPageSize && (
                                <MachinePagination
                                    page={currentModelPage}
                                    pageSize={modelPageSize}
                                    totalItems={visibleModels.length}
                                    onPageChange={setModelPage}
                                    onPageSizeChange={handleModelPageSizeChange}
                                />
                            )}
                        </>
                    )}
                </section>
            </main>

            <ModelDetailsDialog
                machine={machine}
                model={selectedModel}
                open={isModelDialogOpen}
                onOpenChange={setIsModelDialogOpen}
            />
        </>
    );
}