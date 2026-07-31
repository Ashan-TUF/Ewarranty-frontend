export interface WarrantyTypeOption {
    warrantyTypeCode: string;
    warrantyTypeName: string;
    description?: string;
}

export interface ModelWarrantySummaryResponse {
    id: number;
    machineCode: string;
    modelCode: string;
    warrantyTypeCode: string;
    warrantyTypeName: string;
    warrantyPeriod: number;
    warrantyPeriodUnit: "Days" | "Months" | "Years";
    warrantyCopyLimit?: number;
    warrantyHourLimit?: number;
    ruleType: "TimeOnly" | "TimeOrCopies" | "TimeOrHours";
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
}