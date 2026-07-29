import { z } from "zod";

import type { CreateMachineRequest } from "../types/machine";

export const machineCategories = [
    "Printer",
    "Photocopier",
    "Scanner",
    "Projector",
    "Other",
] as const;

export const createMachineSchema = z.object({
    machineName: z
        .string()
        .trim()
        .min(1, "Machine name is required.")
        .max(100, "Machine name cannot exceed 100 characters."),

    manufacturer: z
        .string()
        .trim()
        .min(1, "Manufacturer is required.")
        .max(100, "Manufacturer cannot exceed 100 characters."),

    category: z
        .string()
        .min(1, "Machine category is required."),

    description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters.")
        .optional(),
});

export type CreateMachineForm = z.infer<
    typeof createMachineSchema
>;

export type MachineCategory =
    CreateMachineRequest["category"];