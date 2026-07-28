import { z } from "zod";

export const warrantyPeriodUnitOptions = [
    "Days",
    "Months",
    "Years",
] as const;

export const warrantyRuleTypeOptions = [
    "TimeOnly",
    "TimeOrCopies",
    "TimeOrHours",
] as const;

export const createModelWarrantySchema = z
    .object({
        warrantyTypeCode: z
            .string()
            .min(1, "Warranty type is required."),

        warrantyPeriod: z
            .number()
            .int("Warranty period must be a whole number.")
            .positive("Warranty period must be greater than 0."),

        warrantyPeriodUnit: z.enum(warrantyPeriodUnitOptions),

        warrantyCopyLimit: z
            .number()
            .int("Copy limit must be a whole number.")
            .positive("Copy limit must be greater than 0.")
            .optional(),

        warrantyHourLimit: z
            .number()
            .int("Hour limit must be a whole number.")
            .positive("Hour limit must be greater than 0.")
            .optional(),

        ruleType: z.enum(warrantyRuleTypeOptions),

        description: z
            .string()
            .max(500, "Description cannot exceed 500 characters.")
            .optional(),
    })
    .superRefine((data, ctx) => {
        if (
            data.ruleType === "TimeOrCopies" &&
            data.warrantyCopyLimit == null
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["warrantyCopyLimit"],
                message: "Copy limit is required for Time Or Copies.",
            });
        }

        if (
            data.ruleType === "TimeOrHours" &&
            data.warrantyHourLimit == null
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["warrantyHourLimit"],
                message: "Hour limit is required for Time Or Hours.",
            });
        }
    });

export type CreateModelWarrantyForm = z.infer<
    typeof createModelWarrantySchema
>;