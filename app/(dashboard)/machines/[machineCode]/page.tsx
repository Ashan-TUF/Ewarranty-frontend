import { MachineDetailsPage } from "@/features/machine/pages";

interface PageProps {
    params: Promise<{ machineCode: string }>;
}

export default async function Page({ params }: PageProps) {
    const { machineCode } = await params;
    return <MachineDetailsPage machineCode={machineCode} />;
}