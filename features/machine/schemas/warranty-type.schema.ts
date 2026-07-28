import { z } from "zod";

export const createWarrantyTypeSchema = z.object({
    warrantyTypeName: z
        .string()
        .trim()
        .min(1, "Warranty type name is required.")
        .max(100, "Warranty type name cannot exceed 100 characters."),

    description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters.")
        .optional(),
});

export type CreateWarrantyTypeForm = z.infer<
    typeof createWarrantyTypeSchema
>;