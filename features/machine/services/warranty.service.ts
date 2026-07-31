import type { CreateModelWarrantyForm } from "../schemas/model-warranty.schema";
import type { CreateWarrantyTypeForm } from "../schemas/warranty-type.schema";
import type {
    ApiResponse,
    ModelWarrantySummaryResponse,
    WarrantyTypeOption,
} from "../types/warranty.types";

interface ApiErrorResponse {
    message?: string;
    errors?: Record<string, string[]>;
}

const API_URL =
    process.env.NEXT_PUBLIC_EWARRANTY_URL ?? "http://localhost:5067";

export async function getWarrantyTypes(): Promise<WarrantyTypeOption[]> {
    const response = await fetch(`${API_URL}/api/warranty-types`);

    if (!response.ok) {
        throw new Error("Failed to load warranty types.");
    }

    const result: ApiResponse<WarrantyTypeOption[]> =
        await response.json();

    return result.data;
}

export async function createWarrantyType(
    payload: CreateWarrantyTypeForm
): Promise<WarrantyTypeOption> {
    const response = await fetch(`${API_URL}/api/warranty-types`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const result = await response.json().catch(() => null) as ApiResponse<unknown> | null;
        throw new Error(result?.message || "Failed to create warranty type.");
    }

    const result: ApiResponse<WarrantyTypeOption> =
        await response.json();

    return result.data;
}

export async function createModelWarranty(
    machineCode: string,
    modelCode: string,
    payload: CreateModelWarrantyForm
): Promise<ModelWarrantySummaryResponse> {
    const response = await fetch(
        `${API_URL}/api/machines/${machineCode}/models/${modelCode}/warranties`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        const result = await response.json().catch(() => null) as ApiErrorResponse | null;
        const error = new Error(result?.message || "Failed to create model warranty.") as Error & {
            validationErrors?: Record<string, string[]>;
        };

        if (result?.errors) {
            error.validationErrors = result.errors;
        }

        throw error;
    }

    const result = await response.json() as ApiResponse<ModelWarrantySummaryResponse>;
    return result.data;
}