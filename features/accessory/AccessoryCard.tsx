import { Eye, Pencil, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AccessoryWarrantyAction } from "./AccessoryWarrantyAction";
import type { AccessoryWarranty } from "./warranty";
import type { AccessoryListItem } from "./types";

interface AccessoryCardProps {
  item: AccessoryListItem;
  warranty?: AccessoryWarranty | null;
  onView: () => void;
  onEdit: () => void;
  onChangeStatus: () => void;
  statusPending?: boolean;
}

export function AccessoryCard({ item, warranty, onView, onEdit, onChangeStatus, statusPending = false }: AccessoryCardProps) {
  return <Card size="sm" className="min-h-40 transition-colors hover:ring-foreground/20">
    <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
      <div className="min-w-0"><CardTitle className="truncate" title={item.accessoryName}>{item.accessoryName}</CardTitle><span className="text-xs font-normal text-muted-foreground">{item.accessoryCode}</span></div>
      <TooltipProvider><div className="flex shrink-0 items-center gap-0.5" onClick={(event) => event.stopPropagation()}>
        <Tooltip><TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" className="size-[26px] shrink-0 p-0 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="View Accessory" onClick={onView} />}><Eye className="size-3.5" /></TooltipTrigger><TooltipContent side="bottom">View Accessory</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" className="size-[26px] shrink-0 p-0 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Edit Accessory" onClick={onEdit} />}><Pencil className="size-3.5" /></TooltipTrigger><TooltipContent side="bottom">Edit Accessory</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" className="size-[26px] shrink-0 p-0 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={item.isActive ? "Deactivate Accessory" : "Activate Accessory"} disabled={statusPending} onClick={onChangeStatus} />}><Power className="size-3.5" /></TooltipTrigger><TooltipContent side="bottom">{item.isActive ? "Deactivate Accessory" : "Activate Accessory"}</TooltipContent></Tooltip>
      </div></TooltipProvider>
    </CardHeader>
    <CardContent className="flex flex-1 flex-col gap-2 text-xs"><div><span className="text-muted-foreground">Accessory Type</span><p>{item.accessoryTypeName}</p></div><p className="line-clamp-2 min-h-8 text-muted-foreground" title={item.description || undefined}>{item.description || "No description"}</p><div className="mt-auto border-t pt-2"><span className="text-muted-foreground">Assigned Models</span><p>{item.assignedModelCount}</p></div><div className="border-t pt-2"><AccessoryWarrantyAction accessory={item} known={warranty} /></div><div className="border-t pt-2"><Badge variant={item.isActive ? "secondary" : "destructive"}>{item.isActive ? "Active" : "Inactive"}</Badge></div></CardContent>
  </Card>;
}


