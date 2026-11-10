import assert from "node:assert/strict";
import test from "node:test";
import { normalizeMachineImportError } from "./machine-import-error.ts";

test("extracts row and invalid value from the known backend message", () => {
  assert.deepEqual(normalizeMachineImportError("Row 2: Requested value 'MIB' was not found."), {
    rowNumber: 2,
    columnName: null,
    invalidValue: "MIB",
    message: "Requested value was not found.",
    category: null,
  });
});

test("supports empty quoted values and case-insensitive matching", () => {
  assert.deepEqual(normalizeMachineImportError("row 3: requested value '' was not found."), {
    rowNumber: 3,
    columnName: null,
    invalidValue: "",
    message: "Requested value was not found.",
    category: null,
  });
});

test("preserves malformed or unrecognized messages", () => {
  for (const message of ["Row x: Requested value 'MIB' was not found.", "Row 4: Another error.", "Row 5: Requested value 'MIB' was not found"]) {
    assert.equal(normalizeMachineImportError(message)?.message, message);
    assert.equal(normalizeMachineImportError(message)?.rowNumber, null);
  }
});

test("structured backend fields take precedence over parsed values", () => {
  assert.deepEqual(normalizeMachineImportError({
    rowNumber: 9,
    columnName: "Manufacturer",
    invalidValue: "SHARP",
    category: "reference",
    message: "Row 2: Requested value 'MIB' was not found.",
  }), {
    rowNumber: 9,
    columnName: "Manufacturer",
    invalidValue: "SHARP",
    message: "Requested value was not found.",
    category: "reference",
  });
});

test("structured messages without the known format remain unchanged", () => {
  assert.deepEqual(normalizeMachineImportError({ row: 6, field: "Model", value: "A1", message: "Unknown model." }), {
    rowNumber: 6,
    columnName: "Model",
    invalidValue: "A1",
    message: "Unknown model.",
    category: null,
  });
});
