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

interface InstallationPaginationProps {
    page: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (nextPage: number) => void;
    onPageSizeChange: (nextPageSize: number) => void;
}

export function InstallationPagination({
    page,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
}: InstallationPaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const rangeEnd = Math.min(page * pageSize, totalItems);

    return (
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{rangeStart}</span>
                {" - "}
                <span className="font-medium text-foreground">{rangeEnd}</span> of{" "}
                <span className="font-medium text-foreground">{totalItems}</span> reports
            </p>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows</span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(value) => onPageSizeChange(Number(value))}
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

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    <span className="min-w-[74px] text-center text-sm text-muted-foreground">
                        Page {page} / {totalPages}
                    </span>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                        aria-label="Next page"
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
