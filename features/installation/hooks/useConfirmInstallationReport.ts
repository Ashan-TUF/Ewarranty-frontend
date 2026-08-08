import { useMutation, useQueryClient } from "@tanstack/react-query";

import { confirmInstallationReport } from "../services";
import type { ConfirmInstallationReportRequest } from "../types/installation-report";

export function useConfirmInstallationReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: ConfirmInstallationReportRequest }) =>
            confirmInstallationReport(id, payload),
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({
                queryKey: ["installation-reports"],
            });

            await queryClient.invalidateQueries({
                queryKey: ["installation-report", variables.id],
            });
        },
    });
}
