import { apiUrl } from "@/lib/api-url";
import type { ApiResponse } from "@/types/api";

import type {
    ConfirmInstallationReportRequest,
    CreateInstallationReportRequest,
    InstallationReport,
    InstallationReportResponse,
    InstallationReportSearchRequest,
    InstallationReportSearchResponse,
    UpdateInstallationReportRequest,
} from "../types/installation-report";

const INSTALLATION_REPORT_URL = apiUrl("/invoice/installations");
const CREATE_INSTALLATION_REPORT_URL = apiUrl("/invoice/installation");
const INSTALLATION_REPORT_DETAILS_URL = apiUrl("/invoice");

function toQueryString(params?: InstallationReportSearchRequest) {
    if (!params) {
        return "";
    }

    const query = new URLSearchParams();

    if (params.id != null) {
        query.set("id", String(params.id));
    }

    if (params.keyword?.trim()) {
        query.set("keyword", params.keyword.trim());
    }

    if (params.status) {
        query.set("status", params.status);
    }

    if (params.fromDate) {
        query.set("fromDate", params.fromDate);
    }

    if (params.toDate) {
        query.set("toDate", params.toDate);
    }

    if (params.sortBy) {
        query.set("sortBy", params.sortBy);
    }

    if (params.sortOrder) {
        query.set("sortOrder", params.sortOrder);
    }

    if (params.page != null) {
        query.set("page", String(params.page));
    }

    if (params.pageSize != null) {
        query.set("pageSize", String(params.pageSize));
    }

    return query.toString();
}

async function readErrorMessage(response: Response) {
    const fallback = "Something went wrong while processing installation reports.";

    try {
        const payload = (await response.json()) as Partial<ApiResponse<unknown>>;
        return payload.message || fallback;
    } catch {
        return fallback;
    }
}

export async function getInstallationReports(
    params?: InstallationReportSearchRequest
): Promise<InstallationReportSearchResponse> {
    const query = toQueryString(params);
    const response = await fetch(
        query ? `${INSTALLATION_REPORT_URL}?${query}` : INSTALLATION_REPORT_URL
    );

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    const payload = (await response.json()) as ApiResponse<
        InstallationReportSearchResponse | InstallationReport[]
    >;

    if (Array.isArray(payload.data)) {
        return {
            items: payload.data,
            totalCount: payload.data.length,
            page: params?.page ?? 1,
            pageSize: params?.pageSize ?? payload.data.length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
        };
    }

    return payload.data;
}

export async function getInstallationReportById(
    id: number
): Promise<InstallationReport | null> {
    const response = await fetch(`${INSTALLATION_REPORT_DETAILS_URL}/${id}`);

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    const payload = (await response.json()) as ApiResponse<InstallationReport | null>;
    return payload.data ?? null;
}

export async function createInstallationReport(
    request: CreateInstallationReportRequest
): Promise<InstallationReportResponse> {
    const response = await fetch(CREATE_INSTALLATION_REPORT_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    const payload = (await response.json()) as ApiResponse<InstallationReportResponse>;
    return payload.data;
}

export async function updateInstallationReport(
    id: number,
    request: UpdateInstallationReportRequest
): Promise<InstallationReportResponse> {
    const response = await fetch(`${INSTALLATION_REPORT_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    const payload = (await response.json()) as ApiResponse<InstallationReportResponse>;
    return payload.data;
}

export async function confirmInstallationReport(
    id: number,
    request: ConfirmInstallationReportRequest
): Promise<InstallationReport> {
    const response = await fetch(`${INSTALLATION_REPORT_URL}/${id}/confirm`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    const payload = (await response.json()) as ApiResponse<InstallationReport>;
    return payload.data;
}
