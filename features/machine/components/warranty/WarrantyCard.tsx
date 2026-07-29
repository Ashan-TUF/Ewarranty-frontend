import Link from "next/link";
import type { ElementType } from "react";
import {
    ArrowRight,
    Clock3,
    Copy,
    Gauge,
    ShieldCheck,
    ShieldX,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { WarrantyResponse } from "../../types/machine";

interface WarrantyCardProps {
    machineCode: string;
    modelCode: string;
    warranty: WarrantyResponse;
}

export function WarrantyCard({
    machineCode,
    modelCode,
    warranty,
}: WarrantyCardProps) {
    const href =
        ROUTES.MACHINE_MODEL_WARRANTY_DETAILS(
            machineCode,
            modelCode,
            warranty.warrantyTypeCode
        );

    return (
        <Card className="group border-border/70 bg-card/80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md">
            <Link href={href} className="block">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                {warranty.isActive ? (
                                    <ShieldCheck className="size-5 shrink-0 text-emerald-500" />
                                ) : (
                                    <ShieldX className="size-5 shrink-0 text-muted-foreground" />
                                )}

                                <CardTitle className="truncate text-base">
                                    {warranty.warrantyTypeName}
                                </CardTitle>
                            </div>

                            <Badge
                                variant="outline"
                                className="mt-2 font-mono text-[11px]"
                            >
                                {warranty.warrantyTypeCode}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge
                                variant={
                                    warranty.isActive
                                        ? "secondary"
                                        : "outline"
                                }
                            >
                                {warranty.isActive
                                    ? "Active"
                                    : "Inactive"}
                            </Badge>

                            <ArrowRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid gap-2 sm:grid-cols-2">
                        <InfoItem
                            icon={Clock3}
                            label="Warranty Period"
                            value={`${warranty.warrantyPeriod} ${warranty.warrantyPeriodUnit}`}
                        />

                        <InfoItem
                            icon={ShieldCheck}
                            label="Rule Type"
                            value={formatRuleType(
                                warranty.ruleType
                            )}
                        />

                        {warranty.warrantyCopyLimit !=
                            null && (
                                <InfoItem
                                    icon={Copy}
                                    label="Copy Limit"
                                    value={warranty.warrantyCopyLimit.toLocaleString()}
                                />
                            )}

                        {warranty.warrantyHourLimit !=
                            null && (
                                <InfoItem
                                    icon={Gauge}
                                    label="Hour Limit"
                                    value={`${warranty.warrantyHourLimit.toLocaleString()} hrs`}
                                />
                            )}
                    </div>

                    {warranty.description && (
                        <div className="border-t border-border/60 pt-3">
                            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                                {warranty.description}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Link>
        </Card>
    );
}

interface InfoItemProps {
    icon: ElementType;
    label: string;
    value: string;
}

function InfoItem({
    icon: Icon,
    label,
    value,
}: InfoItemProps) {
    return (
        <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">
                {label}
            </p>

            <div className="mt-1 flex items-center gap-2">
                <Icon className="size-4 text-primary" />

                <p className="text-sm font-medium">
                    {value}
                </p>
            </div>
        </div>
    );
}

function formatRuleType(ruleType: string) {
    const labels: Record<string, string> = {
        TimeOnly: "Time Only",
        TimeOrCopies: "Time or Copies",
        TimeOrHours: "Time or Hours",
    };

    return labels[ruleType] ?? ruleType;
}