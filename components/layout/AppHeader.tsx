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
    const { toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-40 border-b bg-background transition-colors duration-300 ease-out">
            <div className="flex min-h-16 items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-0">
                <SidebarTrigger />

                <Separator
                    orientation="vertical"
                    className="h-6"
                />

                <div className="min-w-0 flex-1 sm:flex-none">
                    <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>

                    {description && (
                        <p className="hidden text-sm text-muted-foreground md:block">
                            {description}
                        </p>
                    )}
                </div>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                    <motion.div
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                    >
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={toggleTheme}
                            aria-label="Toggle color theme"
                            title="Toggle color theme"
                            className="relative transition-colors duration-300 ease-out"
                        >
                            <motion.span
                                initial={{
                                    rotate: -25,
                                    scale: 0.85,
                                    opacity: 0,
                                }}
                                animate={{
                                    rotate: 0,
                                    scale: 1,
                                    opacity: 1,
                                }}
                                transition={{
                                    duration: 0.18,
                                    ease: "easeOut",
                                }}
                                className="flex items-center justify-center"
                            >
                                <SunMedium className="hidden size-4 dark:block" />
                                <MoonStar className="block size-4 dark:hidden" />
                            </motion.span>
                        </Button>
                    </motion.div>

                    <div className="hidden sm:block">
                        {actions}
                    </div>
                </div>
            </div>

            {actions && (
                <div className="border-t px-4 py-2 sm:hidden">
                    <div className="flex items-center justify-end">
                        {actions}
                    </div>
                </div>
            )}
        </header>
    );
}