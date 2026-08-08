"use client";

import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import type { InstallationReport } from "../types/installation-report";

interface InstallationReportsTableProps {
    reports: InstallationReport[];
    onConfirmClick: (report: InstallationReport) => void;
}

function formatDate(dateValue: string) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(dateValue));
}

export function InstallationReportsTable({
    reports,
    onConfirmClick,
}: InstallationReportsTableProps) {
    return (
        <div className="rounded-xl border bg-card/60">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Machine</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Installed By</TableHead>
                        <TableHead>Installation Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Invoice</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {reports.map((report) => (
                        <TableRow key={report.id}>
                            <TableCell className="font-medium">{report.id}</TableCell>
                            <TableCell>
                                <div className="space-y-0.5">
                                    <p className="max-w-52 truncate font-medium">{report.customerName}</p>
                                    <p className="text-xs text-muted-foreground">{report.customerCode}</p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-0.5">
                                    <p className="max-w-44 truncate font-medium">{report.machineModel}</p>
                                    <p className="max-w-44 truncate text-xs text-muted-foreground">{report.machineDescription || "-"}</p>
                                </div>
                            </TableCell>
                            <TableCell>{report.city || "-"}</TableCell>
                            <TableCell>{report.installedBy || "-"}</TableCell>
                            <TableCell>{formatDate(report.installationDate)}</TableCell>
                            <TableCell>
                                <Badge variant={report.installationStatus === "Confirmed" ? "secondary" : "outline"}>
                                    {report.installationStatus}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {report.invoiceNumber?.trim() ? report.invoiceNumber : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onConfirmClick(report)}
                                >
                                    <CheckCircle2 className="size-4" />
                                    Confirm
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
