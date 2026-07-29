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
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">
                    {machine.machineName}
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                    {machine.description || "No description available"}
                </p>
            </CardHeader>

            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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