"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    className?: string;
}

export function PageState({
    title,
    description,
    icon,
    actionLabel,
    actionHref,
    onAction,
    className,
}: PageStateProps) {
    return (
        <div className={cn("rounded-xl border border-dashed px-4 py-8 text-center sm:py-10", className)}>
            {icon ? (
                <div className="mb-2 flex justify-center text-muted-foreground">
                    {icon}
                </div>
            ) : null}

            <p className="text-sm font-normal">{title}</p>

            {description ? (
                <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                </p>
            ) : null}

            {actionLabel ? (
                <div className="mt-3">
                    {actionHref ? (
                        <Link href={actionHref}>
                            <Button type="button" variant="outline" size="sm">
                                {actionLabel}
                            </Button>
                        </Link>
                    ) : (
                        <Button type="button" variant="outline" size="sm" onClick={onAction}>
                            {actionLabel}
                        </Button>
                    )}
                </div>
            ) : null}
        </div>
    );
}
