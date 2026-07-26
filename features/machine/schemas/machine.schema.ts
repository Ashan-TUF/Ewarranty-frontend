import { z } from "zod";
import type { CreateMachineRequest } from "../types/machine";

export const createMachineSchema = z.object({
    machineName: z.string().trim().min(1, "Machine name is required."),
    manufacturer: z.string().trim().min(1, "Manufacturer is required."),
    category: z.string().min(1, "Machine category is required."),
    description: z.string().optional(),
});

export type CreateMachineForm = z.infer<typeof createMachineSchema>;
export type MachineCategory = CreateMachineRequest["category"];