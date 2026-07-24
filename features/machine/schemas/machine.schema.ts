import { z } from "zod";

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

    category: z.number({
        error: "Machine category is required.",
    }),

    description: z
        .string()
        .max(500)
        .optional(),
});

export type CreateMachineForm =
    z.infer<typeof createMachineSchema>;