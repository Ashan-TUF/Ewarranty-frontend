"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Command({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("flex flex-col", className)} {...props} />; }
const CommandInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(function CommandInput({ className, ...props }, ref) { return <input ref={ref} className={cn("h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40", className)} {...props} />; });
function CommandList({ className, ...props }: React.ComponentProps<"div">) { return <div role="listbox" className={cn("max-h-64 overflow-y-auto overscroll-contain touch-pan-y", className)} {...props} />; }
function CommandGroup({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("p-1", className)} {...props} />; }
function CommandEmpty({ className, ...props }: React.ComponentProps<"p">) { return <p className={cn("px-2 py-3 text-center text-xs text-muted-foreground", className)} {...props} />; }
function CommandItem({ className, "aria-selected": selected = false, ...props }: React.ComponentProps<"button">) { return <button type="button" role="option" aria-selected={selected} className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground", className)} {...props} />; }

export { Command, CommandInput, CommandList, CommandGroup, CommandEmpty, CommandItem };
