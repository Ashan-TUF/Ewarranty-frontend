"use client";

interface MachineStatProps {
    label: string;
    value: React.ReactNode;
}

export function MachineStat({
    label,
    value,
}: MachineStatProps) {
    return (
        <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
            <p className="text-[11px] font-normal uppercase tracking-wide text-muted-foreground">
                {label}
            </p>

            <div className="mt-0.5 text-[13px] font-normal break-words">
                {value}
            </div>
        </div>
    );
}
