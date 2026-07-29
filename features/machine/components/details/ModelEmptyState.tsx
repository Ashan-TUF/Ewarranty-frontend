"use client";

interface ModelEmptyStateProps {
    hasModels: boolean;
}

export function ModelEmptyState({
    hasModels,
}: ModelEmptyStateProps) {
    return (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20">
            <div className="space-y-2 text-center">
                <h3 className="text-lg font-semibold">
                    {hasModels
                        ? "No matching models found"
                        : "No models available"}
                </h3>

                <p className="max-w-md text-sm text-muted-foreground">
                    {hasModels
                        ? "Try searching with a different model name or code."
                        : "This machine doesn't have any registered models yet. Click 'Add Model' to create the first model."}
                </p>
            </div>
        </div>
    );
}