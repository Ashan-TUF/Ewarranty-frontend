"use client";

import Link from "next/link";
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
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>

          <SidebarGroupLabel>
            eWarranty
          </SidebarGroupLabel>

          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>

                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>

              </SidebarMenuItem>
            ))}
          </SidebarMenu>

        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}