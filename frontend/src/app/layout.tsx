"use client"; // Wir machen das Layout client-side für die Sidebar-Logik

import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
        
        {isLoginPage ? (
          // Login Seite: Einfach nur der Inhalt (keine Sidebar)
          <main className="h-screen w-full flex items-center justify-center">
             {children}
             <Toaster />
          </main>
        ) : (
          // App Layout: Mit SidebarProvider
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              
              {/* HEADER: Trigger & Breadcrumbs */}
              <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="/">Miktool</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>
                          {pathname === "/" ? "Dashboard" : pathname.slice(1).charAt(0).toUpperCase() + pathname.slice(2)}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>

              {/* MAIN CONTENT */}
              <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                {children}
              </div>

            </SidebarInset>
            <Toaster />
          </SidebarProvider>
        )}
        
      </body>
    </html>
  );
}