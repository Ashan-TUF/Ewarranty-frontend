import { MachineCategory } from "@/types/enums";

export interface CreateMachineRequest {
    machineName: string;
    manufacturer: string;
    category: MachineCategory;
    description?: string;
}