import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createMachine } from "../services";
import type {
    CreateMachineRequest,
    MachineResponse,
} from "../types/machine";

export function useCreateMachine() {
    const queryClient = useQueryClient();

    return useMutation<
        MachineResponse,
        Error,
        CreateMachineRequest
    >({
        mutationFn: createMachine,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["machines"],
            });
        },
    });
}