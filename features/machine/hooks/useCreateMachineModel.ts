import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createMachineModel } from "../services";

export function useCreateMachineModel() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: createMachineModel,

        onSuccess: (_, variables) => {

            queryClient.invalidateQueries({
                queryKey: [
                    "machine",
                    variables.machineCode,
                ],
            });

        },

    });

}