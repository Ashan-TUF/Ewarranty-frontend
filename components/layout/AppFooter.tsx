"use client";

import { Copyright } from "lucide-react";

export default function AppFooter() {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-[9999] bg-white/2 backdrop-blur-3xl border-t">
            <div
                className="
                    relative
                    z-10
                    flex
                    items-center
                    justify-center
                    gap-1.5
                    px-6
                    py-3
                    text-xs
                    text-muted-foreground
                    backdrop-blur-3xl
                "
            >
                <Copyright className="size-3.5" />
                <span>2026</span>
                <span>-</span>
                <span>Developed by GD Department</span>
            </div>
        </footer>
    );
}