import { z } from "zod";

import { machineCategoryOptions } from "../types/machine";

export const createMachineSchema = z.object({
    machineName: z
        .string()
        .trim()
        .min(1, "Machine name is required.")
        .max(100),

    manufacturer: z
        .string()
        .trim()
        .min(1, "Manufacturer is required.")
        .max(100),

    category: z.enum(machineCategoryOptions, {
        error: "Machine category is required.",
    }),

    description: z
        .string()
        .max(500)
        .optional(),
});

export type CreateMachineForm =
    z.infer<typeof createMachineSchema>;