import WarrantyDetailsPage from "@/features/machine/pages/WarrantyDetailsPage";

interface PageProps {
    params: Promise<{
        machineCode: string;
        modelCode: string;
        warrantyTypeCode: string;
    }>;
}

export default async function Page({ params }: PageProps) {
    const { machineCode, modelCode, warrantyTypeCode } = await params;
    return (
        <WarrantyDetailsPage
            machineCode={machineCode}
            modelCode={modelCode}
            warrantyTypeCode={warrantyTypeCode}
        />
    );
}