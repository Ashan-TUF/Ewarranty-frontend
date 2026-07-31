export type MachineCategory = string;

export interface MachineCategoryOption {
    id: number;
    name: string;
}

export interface MachineMetadataOption {
    id: number;
    name: string;
}

export const machineCategoryOptions: MachineCategory[] = [
    "Printer",
    "Photocopier",
    "Scanner",
    "Projector",
    "Other",
];

export interface MachineResponse {
    machineCode: string;
    machineName: string;
    manufacturer: string;
    category: MachineCategory;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    models: MachineModelResponse[];
}

export interface MachineModelResponse {
    modelCode: string;
    modelName: string;
    description?: string;
    colorType?: string;
    networkType?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    warranties: WarrantyResponse[];
}

export interface WarrantyResponse {
    warrantyTypeCode: string;
    warrantyTypeName: string;
    warrantyPeriod: number;
    warrantyPeriodUnit: string;
    warrantyCopyLimit?: number;
    warrantyHourLimit?: number;
    ruleType: "TimeOnly" | "TimeOrCopies" | "TimeOrHours";
    description?: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateMachineRequest {
    machineName: string;
    manufacturer: string;
    category: MachineCategory;
    description?: string;
}

export interface CreateMachineModelRequest {
    machineCode: string;
    modelName: string;
    description?: string;
    colorType?: string;
    networkType?: string;
}

export interface PagedResponse<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}