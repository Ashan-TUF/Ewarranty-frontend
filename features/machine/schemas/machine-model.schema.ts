import { z } from "zod";

export const createMachineModelSchema = z.object({
    modelName: z.string().trim().min(1, "Model name is required."),
    description: z.string().optional(),
    colorType: z.string().optional(),
    networkType: z.string().optional(),
});

export type CreateMachineModelForm =
    z.infer<typeof createMachineModelSchema>;