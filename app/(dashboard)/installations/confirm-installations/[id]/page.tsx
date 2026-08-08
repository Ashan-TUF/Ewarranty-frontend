import { InstallationReportDetailsPage } from "@/features/installation/confirm-installation";

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <InstallationReportDetailsPage id={Number(id)} />;
}
