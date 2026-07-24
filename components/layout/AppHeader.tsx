"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface AppHeaderProps {
    title: string;
    description?: string;
}

export default function AppHeader({
    title,
    description,
}: AppHeaderProps) {
    return (
        <header className="sticky top-0 z-40 border-b bg-background">
            <div className="flex h-16 items-center gap-4 px-6">

                <SidebarTrigger />

                <Separator
                    orientation="vertical"
                    className="h-6"
                />

                <div className="flex flex-col">
                    <h1 className="text-xl font-semibold">
                        {title}
                    </h1>

                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>

                <div className="ml-auto flex items-center gap-3">
                    {/* Theme Toggle */}
                    {/* Notification */}
                    {/* User Menu */}
                </div>

            </div>
        </header>
    );
}