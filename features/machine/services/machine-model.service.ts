import api from "@/lib/axios";
import { API } from "@/constants/api";
import type { ApiResponse } from "@/types/api";

import type {
    CreateMachineModelRequest,
    MachineModelResponse,
} from "../types/machine";

export async function createMachineModel(
    request: CreateMachineModelRequest
) : Promise<MachineModelResponse> {
    const {
        machineCode,
        ...payload
    } = request;

    const response = await api.post(
        `${API.MACHINE}/${machineCode}/models`,
        payload
    );

    return (response.data as ApiResponse<MachineModelResponse>).data;
}