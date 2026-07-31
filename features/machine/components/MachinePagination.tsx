"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface MachinePaginationProps {
    page: number;
    pageSize: number;
    totalItems: number;
    itemLabel?: string;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

export function MachinePagination({
    page,
    pageSize,
    totalItems,
    itemLabel = "machines",
    onPageChange,
    onPageSizeChange,
}: MachinePaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const rangeEnd = Math.min(page * pageSize, totalItems);

    const pageNumbers = getPageNumbers(page, totalPages);

    return (
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{rangeStart}</span>
                {"–"}
                <span className="font-medium text-foreground">{rangeEnd}</span> of{" "}
                <span className="font-medium text-foreground">{totalItems}</span> {itemLabel}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page</span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(v) => onPageSizeChange(Number(v))}
                    >
                        <SelectTrigger size="sm" className="w-[72px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    {pageNumbers.map((entry, idx) =>
                        entry === "ellipsis" ? (
                            <span
                                key={`ellipsis-${idx}`}
                                className="px-1.5 text-sm text-muted-foreground"
                            >
                                &hellip;
                            </span>
                        ) : (
                            <Button
                                key={entry}
                                type="button"
                                variant={entry === page ? "default" : "outline"}
                                size="icon-sm"
                                onClick={() => onPageChange(entry)}
                            >
                                {entry}
                            </Button>
                        )
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                        aria-label="Next page"
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function getPageNumbers(
    current: number,
    total: number
): (number | "ellipsis")[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [1];

    if (current > 3) pages.push("ellipsis");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push("ellipsis");

    pages.push(total);

    return pages;
}