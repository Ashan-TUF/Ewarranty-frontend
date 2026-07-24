"use client";

import AppHeader from "@/components/layout/AppHeader";
import MachineForm from "../components/MachineForm";

export default function CreateMachinePage() {
    return (
        <>
            <AppHeader
                title="Machine Management"
                description="Register a new machine."
            />

            <main className="p-6">
                <MachineForm />
            </main>
        </>
    );
}