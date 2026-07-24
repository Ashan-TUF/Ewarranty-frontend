export const machineCategoryOptions = [
    "Copier",
    "Printer",
    "Multifunction Printer",
    "Projector",
    "Duplicator",
    "Scanner",
] as const;

export type MachineCategoryOption =
    (typeof machineCategoryOptions)[number];

export interface CreateMachineRequest {
    machineName: string;
    manufacturer: string;
    category: MachineCategoryOption;
    description?: string;
}

export interface MachineApiResponse {
    id: number;
    machineCode: string;
    machineName: string;
    manufacturer: string;
    category: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
}

export interface ApiResponse<TData> {
    data: TData;
    success: boolean;
    statusCode: number;
    message: string;
}