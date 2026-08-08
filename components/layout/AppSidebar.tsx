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
    ClipboardCheck,
    ClipboardList,
    FileBarChart2,
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
import { ROUTES } from "@/constants/routes";
import AppLogo from "./AppLogo";

const items = [
    {
        title: "Dashboard",
        url: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
    },
    {
        title: "Machines",
        url: ROUTES.MACHINES,
        icon: Cpu,
    },
];

const installationItems = [
    {
        title: "Installation Summary",
        url: ROUTES.INSTALLATION_SUMMARY,
        icon: FileBarChart2,
    },
    {
        title: "Confirm Installations",
        url: ROUTES.CONFIRM_INSTALLATIONS,
        icon: ClipboardCheck,
    },
    {
        title: "Submit Installations",
        url: ROUTES.SUBMIT_INSTALLATIONS,
        icon: ClipboardList,
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const isInstallationsActive = pathname.startsWith(ROUTES.INSTALLATIONS);

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

                        <SidebarMenuItem>
                            <SidebarMenuButton
                                render={<Link href={ROUTES.INSTALLATION_SUMMARY} prefetch />}
                                isActive={isInstallationsActive}
                            >
                                <Wrench className="size-4" />
                                <span>Installations</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {isInstallationsActive && (
                            <SidebarMenuItem className="ml-4 border-l border-sidebar-border/70 pl-2">
                                <SidebarMenu>
                                    {installationItems.map((item) => (
                                        <SidebarMenuItem key={item.url}>
                                            <SidebarMenuButton
                                                render={<Link href={item.url} prefetch />}
                                                isActive={pathname.startsWith(item.url)}
                                                size="sm"
                                                className="gap-2 text-sidebar-foreground/80"
                                            >
                                                <item.icon className="size-3.5" />
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
