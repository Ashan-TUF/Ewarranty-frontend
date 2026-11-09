import { Eye, MoreHorizontal, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatWarrantyDate, formatWarrantyDuration } from "./warranty-format";
import type { AccessoryWarranty } from "./warranty";

interface Props {
  warranty: AccessoryWarranty;
  onView: (warranty: AccessoryWarranty) => void;
  onEdit: (warranty: AccessoryWarranty) => void;
  onChangeStatus: (warranty: AccessoryWarranty) => void;
  statusPending: boolean;
}

export function AccessoryWarrantyCard({ warranty, onView, onEdit, onChangeStatus, statusPending }: Props) {
  return <Card size="sm" className="min-w-0 gap-2.5 py-3 transition-[box-shadow] duration-200 hover:shadow-sm motion-reduce:transition-none">
    <CardHeader className="min-w-0 px-3.5">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0"><CardTitle className="line-clamp-2 break-words text-[13px] leading-5" title={warranty.accessoryName}>{warranty.accessoryName}</CardTitle><p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground" title={warranty.accessoryCode}>{warranty.accessoryCode}</p></div>
        <Badge variant={warranty.isActive ? "secondary" : "destructive"} className="shrink-0 text-[10px]">{warranty.isActive ? "Active" : "Inactive"}</Badge>
      </div>
    </CardHeader>
    <CardContent className="flex flex-col gap-2.5 px-3.5 text-xs">
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        <div className="col-span-2 min-w-0"><p className="text-[10px] text-muted-foreground">Warranty Type</p><p className="truncate font-medium" title={warranty.warrantyTypeName}>{warranty.warrantyTypeName}</p></div>
        <div><p className="text-[10px] text-muted-foreground">Duration</p><p className="font-medium">{formatWarrantyDuration(warranty.duration, warranty.durationUnit)}</p></div>
        <div><p className="text-[10px] text-muted-foreground">Created</p><p className="font-medium">{formatWarrantyDate(warranty.createdAt)}</p></div>
        {warranty.updatedAt && <div className="col-span-2"><p className="text-[10px] text-muted-foreground">Updated</p><p className="font-medium">{formatWarrantyDate(warranty.updatedAt)}</p></div>}
      </div>
      <div className="flex items-center justify-end gap-0.5 border-t pt-2">
        <TooltipProvider><Tooltip><TooltipTrigger render={<Button type="button" size="icon-sm" variant="ghost" aria-label={`View warranty for ${warranty.accessoryName}`} onClick={() => onView(warranty)} />}><Eye className="size-3.5" /></TooltipTrigger><TooltipContent>View warranty</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger render={<Button type="button" size="icon-sm" variant="ghost" aria-label={`Edit warranty for ${warranty.accessoryName}`} onClick={() => onEdit(warranty)} />}><Pencil className="size-3.5" /></TooltipTrigger><TooltipContent>Edit warranty</TooltipContent></Tooltip>
        <DropdownMenu><DropdownMenuTrigger render={<Button type="button" size="icon-sm" variant="ghost" disabled={statusPending} aria-label={`More actions for ${warranty.accessoryName}`} />}><MoreHorizontal className="size-4" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onChangeStatus(warranty)}>{warranty.isActive ? "Deactivate" : "Activate"} warranty</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TooltipProvider>
      </div>
    </CardContent>
  </Card>;
}
