export interface AccessoryBulkImportRow {
  rowNumber: number;
  accessoryName: string;
  accessoryType: string;
  description: string | null;
  machineModelCode: string | null;
  actions: string[];
  errors: string[];
}

export interface AccessoryBulkImportResponse {
  committed: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  existingAccessoryTypes: number;
  newAccessoryTypes: number;
  existingAccessories: number;
  newAccessories: number;
  existingAssignments: number;
  newAssignments: number;
  reactivatedAssignments: number;
  conflicts: number;
  missingMachineModels: number;
  rows: AccessoryBulkImportRow[];
}
