"use client";

import { Download, Loader2, Upload } from "lucide-react";

import AppHeader from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { MachineForm } from "@/features/machine/components";
import { MachineImportReportDialog } from "@/features/machine/components/MachineImportReportDialog";
import { MachineImportSuccessDialog } from "@/features/machine/components/MachineImportSuccessDialog";
import { useMachineImport } from "@/features/machine/hooks/useMachineImport";

export default function CreateMachinePage() {
    const { fileInputRef, isUploading, report, successResult, closeReport, closeSuccess, pickFile, uploadFile } = useMachineImport();

    function handleTemplateDownload() {
        const link = document.createElement("a");
        link.href = "/machine_bulk_upload_template.xlsx";
        link.download = "machine_bulk_upload_template.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <>
            <AppHeader
                title="Machine Management"
                description="Register a new machine."
                actions={
                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            className="hidden"
                            onChange={uploadFile}
                        />

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleTemplateDownload}
                        >
                            <Download className="size-4" />
                            Download Template
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            onClick={pickFile}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Upload className="size-4" />
                            )}
                            Upload Excel
                        </Button>
                    </div>
                }
            />

            <main className="p-4 sm:p-6">
                <MachineForm />
            </main>
            <MachineImportReportDialog report={report} onClose={closeReport} />
            <MachineImportSuccessDialog result={successResult} onClose={closeSuccess} />
        </>
    );
}
