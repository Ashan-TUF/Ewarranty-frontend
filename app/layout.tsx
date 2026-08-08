import type { Metadata } from "next";
import "./globals.css";

import { IBM_Plex_Mono, Manrope, Plus_Jakarta_Sans } from "next/font/google";

import QueryProvider from "@/providers/QueryProvider";
import ThemeProvider from "@/providers/ThemeProvider";

import SmoothScroll from "@/components/layout/SmoothScroll";
import WelcomeScreen from "@/components/layout/WelcomeScreen";
import { Toaster } from "@/components/ui/sonner";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-code",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "eWarranty",
  description: "Warranty Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${plusJakartaSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="antialiased transition-colors duration-300 ease-out">
        <ThemeProvider>
          <QueryProvider>
            <SmoothScroll />
            <WelcomeScreen />
            {children}
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}