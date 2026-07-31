import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import type { CreateModelWarrantyForm } from "../schemas/model-warranty.schema";
import { createModelWarranty } from "../services";

export function useCreateModelWarranty(
    machineCode: string,
    modelCode: string
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateModelWarrantyForm) =>
            createModelWarranty(
                machineCode,
                modelCode,
                payload
            ),

        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["machine", machineCode],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["machines"],
                }),
            ]);
        },
    });
}