export type WarrantyPeriodUnit = "Days" | "Months" | "Years";
export type WarrantyRuleType = "TimeOnly" | "CopyOnly" | "TimeOrHours";

export interface DemoWarranty {
    warrantyTypeCode: string;
    warrantyTypeName: string;
    warrantyPeriod: number;
    warrantyPeriodUnit: WarrantyPeriodUnit;
    warrantyCopyLimit?: number;
    warrantyHourLimit?: number;
    ruleType: WarrantyRuleType;
    description?: string;
    isActive: boolean;
    createdAt?: string;
}

export interface DemoModel {
    modelCode: string;
    modelName: string;
    description?: string;
    colorType?: "Color" | "Monochrome";
    networkType?: "Wired" | "Wireless" | "Standalone";
    warranties: DemoWarranty[];
}

export interface DemoMachine {
    machineCode: string;
    machineName: string;
    manufacturer: string;
    category: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    models: DemoModel[];
}

export const demoMachines: DemoMachine[] = [
    {
        machineCode: "MC000001",
        machineName: "Ricoh Copier",
        manufacturer: "Ricoh",
        category: "Copier",
        description: "Ricoh monochrome copier series.",
        isActive: true,
        createdAt: "2026-07-23T08:26:02Z",
        models: [
            {
                modelCode: "MM000001",
                modelName: "IM C3001",
                colorType: "Color",
                networkType: "Wireless",
                warranties: [
                    {
                        warrantyTypeCode: "WT000001",
                        warrantyTypeName: "Standard Warranty",
                        warrantyPeriod: 12,
                        warrantyPeriodUnit: "Months",
                        warrantyHourLimit: 5000,
                        ruleType: "TimeOrHours",
                        description: "Warranty expires after 12 months or 5000 hours",
                        isActive: true,
                        createdAt: "2026-07-23T08:30:00Z",
                    },
                ],
            },
        ],
    },
    {
        machineCode: "MC000002",
        machineName: "Canon ImageRunner",
        manufacturer: "Canon",
        category: "Multifunction Printer",
        description: "A3 multifunction device for high-volume offices.",
        isActive: true,
        createdAt: "2026-07-20T10:12:00Z",
        models: [
            {
                modelCode: "MM000002",
                modelName: "iR2625",
                colorType: "Monochrome",
                networkType: "Wired",
                warranties: [
                    {
                        warrantyTypeCode: "WT000002",
                        warrantyTypeName: "Extended Warranty",
                        warrantyPeriod: 24,
                        warrantyPeriodUnit: "Months",
                        ruleType: "TimeOnly",
                        isActive: true,
                    },
                    {
                        warrantyTypeCode: "WT000001",
                        warrantyTypeName: "Standard Warranty",
                        warrantyPeriod: 50000,
                        warrantyPeriodUnit: "Days",
                        ruleType: "CopyOnly",
                        isActive: false,
                    },
                ],
            },
        ],
    },
    {
        machineCode: "MC000003",
        machineName: "Epson EcoTank Printer",
        manufacturer: "Epson",
        category: "Printer",
        description: "Ink tank printer for low cost-per-page printing.",
        isActive: true,
        createdAt: "2026-07-18T09:05:00Z",
        models: [
            {
                modelCode: "MM000003",
                modelName: "L15150",
                colorType: "Color",
                networkType: "Wireless",
                warranties: [
                    {
                        warrantyTypeCode: "WT000001",
                        warrantyTypeName: "Standard Warranty",
                        warrantyPeriod: 12,
                        warrantyPeriodUnit: "Months",
                        ruleType: "TimeOnly",
                        isActive: true,
                    },
                ],
            },
        ],
    },
    {
        machineCode: "MC000004",
        machineName: "BenQ Meeting Projector",
        manufacturer: "BenQ",
        category: "Projector",
        description: "4K laser projector for training rooms.",
        isActive: true,
        createdAt: "2026-07-15T14:40:00Z",
        models: [
            {
                modelCode: "MM000004",
                modelName: "LK936ST",
                networkType: "Wireless",
                warranties: [
                    {
                        warrantyTypeCode: "WT000003",
                        warrantyTypeName: "Lamp Warranty",
                        warrantyPeriod: 6,
                        warrantyPeriodUnit: "Months",
                        ruleType: "TimeOnly",
                        isActive: true,
                    },
                ],
            },
        ],
    },
    {
        machineCode: "MC000005",
        machineName: "Konica Minolta Duplicator",
        manufacturer: "Konica Minolta",
        category: "Duplicator",
        description: "High-speed digital duplicator.",
        isActive: false,
        createdAt: "2026-07-10T11:00:00Z",
        models: [
            {
                modelCode: "MM000005",
                modelName: "RISO CZ180",
                colorType: "Monochrome",
                networkType: "Standalone",
                warranties: [],
            },
        ],
    },
    {
        machineCode: "MC000006",
        machineName: "Fujitsu Document Scanner",
        manufacturer: "Fujitsu",
        category: "Scanner",
        description: "High-speed document scanner for archiving.",
        isActive: true,
        createdAt: "2026-07-05T16:22:00Z",
        models: [
            {
                modelCode: "MM000006",
                modelName: "fi-8170",
                colorType: "Color",
                networkType: "Wired",
                warranties: [
                    {
                        warrantyTypeCode: "WT000002",
                        warrantyTypeName: "Extended Warranty",
                        warrantyPeriod: 3,
                        warrantyPeriodUnit: "Years",
                        ruleType: "TimeOnly",
                        isActive: true,
                    },
                ],
            },
        ],
    },
    {
        machineCode: "MC000007",
        machineName: "HP LaserJet Printer",
        manufacturer: "HP",
        category: "Printer",
        description: "Compact monochrome laser printer.",
        isActive: true,
        createdAt: "2026-06-28T08:15:00Z",
        models: [
            {
                modelCode: "MM000007",
                modelName: "M404dn",
                colorType: "Monochrome",
                networkType: "Wired",
                warranties: [
                    {
                        warrantyTypeCode: "WT000001",
                        warrantyTypeName: "Standard Warranty",
                        warrantyPeriod: 12,
                        warrantyPeriodUnit: "Months",
                        ruleType: "TimeOnly",
                        isActive: true,
                    },
                ],
            },
        ],
    },
    {
        machineCode: "MC000008",
        machineName: "Xerox WorkCentre",
        manufacturer: "Xerox",
        category: "Multifunction Printer",
        description: "All-in-one print, scan, copy, fax device.",
        isActive: true,
        createdAt: "2026-06-20T13:50:00Z",
        models: [
            {
                modelCode: "MM000008",
                modelName: "WC6515",
                colorType: "Color",
                networkType: "Wireless",
                warranties: [
                    {
                        warrantyTypeCode: "WT000001",
                        warrantyTypeName: "Standard Warranty",
                        warrantyPeriod: 12,
                        warrantyPeriodUnit: "Months",
                        ruleType: "TimeOrHours",
                        isActive: true,
                    },
                    {
                        warrantyTypeCode: "WT000004",
                        warrantyTypeName: "On-site Service",
                        warrantyPeriod: 60000,
                        warrantyPeriodUnit: "Days",
                        ruleType: "CopyOnly",
                        isActive: true,
                    },
                ],
            },
        ],
    },
];