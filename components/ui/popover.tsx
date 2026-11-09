"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

function PopoverContent({ className, children, ...props }: PopoverPrimitive.Popup.Props) {
  return <PopoverPrimitive.Portal><PopoverPrimitive.Positioner side="bottom" align="start" sideOffset={4} collisionPadding={8} collisionAvoidance={{ side: "flip", align: "shift" }} className="isolate z-[60] outline-none"><PopoverPrimitive.Popup className={cn("z-[60] w-(--anchor-width) max-w-[calc(100vw-1rem)] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none", className)} {...props}>{children}</PopoverPrimitive.Popup></PopoverPrimitive.Positioner></PopoverPrimitive.Portal>;
}

export { Popover, PopoverTrigger, PopoverContent };
