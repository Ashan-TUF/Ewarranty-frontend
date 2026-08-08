"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ConfirmInstallationDialogProps {
    open: boolean;
    reportId: number | null;
    customerName?: string;
    defaultInvoiceNumber?: string;
    isSubmitting?: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (invoiceNumber?: string) => Promise<void>;
}

export function ConfirmInstallationDialog({
    open,
    reportId,
    customerName,
    defaultInvoiceNumber,
    isSubmitting = false,
    onOpenChange,
    onSubmit,
}: ConfirmInstallationDialogProps) {
    const [invoiceNumber, setInvoiceNumber] = useState(() => defaultInvoiceNumber ?? "");

    async function handleSubmit() {
        const normalized = invoiceNumber.trim();

        await onSubmit(normalized || undefined);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Installation Report</DialogTitle>
                    <DialogDescription>
                        Add or update invoice number for report ID {reportId ?? "-"}
                        {customerName ? ` (${customerName})` : ""}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium" htmlFor="invoiceNumber">
                        Invoice Number
                        <span className="ml-1 text-muted-foreground">(optional)</span>
                    </label>

                    <Input
                        id="invoiceNumber"
                        value={invoiceNumber}
                        onChange={(event) => setInvoiceNumber(event.target.value)}
                        placeholder="e.g. INV-2025-001"
                    />
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Confirming..." : "Confirm Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
