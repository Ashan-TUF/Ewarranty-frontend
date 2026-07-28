import { useQuery } from "@tanstack/react-query";

import { getWarrantyTypes } from "../services/warranty.service";

export function useWarrantyTypes() {
    return useQuery({
        queryKey: ["warranty-types"],
        queryFn: getWarrantyTypes,
    });
}