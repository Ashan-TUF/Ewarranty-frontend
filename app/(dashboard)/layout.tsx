"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import AppFooter from "@/components/layout/AppFooter";
import { AppSidebar } from "@/components/layout/AppSidebar";
import PageTransition from "@/components/layout/PageTransition";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset className="flex h-svh flex-col overflow-hidden bg-background text-foreground transition-colors duration-300 ease-out">
                <div className="app-scroll-area flex-1 overflow-y-auto">
                    <PageTransition>
                        <div className="pb-20">
                            {children}
                        </div>
                    </PageTransition>
                </div>
                <AppFooter />
            </SidebarInset>
        </SidebarProvider>
    );
}
