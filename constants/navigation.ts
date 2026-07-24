import {
    Cpu,
    LayoutDashboard,
    Package,
    ShieldCheck,
    Users,
    Wrench,
} from "lucide-react";

import { ROUTES } from "./routes";
import { NavigationItem } from "@/types/navigation";

export const navigation: NavigationItem[] = [
    {
        title: "Dashboard",
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
    },
    {
        title: "Machines",
        href: ROUTES.MACHINES,
        icon: Cpu,
    },
    {
        title: "Machine Models",
        href: ROUTES.MACHINE_MODELS,
        icon: Package,
    },
    {
        title: "Warranties",
        href: ROUTES.WARRANTIES,
        icon: ShieldCheck,
    },
    {
        title: "Installations",
        href: ROUTES.INSTALLATIONS,
        icon: Wrench,
    },
    {
        title: "Customers",
        href: ROUTES.CUSTOMERS,
        icon: Users,
    },
];