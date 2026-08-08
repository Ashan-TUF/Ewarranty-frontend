export type InstallationStatus =
    | "Pending"
    | "Confirmed"
    | "Completed"
    | "Cancelled"
    | (string & {});

export interface InstallationReport {
    id: number;
    customerCode: string;
    customerName: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    city?: string;
    phone?: string;
    contactPerson?: string;
    email?: string;
    machineModel: string;
    machineDescription?: string;
    serialNumber?: string;
    machineReferenceNo?: string;
    invoiceNumber?: string;
    installationDate: string;
    installedBy?: string;
    remarks?: string;
    area?: string;
    installationNumber?: string;
    quotationNumber?: string;
    copyCounter?: number;
    masterCounter?: number;
    salesExecutive?: string;
    engineer?: string;
    department?: string;
    floor?: string;
    buildingDescription?: string;
    streetName?: string;
    fax?: string;
    isUsbEnabled?: boolean;
    isNetworkEnabled?: boolean;
    isStandAlone?: boolean;
    isFaxEnabled?: boolean;
    ricohRemoteEnabled?: boolean;
    isManualReceived?: boolean;
    installationStatus: InstallationStatus;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface InstallationReportSearchRequest {
    id?: number;
    keyword?: string;
    status?: InstallationStatus | "";
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    pageSize?: number;
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

export type InstallationReportSearchResponse = PagedResponse<InstallationReport>;

export interface CreateInstallationReportRequest {
    customerCode: string;
    customerName: string;
    addressLine1: string;
    addressLine2?: string;
    addressLine3?: string;
    city: string;
    phone: string;
    contactPerson: string;
    email?: string;
    machineDescription: string;
    machineModel: string;
    serialNo: string;
    referenceNo?: string;
    invoiceNo?: string;
    installationDate: string;
    installedBy: string;
    remarks?: string;
    area?: string;
    quotationNo?: string;
    copyCounter?: number;
    masterCounter?: number;
    salesExecutive?: string;
    engineer?: string;
    department?: string;
    floor?: string;
    buildingDescription?: string;
    streetName?: string;
    fax?: string;
    isUsbEnabled: boolean;
    isNetworkEnabled: boolean;
    isStandAlone: boolean;
    isFaxEnabled: boolean;
    ricohRemoteEnabled: boolean;
    isManualReceived: boolean;
}

export interface UpdateInstallationReportRequest {
    customerName?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    city?: string;
    phone?: string;
    contactPerson?: string;
    email?: string;
    machineDescription?: string;
    machineReferenceNo?: string;
    installationDate?: string;
    installedBy?: string;
    remarks?: string;
    area?: string;
    quotationNumber?: string;
    copyCounter?: number;
    masterCounter?: number;
    salesExecutive?: string;
    engineer?: string;
    department?: string;
    floor?: string;
    buildingDescription?: string;
    streetName?: string;
    fax?: string;
    isUsbEnabled?: boolean;
    isNetworkEnabled?: boolean;
    isStandAlone?: boolean;
    isFaxEnabled?: boolean;
    ricohRemoteEnabled?: boolean;
    isManualReceived?: boolean;
}

export interface InstallationReportResponse {
    id: number;
    customerCode: string;
    customerName: string;
    machineModel: string;
    machineDescription: string;
    serialNumber: string;
    machineReferenceNo?: string;
    installationNumber?: string;
    installationDate: string;
    installedBy: string;
    installationStatus: InstallationStatus;
}

export interface ConfirmInstallationReportRequest {
    invoiceNumber?: string;
}
