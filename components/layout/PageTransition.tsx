"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
    children: React.ReactNode;
}

export default function PageTransition({
    children,
}: PageTransitionProps) {
    const pathname = usePathname();

    const pageTitle = useMemo(() => {
        const routeTitleMap: Record<string, string> = {
            "/dashboard": "Dashboard",
            "/machines": "Machines",
            "/machine-models": "Machine Models",
            "/warranties": "Warranties",
            "/installations": "Installations",
            "/installations/summary": "Installation Summary",
            "/installations/confirm-installations": "Confirm Installations",
            "/installations/submit-installations": "Submit Installations",
            "/customers": "Customers",
            "/login": "Login",
        };

        if (pathname === "/") {
            return "Home";
        }

        if (routeTitleMap[pathname]) {
            return routeTitleMap[pathname];
        }

        if (pathname.startsWith("/installations/confirm-installations/")) {
            return "Installation Report Details";
        }

        if (
            pathname.startsWith("/machines/") &&
            pathname.includes("/warranties/")
        ) {
            return "Warranty Details";
        }

        if (
            pathname.startsWith("/machines/") &&
            pathname.includes("/models/")
        ) {
            return "Model Details";
        }

        if (pathname.startsWith("/machines/")) {
            return "Machine Details";
        }

        return (
            pathname
                .split("/")
                .filter(Boolean)
                .pop()
                ?.replace(/-/g, " ")
                .replace(/\b\w/g, (char) =>
                    char.toUpperCase()
                ) ?? "Page"
        );
    }, [pathname]);

    return (
        <>
            <RouteTitleOverlay
                title={pageTitle}
                trigger={pathname}
            />

            <motion.main
                key={pathname}
                initial={{
                    opacity: 0,
                    scale: 0.985,
                    y: 18,
                    filter: "blur(10px)",
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    filter: "blur(0px)",
                }}
                transition={{
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                }}
                className="flex-1 overflow-y-auto scroll-smooth"
            >
                {children}
            </motion.main>
        </>
    );
}

interface RouteTitleOverlayProps {
    title: string;
    trigger: string;
}

function RouteTitleOverlay({
    title,
    trigger,
}: RouteTitleOverlayProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const showTimer = setTimeout(() => {
            setVisible(true);
        }, 0);

        const hideTimer = setTimeout(() => {
            setVisible(false);
        }, 650);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [trigger]);

    return (
        <AnimatePresence mode="wait">
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 0.25,
                    }}
                    className="
                        pointer-events-none
                        fixed
                        inset-0
                        z-[999]
                        flex
                        items-center
                        justify-center
                        bg-background/15
                        backdrop-blur-2xl
                        backdrop-saturate-150
                    "
                >
                    <motion.h1
                        initial={{
                            opacity: 0,
                            y: 32,
                            scale: 0.92,
                            filter: "blur(18px)",
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            filter: "blur(0px)",
                        }}
                        exit={{
                            opacity: 0,
                            y: -24,
                            scale: 1.04,
                            filter: "blur(14px)",
                        }}
                        transition={{
                            duration: 0.45,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="
                            select-none
                            bg-gradient-to-r
                            from-primary
                            via-foreground
                            to-primary
                            bg-clip-text
                            text-center
                            text-6xl
                            font-black
                            tracking-tight
                            text-transparent
                            md:text-7xl
                        "
                    >
                        {title}
                    </motion.h1>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
