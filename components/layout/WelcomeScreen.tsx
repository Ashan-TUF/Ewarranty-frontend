"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function WelcomeScreen() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setIsVisible(false);
        }, 1800);

        return () => window.clearTimeout(timeout);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 0.55,
                        ease: "easeInOut",
                    }}
                    className="
                        fixed inset-0 z-[10000]
                        flex items-center justify-center
                        bg-background/40
                        backdrop-blur-xl
                        backdrop-saturate-150
                        supports-[backdrop-filter]:bg-background/25
                    "
                >
                    <div className="text-center">
                        {/* Welcome Text */}
                        <motion.p
                            initial={{
                                opacity: 0,
                                y: 24,
                                filter: "blur(8px)",
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                filter: "blur(0px)",
                            }}
                            transition={{
                                duration: 0.6,
                                ease: "easeOut",
                            }}
                            className="text-lg font-medium tracking-wide text-muted-foreground sm:text-xl"
                        >
                            Hola! Welcome to eWarranty
                        </motion.p>

                        {/* Logo */}
                        <div className="mt-5 flex items-center justify-center select-none">
                            <motion.span
                                initial={{
                                    opacity: 0,
                                    rotate: -35,
                                    scale: 0.7,
                                    filter: "blur(10px)",
                                }}
                                animate={{
                                    opacity: 1,
                                    rotate: [-12, -6, -12],
                                    scale: [1, 1.03, 1],
                                    y: [0, -2, 0],
                                    filter: "blur(0px)",
                                }}
                                transition={{
                                    opacity: {
                                        duration: 0.5,
                                    },
                                    rotate: {
                                        duration: 2.8,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    },
                                    scale: {
                                        duration: 2.8,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    },
                                    y: {
                                        duration: 2.8,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    },
                                    filter: {
                                        duration: 0.5,
                                    },
                                }}
                                className="text-7xl font-black leading-none text-primary drop-shadow-[0_0_20px_rgba(34,197,94,0.35)]"
                            >
                                e
                            </motion.span>

                            <motion.span
                                initial={{
                                    opacity: 0,
                                    x: 20,
                                    filter: "blur(8px)",
                                }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    filter: "blur(0px)",
                                }}
                                transition={{
                                    delay: 0.2,
                                    duration: 0.65,
                                    ease: "easeOut",
                                }}
                                className="-ml-1 pb-1 text-3xl font-black tracking-tight"
                            >
                                WARRANTY
                            </motion.span>
                        </div>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{
                                delay: 0.35,
                                duration: 0.9,
                                ease: "easeInOut",
                            }}
                            className="mx-auto mt-5 h-0.5 max-w-48 rounded-full bg-primary/60"
                        />
                        <motion.div
                            className="mt-6 flex justify-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="h-2 w-2 rounded-full bg-primary"
                                    animate={{
                                        y: [0, -5, 0],
                                        opacity: [0.4, 1, 0.4],
                                    }}
                                    transition={{
                                        duration: 0.7,
                                        delay: i * 0.15,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}