export interface WarrantyTypeOption {
    warrantyTypeCode: string;
    warrantyTypeName: string;
    description?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
}