import { ModelDetailsPage } from "@/features/machine/pages";

interface PageProps {
    params: Promise<{ machineCode: string; modelCode: string }>;
}

export default async function Page({ params }: PageProps) {
    const { machineCode, modelCode } = await params;
    return <ModelDetailsPage machineCode={machineCode} modelCode={modelCode} />;
}