import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateInstallationReport } from "../services";
import type { UpdateInstallationReportRequest } from "../types/installation-report";

export function useUpdateInstallationReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: number;
            payload: UpdateInstallationReportRequest;
        }) => updateInstallationReport(id, payload),
        onSuccess: async (_data, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["installation-reports"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["installation-report", variables.id],
                }),
            ]);
        },
    });
}
