import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createInstallationReport } from "../services";
import type { CreateInstallationReportRequest } from "../types/installation-report";

export function useSubmitInstallationReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateInstallationReportRequest) =>
            createInstallationReport(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["installation-reports"],
            });
        },
    });
}
