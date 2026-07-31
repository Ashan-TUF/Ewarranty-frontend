import { useQuery } from "@tanstack/react-query";

import { getMachineColorTypes } from "../services";

export function useMachineColorTypes() {
    return useQuery({
        queryKey: ["machine-color-types"],
        queryFn: getMachineColorTypes,
        staleTime: 5 * 60 * 1000,
    });
}
