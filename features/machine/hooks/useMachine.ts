import { useQuery } from "@tanstack/react-query";

import { getMachines } from "../services";

export function useMachines() {
    return useQuery({
        queryKey: ["machines"],

        queryFn: () =>
            getMachines({
                page: 1,
                pageSize: 100,
            }),
    });
}

export function useMachine(machineCode: string) {
    return useQuery({
        queryKey: ["machine", machineCode],

        enabled: !!machineCode,

        queryFn: async () => {
            const response = await getMachines({
                machineCode,
                page: 1,
                pageSize: 1,
            });

            return response.items[0] ?? null;
        },
    });
}