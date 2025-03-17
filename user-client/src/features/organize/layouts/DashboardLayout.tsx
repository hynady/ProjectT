import { ReactNode, useState } from "react";
import { cn } from "@/commons/lib/utils/utils";
import { Separator } from "@/commons/components/separator";
import { TooltipProvider } from "@/commons/components/tooltip";
import { OrganizeAppSidebar } from "../components/OrganizeAppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/commons/components/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export const DashboardLayout = ({
  children,
  className,
}: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <TooltipProvider>
      <SidebarProvider
        defaultOpen={true}
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      >
        <OrganizeAppSidebar isSidebarOpen={isSidebarOpen} />
        <SidebarRail />

        <SidebarInset className="bg-background flex flex-col w-[calc(100%-var(--sidebar-width))] ml-auto">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sticky top-0 z-10 bg-background">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <h1 className="text-sm font-semibold">Occa Dashboard</h1>
            </div>
          </header>

          <div
            className={cn(
              "flex-1 p-4 sm:p-6 w-full overflow-hidden",
              className
            )}
          >
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};
