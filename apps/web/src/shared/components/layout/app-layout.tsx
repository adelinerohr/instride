import * as React from "react";

import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";

import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { MobileTabBar } from "./mobile-nav";
import { SettingsSidebar } from "./settings-sidebar";

interface AppLayoutProps {
  type: "admin" | "portal" | "settings";
  children: React.ReactNode;
  isAdmin: boolean;
}

export function AppLayout({ type, children, isAdmin }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider className="max-w-screen">
      {type === "settings" && !isMobile && <SettingsSidebar />}
      {type !== "settings" && !isMobile && <AppSidebar type={type} />}
      <SidebarInset className="flex max-h-dvh flex-col overflow-hidden">
        {type !== "settings" && <AppHeader type={type} />}
        <main
          className={cn(
            "flex flex-col flex-1 min-h-0",
            isMobile && "pb-mobile-nav"
          )}
        >
          {children}
        </main>
        {isMobile && <MobileTabBar type={isAdmin ? "admin" : "portal"} />}
      </SidebarInset>
    </SidebarProvider>
  );
}
