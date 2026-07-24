"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
    children: React.ReactNode;
}

export default function PageTransition({
    children,
}: PageTransitionProps) {
    const pathname = usePathname();

    return (
        <motion.main
            key={pathname}
            initial={{
                opacity: 0,
                y: 28,
                scale: 0.97,
                filter: "blur(10px)",
            }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
            }}
            transition={{
                type: "spring",
                stiffness: 90,
                damping: 20,
                mass: 0.9,
            }}
            style={{
                willChange: "transform, opacity, filter",
            }}
            className="min-h-full"
        >
            {children}
        </motion.main>
    );
}