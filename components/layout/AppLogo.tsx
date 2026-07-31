"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { ROUTES } from "@/constants/routes";

export default function AppLogo() {
    return (
        <Link
            href={ROUTES.MACHINES}
            aria-label="Go to Dashboard"
            className="mx-auto flex select-none items-center"
        >
            <motion.span
                animate={{
                    rotate: [-12, -6, -12],
                    y: [0, -2, 0],
                    scale: [1, 1.03, 1],
                }}
                transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                whileHover={{
                    rotate: -4,
                    scale: 1.08,
                    transition: {
                        duration: 0.25,
                    },
                }}
                className="text-6xl font-black leading-none text-primary"
            >
                e
            </motion.span>

            <span className="-ml-1 pb-1 text-xl font-black tracking-tight">
                WARRANTY
            </span>
        </Link>
    );
}