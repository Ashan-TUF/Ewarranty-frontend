export interface MachineImportError {
  rowNumber: number | null;
  columnName: string | null;
  invalidValue: string | null;
  message: string;
  category: string | null;
}

const REQUESTED_VALUE_ERROR = /^Row\s+(\d+):\s+Requested value '([^']*)' was not found\.$/i;

const record = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

const text = (value: unknown): string | null =>
  typeof value === "string" ? value : typeof value === "number" || typeof value === "boolean" ? String(value) : null;

function rowNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) return value;
  return null;
}

function parseMessage(message: string): MachineImportError {
  const match = REQUESTED_VALUE_ERROR.exec(message);
  const row = match ? Number(match[1]) : null;
  if (match && Number.isSafeInteger(row)) {
    return {
      rowNumber: row,
      columnName: null,
      invalidValue: match[2],
      message: "Requested value was not found.",
      category: null,
    };
  }
  return { rowNumber: null, columnName: null, invalidValue: null, message, category: null };
}

export function normalizeMachineImportError(value: unknown): MachineImportError | null {
  if (typeof value === "string") return parseMessage(value);
  const item = record(value);
  if (!item) return null;
  const rawMessage = text(item.message) ?? text(item.error) ?? text(item.reason);
  if (rawMessage === null) return null;
  const parsed = parseMessage(rawMessage);
  return {
    rowNumber: rowNumber(item.rowNumber) ?? rowNumber(item.row) ?? rowNumber(item.excelRowNumber) ?? parsed.rowNumber,
    columnName: text(item.columnName) ?? text(item.column) ?? text(item.field) ?? text(item.fieldName),
    invalidValue: text(item.invalidValue) ?? text(item.value) ?? parsed.invalidValue,
    message: parsed.message,
    category: text(item.category) ?? text(item.code),
  };
}
