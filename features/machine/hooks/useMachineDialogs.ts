import { useState } from "react";

import type { MachineModelResponse } from "../types/machine";

export function useMachineDialogs() {
    /*
     * Model Details Dialog
     */
    const [selectedModel, setSelectedModel] =
        useState<MachineModelResponse | null>(null);

    const [
        isModelDialogOpen,
        setIsModelDialogOpen,
    ] = useState(false);

    /*
     * Add Warranty Dialog
     */
    const [warrantyModel, setWarrantyModel] =
        useState<MachineModelResponse | null>(null);

    const [
        isWarrantyDialogOpen,
        setIsWarrantyDialogOpen,
    ] = useState(false);

    /*
     * Handlers
     */
    function openModelDetails(
        model: MachineModelResponse
    ) {
        setSelectedModel(model);
        setIsModelDialogOpen(true);
    }

    function closeModelDetails() {
        setSelectedModel(null);
        setIsModelDialogOpen(false);
    }

    function handleModelDialogOpenChange(
        open: boolean
    ) {
        setIsModelDialogOpen(open);

        if (!open) {
            setSelectedModel(null);
        }
    }

    function openAddWarranty(
        model: MachineModelResponse
    ) {
        setWarrantyModel(model);
        setIsWarrantyDialogOpen(true);
    }

    function closeAddWarranty() {
        setWarrantyModel(null);
        setIsWarrantyDialogOpen(false);
    }

    function handleWarrantyDialogOpenChange(
        open: boolean
    ) {
        setIsWarrantyDialogOpen(open);

        if (!open) {
            setWarrantyModel(null);
        }
    }

    return {
        /*
         * Model Details
         */
        selectedModel,
        isModelDialogOpen,

        openModelDetails,
        closeModelDetails,
        handleModelDialogOpenChange,

        /*
         * Warranty
         */
        warrantyModel,
        isWarrantyDialogOpen,

        openAddWarranty,
        closeAddWarranty,
        handleWarrantyDialogOpenChange,
    };
}