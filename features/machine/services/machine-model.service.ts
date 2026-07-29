import api from "@/lib/axios";
import { CreateMachineModelRequest } from "../types/machine";

export async function createMachineModel(
    request: CreateMachineModelRequest
) {
    const response = await api.post(
        "/api/machine-models",
        request
    );

    return response.data;
}