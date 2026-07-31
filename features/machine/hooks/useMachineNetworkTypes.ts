import { useQuery } from "@tanstack/react-query";

import { getMachineNetworkTypes } from "../services";

export function useMachineNetworkTypes() {
    return useQuery({
        queryKey: ["machine-network-types"],
        queryFn: getMachineNetworkTypes,
        staleTime: 5 * 60 * 1000,
    });
}
