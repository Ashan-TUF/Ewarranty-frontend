import { z } from "zod";

export const colorTypeOptions = [
    "Color",
    "Monochrome",
] as const;

export const networkTypeOptions = [
    "Network",
    "USB",
    "Standalone",
] as const;

export const createMachineModelSchema = z.object({
    modelName: z.string().trim().min(1, "Model name is required."),
    description: z.string().optional(),
    colorType: z.string().min(1, "Color type is required."),
    networkType: z.string().min(1, "Network type is required."),
});

export type CreateMachineModelForm =
    z.infer<typeof createMachineModelSchema>;