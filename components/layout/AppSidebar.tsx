"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Cpu,
    Package,
    ShieldCheck,
    Wrench,
    Users,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import AppLogo from "./AppLogo";

const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Machines",
        url: "/machines",
        icon: Cpu,
    },
    {
        title: "Machine Models",
        url: "/machine-models",
        icon: Package,
    },
    {
        title: "Warranties",
        url: "/warranties",
        icon: ShieldCheck,
    },
    {
        title: "Installations",
        url: "/installations",
        icon: Wrench,
    },
    {
        title: "Customers",
        url: "/customers",
        icon: Users,
    },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup className="flex flex-col gap-8">
                    <SidebarGroupLabel className="flex justify-center pt-4">
                        <AppLogo />
                    </SidebarGroupLabel>

                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.url}>
                                <SidebarMenuButton
                                    render={<Link href={item.url} prefetch />}
                                    isActive={pathname.startsWith(item.url)}
                                >
                                    <item.icon className="size-4" />
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}