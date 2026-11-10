import axiosClient from "@/lib/axios";
import { API } from "@/constants/api";
import type { ApiResponse } from "@/types/api";

import type {
    MachineCategoryOption,
    CreateMachineRequest,
    MachineResponse,
    PagedResponse,
} from "../types/machine";

export interface MachineSearchRequest {
    machineCode?: string;
    modelCode?: string;
    warrantyTypeCode?: string;
    warrantyPeriod?: number;
    warrantyPeriodUnit?: string;
    ruleType?: string;
    keyword?: string;
    sortBy?: string;
    sortDirection?: "Asc" | "Desc";
    page?: number;
    pageSize?: number;
}

export interface MachineStatistics {
    totalMachines: number;
    activeMachines: number;
    categories: number;
}

export async function getMachineStatistics(): Promise<MachineStatistics> {
    const response = await axiosClient.get<ApiResponse<MachineStatistics>>(`${API.MACHINE}/statistics`);
    return response.data.data;
}

export async function getMachines(
    params: MachineSearchRequest
): Promise<PagedResponse<MachineResponse>> {
    const response = await axiosClient.get<
        ApiResponse<PagedResponse<MachineResponse>>
    >(API.MACHINE, {
        params,
    });

    return response.data.data;
}

export async function createMachine(
    request: CreateMachineRequest
): Promise<MachineResponse> {
    const response = await axiosClient.post<
        ApiResponse<MachineResponse>
    >(API.MACHINE, request);

    return response.data.data;
}

export async function getMachineCategories(): Promise<MachineCategoryOption[]> {
    const response = await axiosClient.get<
        ApiResponse<MachineCategoryOption[]>
    >(`${API.MACHINE_CATEGORY}`);

    return response.data.data;
}
