import { useQuery } from "@tanstack/react-query";

import { getInstallationReportById } from "../services";

export function useInstallationReport(id: number) {
    return useQuery({
        queryKey: ["installation-report", id],
        queryFn: () => getInstallationReportById(id),
        enabled: Number.isFinite(id) && id > 0,
    });
}
