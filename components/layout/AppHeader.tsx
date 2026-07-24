"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { MoonStar, SunMedium } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/providers/ThemeProvider";

interface AppHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export default function AppHeader({
    title,
    description,
    actions,
}: AppHeaderProps) {
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-40 border-b bg-background transition-colors duration-300 ease-out">
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
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ duration: 0.18 }}>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={toggleTheme}
                            aria-label="Toggle color theme"
                            title="Toggle color theme"
                            className="transition-colors duration-300 ease-out"
                        >
                            <motion.span
                                key={resolvedTheme}
                                initial={{ rotate: -25, scale: 0.85, opacity: 0 }}
                                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                exit={{ rotate: 25, scale: 0.85, opacity: 0 }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                                className="flex items-center justify-center"
                            >
                                {resolvedTheme === "dark" ? (
                                    <SunMedium className="size-4" />
                                ) : (
                                    <MoonStar className="size-4" />
                                )}
                            </motion.span>
                        </Button>
                    </motion.div>

                    {actions}
                </div>

            </div>
        </header>
    );
}