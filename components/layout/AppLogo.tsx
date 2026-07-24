"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { ROUTES } from "@/constants/routes";

export default function AppLogo() {
    return (
        <Link
            href={ROUTES.DASHBOARD}
            className="flex items-center gap-3"
        >
            <ShieldCheck className="size-8 text-primary" />

            <div className="flex flex-col">
                <span className="font-bold">
                    eWarranty
                </span>

                <span className="text-xs text-muted-foreground">
                    Management System
                </span>
            </div>
        </Link>
    );
}