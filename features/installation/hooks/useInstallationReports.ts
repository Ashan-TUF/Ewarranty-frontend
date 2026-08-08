import { useQuery } from "@tanstack/react-query";

import { getInstallationReports } from "../services";
import type { InstallationReportSearchRequest } from "../types/installation-report";

export function useInstallationReports(params?: InstallationReportSearchRequest) {
    return useQuery({
        queryKey: ["installation-reports", params],
        queryFn: () => getInstallationReports(params),
    });
}
