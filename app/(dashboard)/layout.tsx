import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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

            <SidebarInset className="bg-background text-foreground transition-colors duration-300 ease-out">
                <PageTransition>
                    {children}
                </PageTransition>
            </SidebarInset>
        </SidebarProvider>
    );
}