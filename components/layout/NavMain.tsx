"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigation } from "@/constants/navigation";

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export default function NavMain() {
    const pathname = usePathname();

    return (
        <SidebarMenu>
            {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                        isActive={pathname === item.href}
                        render={
                            <Link href={item.href} />
                        }
                    >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}