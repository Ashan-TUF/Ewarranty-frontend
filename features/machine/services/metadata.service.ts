import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

import type { MachineMetadataOption } from "../types/machine";

export async function getMachineColorTypes(): Promise<MachineMetadataOption[]> {
    const response = await api.get<
        ApiResponse<MachineMetadataOption[]>
    >("/metadata/machine/color-types");

    return response.data.data;
}

export async function getMachineNetworkTypes(): Promise<MachineMetadataOption[]> {
    const response = await api.get<
        ApiResponse<MachineMetadataOption[]>
    >("/metadata/machine/network-types");

    return response.data.data;
}
