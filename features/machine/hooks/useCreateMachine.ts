import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { createMachine } from "../services/machine.service";

export function useCreateMachine() {
    return useMutation({
        mutationFn: createMachine,

        onSuccess() {
            toast.success("Machine created successfully.");
        },

        onError() {
            toast.error("Failed to create machine.");
        },
    });
}