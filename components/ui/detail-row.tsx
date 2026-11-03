import type { ReactNode } from "react";

interface DetailRowProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}

export function DetailRow({ label, value, icon }: DetailRowProps) {
  return <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 py-2 text-xs font-normal">
    <span className="min-w-28 text-xs font-normal text-muted-foreground">{label}</span>
    <span className="flex min-w-0 items-center gap-2 break-words text-xs font-normal text-foreground">
      {icon && <span className="shrink-0 text-primary [&_svg]:size-4">{icon}</span>}
      {value}
    </span>
  </div>;
}
