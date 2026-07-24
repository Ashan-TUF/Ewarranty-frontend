import api from "@/lib/axios";
import { API } from "@/constants/api";
import { ApiResponse, CreateMachineRequest, MachineApiResponse } from "../types/machine";

export async function createMachine(
    request: CreateMachineRequest
) {
    const { data } = await api.post<ApiResponse<MachineApiResponse>>(
        API.MACHINE,
        request
    );

    return data;
}