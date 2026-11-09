"use client";

import { useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Copy, Download, FileSpreadsheet, ListChecks, LoaderCircle, Search, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { accessoryKeys, accessoryTypeKeys } from "./hooks";
import { commitAccessoryImport, downloadAccessoryImportTemplate, previewAccessoryImport } from "./service";
import type { AccessoryBulkImportResponse } from "./bulk-import-types";

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(value: string | number | null) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }

type StatusFilter = "all" | "valid" | "invalid" | "conflict" | "duplicate";
type ActionFilter = "all" | "create" | "reuse" | "skip" | "reactivate";

function actionStyle(action: string) {
  if (action.startsWith("Create")) return "border-primary/20 bg-primary/10 text-primary";
  if (action.startsWith("Reuse")) return "border-border bg-secondary text-secondary-foreground";
  if (action.startsWith("Skip")) return "border-border bg-muted text-muted-foreground";
  if (action.startsWith("Reactivate")) return "border-foreground/20 bg-muted text-foreground";
  if (action.includes("Conflict") || action.includes("Error")) return "border-destructive/20 bg-destructive/10 text-destructive";
  return "border-border text-muted-foreground";
}

function PrimaryMetric({ label, value, icon: Icon, danger = false }: { label: string; value: number; icon: typeof ListChecks; danger?: boolean }) {
  return <div className="min-w-0 rounded-lg border border-border/70 bg-card px-3 py-2.5">
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Icon className={`size-3.5 ${danger && value > 0 ? "text-destructive" : ""}`} aria-hidden="true" />{label}</div>
    <p className={`mt-1 text-lg leading-none font-medium tabular-nums ${danger && value > 0 ? "text-destructive" : "text-foreground"}`}>{value}</p>
  </div>;
}

