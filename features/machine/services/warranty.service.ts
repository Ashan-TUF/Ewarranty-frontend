import type { CreateModelWarrantyForm } from "../schemas/model-warranty.schema";
import type { CreateWarrantyTypeForm } from "../schemas/warranty-type.schema";
import type {
    ApiResponse,
    WarrantyTypeOption,
} from "../types/warranty.types";

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
        throw new Error("Failed to create warranty type.");
    }

    const result: ApiResponse<WarrantyTypeOption> =
        await response.json();

    return result.data;
}

export async function createModelWarranty(
    machineCode: string,
    modelCode: string,
    payload: CreateModelWarrantyForm
) {
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
        throw new Error("Failed to create model warranty.");
    }

    return response.json();
}