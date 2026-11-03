import { Boxes, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AccessoryListItem } from "./types";

interface AccessoryCardProps {
  item: AccessoryListItem;
  onView: () => void;
  onEdit: () => void;
  onChangeStatus: () => void;
}

export function AccessoryCard({ item, onView, onEdit, onChangeStatus }: AccessoryCardProps) {
  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-border bg-card p-4 transition-colors duration-200 hover:border-primary/40 motion-reduce:transition-none">
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
          <Package className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[13px] leading-5 font-normal text-foreground">{item.accessoryName}</h3>
          <p className="text-[11px] font-normal text-muted-foreground">{item.accessoryCode}</p>
        </div>
        <Badge variant={item.isActive ? "secondary" : "destructive"} className="h-5 shrink-0 gap-1 px-1.5 text-[10px] font-normal">
          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
          {item.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <p className="mt-3 line-clamp-2 min-h-8 text-[11px] leading-4 font-normal text-muted-foreground">
        {item.description || "No description available"}
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 border-t border-border/70 pt-3">
        <span className="flex items-center gap-1.5 text-[11px] font-normal text-muted-foreground">
          <Boxes className="size-3.5" aria-hidden="true" />
          {item.assignedModelCount} {item.assignedModelCount === 1 ? "model" : "models"}
        </span>
        <div className="flex flex-wrap items-center gap-1">
          <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px] font-normal" onClick={onView}>View</Button>
          <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px] font-normal" onClick={onEdit}>Edit</Button>
          <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px] font-normal" onClick={onChangeStatus}>{item.isActive ? "Deactivate" : "Activate"}</Button>
        </div>
      </div>
    </article>
  );
}
