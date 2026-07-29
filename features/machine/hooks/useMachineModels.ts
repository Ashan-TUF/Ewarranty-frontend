import { useMemo, useState } from "react";

import type { MachineModelResponse } from "../types/machine";

interface UseMachineModelsProps {
    models: MachineModelResponse[];
}

export function useMachineModels({
    models,
}: UseMachineModelsProps) {
    const [keyword, setKeyword] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filteredModels = useMemo(() => {
        const search = keyword.trim().toLowerCase();

        if (!search) {
            return models;
        }

        return models.filter((model) => {
            const searchable = [
                model.modelCode,
                model.modelName,
                model.description ?? "",
                model.colorType ?? "",
                model.networkType ?? "",
            ]
                .join(" ")
                .toLowerCase();

            return searchable.includes(search);
        });
    }, [models, keyword]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredModels.length / pageSize)
    );

    const currentPage = Math.min(page, totalPages);

    const paginatedModels = useMemo(() => {
        const start = (currentPage - 1) * pageSize;

        return filteredModels.slice(start, start + pageSize);
    }, [filteredModels, currentPage, pageSize]);

    function handleKeywordChange(value: string) {
        setKeyword(value);
        setPage(1);
    }

    function handlePageSizeChange(nextPageSize: number) {
        setPageSize(nextPageSize);
        setPage(1);
    }

    return {
        keyword,
        page,
        pageSize,

        filteredModels,
        paginatedModels,

        currentPage,

        setPage,

        handleKeywordChange,
        handlePageSizeChange,
    };
}