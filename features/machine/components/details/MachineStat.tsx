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
        <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>

            <div className="mt-2 text-lg font-semibold break-words">
                {value}
            </div>
        </div>
    );
}