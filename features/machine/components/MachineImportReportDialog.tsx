"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { MachineImportReport } from "../services/machine-import.service";

const PAGE_SIZE = 25;
const csvCell = (value: string | number | null) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export function MachineImportReportDialog({ report, onClose }: { report: MachineImportReport | null; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const categories = useMemo(() => [...new Set(report?.errors.map((error) => error.category).filter((value): value is string => !!value) ?? [])], [report]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return report?.errors.filter((error) =>
      (category === "all" || error.category === category) &&
      (!term || [error.rowNumber, error.columnName, error.invalidValue, error.message].some((value) => String(value ?? "").toLowerCase().includes(term)))
    ) ?? [];
  }, [report, search, category]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);

  function exportErrors() {
    if (!report) return;
    const rows = [["Row", "Column", "Invalid Value", "Error Message"], ...report.errors.map((error) => [error.rowNumber, error.columnName, error.invalidValue, error.message])];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "machine-import-errors.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <Dialog open={!!report} onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="flex max-h-[88dvh] w-[calc(100%-1.5rem)] max-w-[860px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[860px]" showCloseButton={false}>
      <DialogHeader className="shrink-0 border-b p-4 pr-12 sm:p-6 sm:pr-12">
        <div className="flex items-center gap-2">
          {report?.status === "success" ? <CheckCircle2 className="size-5 text-primary" /> : <AlertCircle className="size-5 text-destructive" />}
          <DialogTitle className="text-base">Machine Bulk Import Report</DialogTitle>
        </div>
        <DialogDescription>{report?.status === "success" ? "Import completed successfully." : report?.status === "partial" ? "Import completed with validation errors." : "Import failed. Review the validation errors below."}</DialogDescription>
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([['Processed rows', report?.totalRows], ['Imported rows', report?.importedRows], ['Failed rows', report?.failedRows], ['Validation errors', report?.validationErrors]] as const).map(([label, value]) =>
            <div key={label} className="rounded-lg border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{value == null ? '—' : value.toLocaleString()}</p></div>)}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{report?.message}{[report?.totalRows, report?.importedRows, report?.failedRows].some((value) => value == null) ? " Some row counts were not provided by the server." : ""}</p>
        {!!report?.errors.length && <>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search validation errors" placeholder="Search row, value or message..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="pl-9" /></div>
            {categories.length > 0 && <select aria-label="Filter error category" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>}
          </div>
          <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">Showing {filtered.length.toLocaleString()} of {report.errors.length.toLocaleString()} errors</p>
          {filtered.length ? <div className="mt-2 overflow-x-auto rounded-lg border"><table className="w-full table-fixed text-left text-[11px] font-normal"><colgroup><col className="w-14 sm:w-16" /><col className="w-[30%]" /><col /></colgroup><thead className="bg-muted/50 text-[11px] font-normal text-muted-foreground"><tr><th className="px-3 py-1.5 text-[11px] font-normal">Row</th><th className="px-3 py-1.5 text-[11px] font-normal">Invalid value</th><th className="px-3 py-1.5 text-[11px] font-normal">Validation message</th></tr></thead><tbody>{filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((error, index) => <tr key={`${currentPage}-${index}`} className="border-t align-top text-[11px] font-normal"><td className="px-3 py-1.5 text-[11px] font-normal tabular-nums">{error.rowNumber ?? '—'}</td><td className="break-words px-3 py-1.5 text-[11px] font-normal [overflow-wrap:anywhere]">{error.invalidValue ?? '—'}</td><td className="break-words px-3 py-1.5 text-[11px] font-normal [overflow-wrap:anywhere]">{error.message}</td></tr>)}</tbody></table></div> : <div className="mt-2 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No errors match your search or filter.</div>}
          {pages > 1 && <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>Page {currentPage} of {pages}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Next</Button></div></div>}
        </>}
        {report?.status === "success" && !report.errors.length && <div className="mt-5 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No validation errors were returned.</div>}
      </div>
      <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none bg-background px-4 py-3 sm:px-6"><Button type="button" variant="outline" onClick={onClose}>Close</Button><Button type="button" onClick={exportErrors} disabled={!report?.errors.length}><Download className="size-4" />Export Errors</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
