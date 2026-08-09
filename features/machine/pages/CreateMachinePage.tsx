"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import AppHeader from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-url";
import { MachineForm } from "@/features/machine/components";

export default function CreateMachinePage() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    function handleTemplateDownload() {
        const link = document.createElement("a");
        link.href = "/machine_bulk_upload_template.xlsx";
        link.download = "machine_bulk_upload_template.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function handlePickFile() {
        if (isUploading) {
            return;
        }

        fileInputRef.current?.click();
    }

    async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const isExcelFile =
            file.name.toLowerCase().endsWith(".xlsx") ||
            file.name.toLowerCase().endsWith(".xls");

        if (!isExcelFile) {
            toast.error("Please select an Excel file (.xlsx or .xls).");
            event.target.value = "";
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(apiUrl("/machine-imports"), {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                let message = "Machine bulk upload failed.";

                try {
                    const payload = (await response.json()) as { message?: string };
                    if (payload.message) {
                        message = payload.message;
                    }
                } catch {
                    // Keep fallback message if error response is not JSON.
                }

                throw new Error(message);
            }

            toast.success("Machine bulk upload completed successfully.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Machine bulk upload failed.");
        } finally {
            setIsUploading(false);
            event.target.value = "";
        }
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
                            onChange={handleUploadFile}
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
                            onClick={handlePickFile}
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
        </>
    );
}