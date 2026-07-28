import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { createWarrantyType } from "../services/warranty.service";

export function useCreateWarrantyType() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createWarrantyType,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["warranty-types"],
            });
        },
    });
}