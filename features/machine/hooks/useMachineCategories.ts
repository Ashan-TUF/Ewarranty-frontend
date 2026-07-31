import { useQuery } from "@tanstack/react-query";

import { getMachineCategories } from "../services";

export function useMachineCategories() {
    return useQuery({
        queryKey: ["machine-categories"],
        queryFn: getMachineCategories,
        staleTime: 5 * 60 * 1000,
    });
}