function SummaryGroup({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  return <div className="min-w-0 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
    <p className="mb-1.5 text-[11px] font-medium text-foreground">{title}</p>
    <dl className="space-y-1">{items.map((item) => <div key={item.label} className="flex items-center justify-between gap-2 text-[11px]"><dt className="min-w-0 text-muted-foreground">{item.label}</dt><dd className="shrink-0 font-medium tabular-nums">{item.value}</dd></div>)}</dl>
  </div>;
}

function importError(cause: unknown, operation: "template" | "preview" | "import") {
  const action = { template: "Template download", preview: "Preview", import: "Import" }[operation];
  const response = cause instanceof AxiosError ? cause.response : undefined;
  const data = response?.data as { message?: unknown; errors?: Record<string, string[]>; rows?: { errors?: string[] }[] } | undefined;
  if (response?.status === 404 || response?.status === 405) return `${action} is unavailable on the configured API server. Please restart or update the backend.`;
  if (response?.status === 401 || response?.status === 403) return `${action} is not permitted for this session.`;
  if (data && typeof data === "object") {
    const validation = data.errors && Object.values(data.errors).flat().find((value) => typeof value === "string");
    if (validation) return validation;
    if (typeof data.message === "string") return data.message;
    const rowError = data.rows?.flatMap((row) => row.errors ?? []).find((value) => typeof value === "string");
    if (rowError) return rowError;
  }
  if (operation === "template") return "Template download failed. Please try again.";
  if (operation === "preview") return cause instanceof Error ? cause.message : "Unable to preview the selected Excel file. Please check the template and try again.";
  return "Import failed. No changes were saved. Please review the workbook and try again.";
}

export function AccessoryBulkImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const client = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AccessoryBulkImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"template" | "preview" | "import" | null>(null);
  const requestInFlight = useRef(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successResult, setSuccessResult] = useState<AccessoryBulkImportResponse | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const hasBlockingErrors = !!result && (result.invalidRows > 0 || result.conflicts > 0 || result.rows.some((row) => row.errors.length > 0));
  const changeCount = result ? result.newAccessoryTypes + result.newAccessories + result.newAssignments + result.reactivatedAssignments : 0;
  const changeRows = result?.rows.filter((row) => row.errors.length === 0 && row.actions.some((action) => action.startsWith("Create ") || action.startsWith("Reactivate "))).length ?? 0;
  const skippedRows = result ? result.validRows - changeRows : 0;
  const actionableChanges = changeCount > 0;
  const canImport = !!file && !!result && !result.committed && result.validRows > 0 && !hasBlockingErrors && actionableChanges && !busy;
  const importStatus = !file ? "Select an Excel workbook to begin." : busy === "preview" ? "Previewing workbook..." : busy === "import" ? "Importing accessories..." : !result ? "Ready to preview. Click Preview to validate this workbook." : result.committed ? "Import complete. The accessory lists have been refreshed." : hasBlockingErrors ? `Import blocked: ${result.invalidRows} invalid rows and ${result.conflicts} conflicts. Fix the workbook and preview again.` : !actionableChanges ? `All ${result.validRows} rows are valid. No new changes are required because the accessories and model assignments already exist.` : `Preview passed. ${changeCount} database changes will be applied across ${changeRows} rows.`;

  useEffect(() => {
    if (!successResult) return;
    const timer = window.setTimeout(() => onOpenChange(false), 1500);
    return () => window.clearTimeout(timer);
  }, [successResult, onOpenChange]);

  function resetPreviewView() { setSearch(""); setStatusFilter("all"); setActionFilter("all"); setPageSize(10); setPage(1); }

  function reset() { setFile(null); setResult(null); setSuccessResult(null); setError(null); setConfirmOpen(false); resetPreviewView(); }
  function close(next: boolean) { if (busy || confirmOpen || successResult) return; if (!next) reset(); onOpenChange(next); }
  function chooseFile(next: File | null) {
    setResult(null); setConfirmOpen(false); setError(null);
    resetPreviewView();
    if (!next && fileInput.current) fileInput.current.value = "";
    if (!next) { setFile(null); return; }
    if (!next.name.toLowerCase().endsWith(".xlsx")) { setFile(null); setError("Choose an .xlsx workbook."); return; }
    if (next.size === 0 || next.size > 5 * 1024 * 1024) { setFile(null); setError("Choose a non-empty workbook smaller than 5 MB."); return; }
    setFile(next);
  }
  async function template() {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy("template"); setError(null);
    try { saveBlob(await downloadAccessoryImportTemplate(), "accessory-bulk-import-template.xlsx"); }
    catch (cause) { setError(importError(cause, "template")); }
    finally { requestInFlight.current = false; setBusy(null); }
  }
  async function preview() {
    if (!file || busy || requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy("preview"); setError(null); setResult(null); resetPreviewView();
    try { setResult(await previewAccessoryImport(file)); }
    catch (cause) { setError(importError(cause, "preview")); }
    finally { requestInFlight.current = false; setBusy(null); }
  }
  async function commit() {
    if (!canImport || requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy("import"); setError(null);
    try {
      const imported = await commitAccessoryImport(file);
      setResult(imported);
      if (imported.committed) {
        setConfirmOpen(false);
        setSuccessResult(imported);
        void Promise.allSettled([
          client.invalidateQueries({ queryKey: accessoryKeys.lists }),
          client.invalidateQueries({ queryKey: accessoryKeys.lookup }),
          client.invalidateQueries({ queryKey: accessoryTypeKeys.lists }),
          client.invalidateQueries({ queryKey: accessoryTypeKeys.lookup }),
          client.invalidateQueries({ queryKey: ["model-accessories"] }),
        ]);
        toast.success(`Import complete: ${imported.newAccessories} accessories and ${imported.newAssignments} model assignments created.`);
      } else {
        setConfirmOpen(false);
        setError("Import was not completed. Review the row errors and preview again.");
      }
    } catch (cause) {
      setConfirmOpen(false);
      if (cause instanceof AxiosError && cause.response?.status === 400 && cause.response.data?.rows) {
        setResult(cause.response.data as AccessoryBulkImportResponse);
        setError(importError(cause, "import"));
      } else setError(importError(cause, "import"));
    } finally { requestInFlight.current = false; setBusy(null); }
  }
  function exportResults() {
    if (!result) return;
    const lines = [
      ["Row", "Accessory Name", "Accessory Type", "Description", "Machine Model Code", "Actions", "Errors"],
      ...result.rows.map((row) => [row.rowNumber, row.accessoryName, row.accessoryType, row.description, row.machineModelCode, row.actions.join("; "), row.errors.join("; ")]),
    ];
    const csv = lines.map((line) => line.map(csvCell).join(",")).join("\r\n");
    saveBlob(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }), "accessory-import-results.csv");
  }

  const filteredRows = (result?.rows ?? []).filter((row) => {
    if (search && !row.accessoryName.toLowerCase().includes(search.toLowerCase())) return false;
    const isConflict = row.errors.some((message) => /conflict|different|multiple existing/i.test(message));
    const isDuplicate = row.actions.some((action) => action === "Skip Duplicate");
    if (statusFilter === "valid" && row.errors.length > 0) return false;
    if (statusFilter === "invalid" && row.errors.length === 0) return false;
    if (statusFilter === "conflict" && !isConflict) return false;
    if (statusFilter === "duplicate" && !isDuplicate) return false;
    return actionFilter === "all" || row.actions.some((action) => action.toLowerCase().startsWith(actionFilter));
  });
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visibleRows = filteredRows.slice(start, start + pageSize);

  return <>
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="flex max-h-[90dvh] w-[min(96vw,1200px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none" showCloseButton={false}>
        <DialogHeader className="shrink-0 border-b px-4 py-3 pr-12 sm:px-5">
          <DialogTitle>Bulk Import Accessories</DialogTitle>
          <DialogDescription>Download the template, upload your workbook, and review every change before importing.</DialogDescription>
        </DialogHeader>
        <Button type="button" variant="ghost" size="icon-sm" className="absolute right-3 top-3 z-10" aria-label="Close bulk import" disabled={!!busy || confirmOpen || !!successResult} onClick={() => close(false)}><X className="size-4" /></Button>

        {successResult ? <div role="status" aria-live="polite" className="flex min-h-[250px] flex-col items-center justify-center gap-3 px-5 py-8 text-center">
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }} className="flex size-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_18px_rgba(16,185,129,0.16)]">
            <motion.svg viewBox="0 0 24 24" fill="none" className="size-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true"><motion.path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.15, duration: 0.35 }} /></motion.svg>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.25 }}><h3 className="text-sm font-medium">Accessories Imported Successfully</h3><p className="mt-1 text-xs text-muted-foreground">{successResult.totalRows} rows processed</p></motion.div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground"><span>{successResult.newAccessories} accessories created</span><span>{successResult.newAccessoryTypes} types created</span><span>{successResult.newAssignments} assignments created</span><span>{successResult.reactivatedAssignments} assignments reactivated</span></div>
        </div> : <div className="min-h-0 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
          <section aria-label="Template and upload" className="grid gap-3 rounded-lg border border-border/70 bg-card p-3 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="space-y-1">
              <Button type="button" variant="outline" size="sm" disabled={!!busy} onClick={template}><Download className="size-3.5" /> {busy === "template" ? "Preparing..." : "Download Template"}</Button>
              <p className="text-[11px] text-muted-foreground">.xlsx / up to 5 MB / 2,000 rows</p>
            </div>
            <div className="min-w-0 rounded-md border border-dashed border-border/80 bg-background px-3 py-2.5 transition-colors hover:bg-muted/30" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (!busy) chooseFile(event.dataTransfer.files[0] ?? null); }}>
              <label htmlFor="accessory-import-file" className="mb-1 block text-xs font-medium">Completed workbook</label>
              <Input ref={fileInput} id="accessory-import-file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className={file ? "sr-only" : "h-8 text-xs"} disabled={!!busy} onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} />
              {file ? <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <FileSpreadsheet className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="min-w-0 max-w-full flex-1 truncate text-xs" title={file.name}>{file.name}</span>
                <span className="text-[11px] tabular-nums text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                <Button type="button" variant="ghost" size="xs" disabled={!!busy} onClick={() => { if (fileInput.current) { fileInput.current.value = ""; fileInput.current.click(); } }}>Change File</Button>
                <Button type="button" variant="ghost" size="xs" disabled={!!busy} onClick={() => chooseFile(null)}>Remove File</Button>
              </div> : <p className="mt-1 text-[11px] text-muted-foreground">Or drop an Excel file here. Name and Type are required.</p>}
            </div>
          </section>

          {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">{error}</p>}
          <p role="status" aria-live="polite" className="text-xs text-muted-foreground">{importStatus}</p>

          {result && <section aria-label="Import preview" className="space-y-3">
            <div aria-live="polite" className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-medium">{result.committed ? "Import complete" : hasBlockingErrors ? "Review validation issues" : actionableChanges ? "Preview ready" : "Already Up to Date"}</h3><p className="text-[11px] text-muted-foreground">{result.committed ? "The server committed this workbook." : actionableChanges ? "The server will validate the workbook again when you import." : "No import is needed for this workbook."}</p></div></div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <PrimaryMetric label="Total Rows" value={result.totalRows} icon={ListChecks} />
                <PrimaryMetric label="Valid Rows" value={result.validRows} icon={CheckCircle2} />
                <PrimaryMetric label="Invalid Rows" value={result.invalidRows} icon={AlertCircle} danger />
                <PrimaryMetric label="Duplicate Rows" value={result.duplicateRows} icon={Copy} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryGroup title="Accessory Types" items={[{ label: "New", value: result.newAccessoryTypes }, { label: "Reused", value: result.existingAccessoryTypes }]} />
                <SummaryGroup title="Accessories" items={[{ label: "New", value: result.newAccessories }, { label: "Reused", value: result.existingAccessories }]} />
                <SummaryGroup title="Model Assignments" items={[{ label: "New", value: result.newAssignments }, { label: "Existing", value: result.existingAssignments }, { label: "Reactivated", value: result.reactivatedAssignments }]} />
                <SummaryGroup title="Validation" items={[{ label: "Conflicts", value: result.conflicts }, { label: "Missing Models", value: result.missingMachineModels }]} />
              </div>
              <p className="text-[11px] text-muted-foreground">{result.validRows} valid rows · {changeRows} rows requiring changes · {skippedRows} rows with no changes · {result.existingAssignments} existing assignments skipped · {changeCount} planned database changes</p>
            </div>

            <div className="rounded-lg border border-border/70 bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2.5"><div><h3 className="text-xs font-medium">Workbook rows</h3><p className="text-[11px] text-muted-foreground">Search and filter this preview without another upload.</p></div><Button type="button" variant="outline" size="xs" onClick={exportResults}><Download className="size-3" /> Results CSV</Button></div>
              <div className="grid gap-2 border-b p-3 sm:grid-cols-[minmax(0,1fr)_150px_150px]">
                <div className="relative min-w-0"><Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input aria-label="Search preview by accessory name" placeholder="Search accessory names..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="h-8 pl-8 text-xs" /></div>
                <Select value={statusFilter} onValueChange={(value) => { if (value) { setStatusFilter(value as StatusFilter); setPage(1); } }}><SelectTrigger aria-label="Filter preview by validation status" className="w-full text-xs"><SelectValue /></SelectTrigger><SelectContent alignItemWithTrigger={false}><SelectItem value="all">All statuses</SelectItem><SelectItem value="valid">Valid</SelectItem><SelectItem value="invalid">Invalid</SelectItem><SelectItem value="conflict">Conflict</SelectItem><SelectItem value="duplicate">Duplicate</SelectItem></SelectContent></Select>
                <Select value={actionFilter} onValueChange={(value) => { if (value) { setActionFilter(value as ActionFilter); setPage(1); } }}><SelectTrigger aria-label="Filter preview by proposed action" className="w-full text-xs"><SelectValue /></SelectTrigger><SelectContent alignItemWithTrigger={false}><SelectItem value="all">All actions</SelectItem><SelectItem value="create">Create</SelectItem><SelectItem value="reuse">Reuse</SelectItem><SelectItem value="skip">Skip</SelectItem><SelectItem value="reactivate">Reactivate</SelectItem></SelectContent></Select>
              </div>
              <TooltipProvider>
                <Table className="min-w-[900px] table-fixed">
                  <colgroup><col className="w-[6%]" /><col className="w-[23%]" /><col className="w-[17%]" /><col className="w-[13%]" /><col className="w-[25%]" /><col className="w-[16%]" /></colgroup>
                  <TableHeader><TableRow>{["Row", "Accessory Name", "Accessory Type", "Model Code", "Actions", "Validation"].map((heading) => <TableHead key={heading} scope="col" className="overflow-hidden text-[11px]">{heading}</TableHead>)}</TableRow></TableHeader>
                  <TableBody>{visibleRows.length ? visibleRows.map((row) => {
                    const conflict = row.errors.some((message) => /conflict|different|multiple existing/i.test(message));
                    const duplicate = row.actions.includes("Skip Duplicate");
                    return <TableRow key={row.rowNumber} className={row.errors.length ? "bg-destructive/[0.04]" : ""}>
                      <TableCell className="align-top text-muted-foreground tabular-nums">{row.rowNumber}</TableCell>
                      <TableCell className="min-w-0 overflow-hidden align-top"><Tooltip><TooltipTrigger render={<button type="button" className="block w-full min-w-0 truncate rounded-sm text-left text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring" />}>{row.accessoryName || "No name"}</TooltipTrigger><TooltipContent className="max-w-[min(24rem,calc(100vw-2rem))] break-words">{row.accessoryName || "No accessory name"}</TooltipContent></Tooltip></TableCell>
                      <TableCell className="min-w-0 overflow-hidden align-top whitespace-normal"><span className="block break-words leading-4" title={row.accessoryType}>{row.accessoryType || "No type"}</span></TableCell>
                      <TableCell className="min-w-0 overflow-hidden align-top font-mono text-[11px] whitespace-normal"><span className="block break-all leading-4" title={row.machineModelCode || undefined}>{row.machineModelCode || "None"}</span></TableCell>
                      <TableCell className="min-w-0 overflow-hidden align-top whitespace-normal"><div className="flex min-w-0 flex-wrap items-start gap-1">{row.actions.length ? row.actions.map((action, index) => <Badge key={`${action}-${index}`} variant="outline" className={`h-auto min-w-0 max-w-full px-1.5 py-0.5 text-[10px] leading-tight whitespace-normal break-words [overflow-wrap:anywhere] ${actionStyle(action)}`}>{action}</Badge>) : <span className="text-muted-foreground">None</span>}</div></TableCell>
                      <TableCell className="min-w-0 overflow-hidden align-top whitespace-normal"><Badge variant={row.errors.length ? "destructive" : "secondary"} className="h-auto px-1.5 py-0.5 text-[10px]">{conflict ? "Conflict" : row.errors.length ? "Invalid" : duplicate ? "Duplicate" : "Valid"}</Badge>{row.errors.length > 0 && <div className="mt-1 space-y-0.5 text-[11px] leading-4 text-destructive">{row.errors.map((message, index) => <p key={index} className="break-words">{message}</p>)}</div>}</TableCell>
                    </TableRow>;
                  }) : <TableRow><TableCell colSpan={6} className="py-8 text-center text-xs text-muted-foreground">No rows match these filters.</TableCell></TableRow>}</TableBody>
                </Table>
              </TooltipProvider>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2.5 text-[11px] text-muted-foreground"><span aria-live="polite">Showing {filteredRows.length ? start + 1 : 0}-{Math.min(start + pageSize, filteredRows.length)} of {filteredRows.length} rows</span><div className="flex flex-wrap items-center gap-2"><label htmlFor="preview-page-size">Rows per page</label><Select value={String(pageSize)} onValueChange={(value) => { if (value) { setPageSize(Number(value)); setPage(1); } }}><SelectTrigger id="preview-page-size" className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger><SelectContent alignItemWithTrigger={false}><SelectItem value="10">10</SelectItem><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem></SelectContent></Select><Button type="button" variant="outline" size="icon-xs" aria-label="Previous preview page" disabled={currentPage <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft className="size-3.5" /></Button><span className="min-w-11 text-center tabular-nums">{currentPage} / {totalPages}</span><Button type="button" variant="outline" size="icon-xs" aria-label="Next preview page" disabled={currentPage >= totalPages} onClick={() => setPage((current) => current + 1)}><ChevronRight className="size-3.5" /></Button></div></div>
            </div>
          </section>}
        </div>}
        {!successResult && <DialogFooter className="mx-0 mb-0 shrink-0 flex-wrap gap-2 rounded-none border-t px-4 py-3 sm:px-5">
          <Button type="button" variant="outline" disabled={!!busy} onClick={() => close(false)}>Close</Button>
          <Button type="button" variant="secondary" disabled={!file || !!busy} onClick={preview}>{busy === "preview" ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}{busy === "preview" ? "Previewing..." : result ? "Preview Again" : "Preview"}</Button>
          {(canImport || busy === "import") && <Button type="button" disabled={!canImport} onClick={() => setConfirmOpen(true)}>{busy === "import" ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" />} {busy === "import" ? "Importing..." : "Confirm Import"}</Button>}
          {result && !result.committed && !hasBlockingErrors && !actionableChanges && busy !== "preview" && <TooltipProvider><Tooltip><TooltipTrigger render={<span tabIndex={0} className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Already Imported: All accessories and model assignments already exist. No changes are required." />}><Button type="button" disabled><CheckCircle2 className="size-4" aria-hidden="true" /> Already Imported</Button></TooltipTrigger><TooltipContent>All accessories and model assignments already exist. No changes are required.</TooltipContent></Tooltip></TooltipProvider>}
        </DialogFooter>}
      </DialogContent>
    </Dialog>
    <Dialog open={confirmOpen} onOpenChange={(next) => { if (!busy) setConfirmOpen(next); }}><DialogContent><DialogHeader><DialogTitle>Import accessories?</DialogTitle><DialogDescription>{busy === "import" ? "Importing accessories... Please wait for the server to finish." : `This will create ${result?.newAccessoryTypes ?? 0} types, ${result?.newAccessories ?? 0} accessories, and ${result?.newAssignments ?? 0} model assignments. ${result?.reactivatedAssignments ?? 0} inactive assignments will be reactivated. The server will validate the workbook again before committing.`}</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="outline" disabled={!!busy} onClick={() => setConfirmOpen(false)}>Cancel</Button><Button type="button" disabled={!!busy} onClick={commit}>{busy === "import" ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}{busy === "import" ? "Importing..." : "Import"}</Button></DialogFooter></DialogContent></Dialog>
  </>;
}
