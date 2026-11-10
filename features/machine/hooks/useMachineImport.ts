"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { importMachines, type MachineImportReport } from "../services/machine-import.service";

export function useMachineImport() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadingRef = useRef(false);
  const [isUploading, setIsUploading] = useState(false);
  const [report, setReport] = useState<MachineImportReport | null>(null);
  const [successResult, setSuccessResult] = useState<MachineImportReport | null>(null);

  function pickFile() { if (!uploadingRef.current) fileInputRef.current?.click(); }

  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (uploadingRef.current) { event.target.value = ""; return; }
    if (!/\.xlsx?$/i.test(file.name)) {
      toast.error("Please select an Excel file (.xlsx or .xls).");
      event.target.value = "";
      return;
    }
    uploadingRef.current = true;
    setIsUploading(true);
    try {
      const result = await importMachines(file);
      if (result.status === "success") {
        setSuccessResult(result);
      } else if (result.errors.length > 0 || result.validationErrors > 0) {
        setReport(result);
        toast[result.status === "partial" ? "warning" : "error"](`Import ${result.status === "partial" ? "completed" : "failed"} with ${result.validationErrors.toLocaleString()} validation errors.`);
      } else {
        toast.error(result.message);
      }
      if (result.status === "success" || (result.status === "partial" && result.importedRows !== 0)) {
        void Promise.all([
          queryClient.invalidateQueries({ queryKey: ["machines"] }),
          queryClient.invalidateQueries({ queryKey: ["machine"] }),
        ]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Machine import failed.");
    } finally {
      uploadingRef.current = false;
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return { fileInputRef, isUploading, report, successResult, closeReport: () => setReport(null), closeSuccess: () => setSuccessResult(null), pickFile, uploadFile };
}
