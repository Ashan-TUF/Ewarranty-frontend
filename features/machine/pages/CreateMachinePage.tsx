"use client";

import AppHeader from "@/components/layout/AppHeader";
import { MachineForm } from "@/features/machine/components";

export default function CreateMachinePage() {
    return (
        <>
            <AppHeader
                title="Machine Management"
                description="Register a new machine."
            />

            <main className="p-4 sm:p-6">
                <MachineForm />
            </main>
        </>
    );
}