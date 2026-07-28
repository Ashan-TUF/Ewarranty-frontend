import { useMutation } from "@tanstack/react-query";

import type { CreateModelWarrantyForm } from "../schemas/model-warranty.schema";
import { createModelWarranty } from "../services/warranty.service";

export function useCreateModelWarranty(
    machineCode: string,
    modelCode: string
) {
    return useMutation({
        mutationFn: (payload: CreateModelWarrantyForm) =>
            createModelWarranty(
                machineCode,
                modelCode,
                payload
            ),
    });
}