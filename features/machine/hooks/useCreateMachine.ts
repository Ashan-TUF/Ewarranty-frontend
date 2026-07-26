import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { createMachine } from "../services/machine.service";
import { ApiResponse, MachineApiResponse } from "../types/machine";

function getErrorMessage(error: unknown) {
    if (typeof error !== "object" || error === null) {
        return "Failed to create machine.";
    }

    const response = error as {
        response?: {
            data?: {
                message?: string;
                error?: string;
                errors?: Record<string, string[]>;
            };
        };
        message?: string;
    };

    const data = response.response?.data;

    if (data?.errors) {
        const firstFieldError = Object.values(data.errors)[0]?.[0];
        if (firstFieldError) {
            return firstFieldError;
        }
    }

    return data?.message ?? data?.error ?? response.message ?? "Failed to create machine.";
}

export function useCreateMachine() {
    return useMutation({
        mutationFn: createMachine,

        onSuccess(data: ApiResponse<MachineApiResponse>) {
            if (data.success) {
                toast.success(data.message || "Machine created successfully.");
                return;
            }

            toast.error(data.message || "Failed to create machine.");
        },

        onError(error) {
            toast.error(getErrorMessage(error));
        },
    });
}