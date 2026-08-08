import {
    Cpu,
    LayoutDashboard,
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
        title: "Installations",
        href: ROUTES.INSTALLATIONS,
        icon: Wrench,
    }
];