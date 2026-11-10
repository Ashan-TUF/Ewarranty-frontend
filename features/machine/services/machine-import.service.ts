import { apiUrl } from "@/lib/api-url";
import { normalizeMachineImportError, type MachineImportError } from "./machine-import-error";

export interface MachineImportReport {
  status: "success" | "partial" | "failed";
  message: string;
  totalRows: number | null;
  importedRows: number | null;
  failedRows: number | null;
  validationErrors: number;
  errors: MachineImportError[];
}

const record = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

const count = (source: Record<string, unknown> | null, keys: string[]): number | null => {
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  }
  return null;
};

const label = (value: unknown): string | null =>
  typeof value === "string" ? value : typeof value === "number" || typeof value === "boolean" ? String(value) : null;

function parseReport(payload: unknown, ok: boolean, statusCode: number): MachineImportReport | null {
  const body = record(payload);
  if (!body) return null;
  const data = record(body.data);
  const rawErrors = Array.isArray(data?.errors) ? data.errors : Array.isArray(body.errors) ? body.errors : [];
  const errors = rawErrors.map(normalizeMachineImportError).filter((error): error is MachineImportError => error !== null);
  const totalRows = count(data, ["totalRows", "processedRows", "totalProcessedRows"]) ?? count(body, ["totalRows", "processedRows", "totalProcessedRows"]);
  const importedRows = count(data, ["importedRows", "successfulRows", "successRows", "successCount"]) ?? count(body, ["importedRows", "successfulRows", "successRows", "successCount"]);
  const failedRows = count(data, ["failedRows", "invalidRows", "failureCount"]) ?? count(body, ["failedRows", "invalidRows", "failureCount"]);
  const validationErrors = count(data, ["validationErrors", "errorCount", "totalErrors"]) ?? count(body, ["validationErrors", "errorCount", "totalErrors"]) ?? errors.length;
  const message = label(body.message) ?? (ok ? "Machine import completed." : `Machine import failed (HTTP ${statusCode}).`);
  if (!ok && errors.length === 0) return null;
  const hasValidationErrors = errors.length > 0 || validationErrors > 0;
  const status = !ok || (hasValidationErrors && (importedRows === 0 || (body.success === false && importedRows === null)))
    ? "failed"
    : hasValidationErrors
      ? "partial"
      : body.success === true && (failedRows === null || failedRows === 0)
        ? "success" : "failed";
  return { status, message, totalRows, importedRows, failedRows, validationErrors, errors };
}

export async function importMachines(file: File): Promise<MachineImportReport> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(apiUrl("/machine-imports"), { method: "POST", body: form });
  const responseText = await response.text();
  let payload: unknown = null;
  try { payload = responseText ? JSON.parse(responseText) as unknown : null; } catch { /* Non-JSON response. */ }
  const report = parseReport(payload, response.ok, response.status);
  if (report) {
    if (report.status === "failed" && report.errors.length === 0 && report.validationErrors === 0) {
      throw new Error(report.message === "Machine import completed." ? "The server did not confirm that the import succeeded." : report.message);
    }
    return report;
  }
  if (!response.ok) {
    const safeMessage = label(record(payload)?.message);
    throw new Error(safeMessage ?? `Machine import failed (HTTP ${response.status}).`);
  }
  throw new Error("The server did not confirm that the import succeeded.");
}
