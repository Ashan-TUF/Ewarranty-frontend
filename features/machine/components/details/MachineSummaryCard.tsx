"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { MachineStat } from "./MachineStat";

import type { MachineResponse } from "../../types/machine";

interface MachineSummaryCardProps {
    machine: MachineResponse;
    totalModels: number;
}

export function MachineSummaryCard({
    machine,
    totalModels,
}: MachineSummaryCardProps) {
    return (
        <Card size="sm" className="gap-2 py-2.5">
            <CardHeader className="gap-0.5">
                <CardTitle className="text-sm font-normal">
                    {machine.machineName}
                </CardTitle>

                <p className="text-xs font-normal text-muted-foreground">
                    {machine.description || "No description available"}
                </p>
            </CardHeader>

            <CardContent>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                    <MachineStat
                        label="Machine Code"
                        value={machine.machineCode}
                    />

                    <MachineStat
                        label="Status"
                        value={
                            machine.isActive
                                ? "Active"
                                : "Inactive"
                        }
                    />

                    <MachineStat
                        label="Total Models"
                        value={totalModels.toString()}
                    />

                    <MachineStat
                        label="Created Date"
                        value={
                            machine.createdAt
                                ? new Date(
                                    machine.createdAt
                                ).toLocaleDateString()
                                : "-"
                        }
                    />
                </div>
            </CardContent>
        </Card>
    );
}
