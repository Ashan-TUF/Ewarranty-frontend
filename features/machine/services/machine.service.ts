import api from "@/lib/axios";
import { API } from "@/constants/api";
import { CreateMachineRequest } from "../types/machine";

export async function createMachine(
    request: CreateMachineRequest
) {
    const { data } = await api.post(
        API.MACHINE,
        request
    );

    return data;
}