import axiosClient from "@/lib/axios";
import { API } from "@/constants/api";
import type { ApiResponse } from "@/types/api";

import type {
    CreateMachineRequest,
    MachineResponse,
    PagedResponse,
} from "../types/machine";

export interface MachineSearchRequest {
    machineCode?: string;
    page?: number;
    pageSize?: number;
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
