import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  ArrowLeft,
  BarChart2
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from "@/commons/components/sidebar";
import EventTicketsMenu from "./tickets/EventTicketsMenu";

const navigationItems = [
  {
    name: "Tổng quan",
    href: "/organize",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Sự kiện",
    href: "/organize/events",
    icon: Calendar,
    exact: false,
  },
  {
    name: "Thống kê",
    href: "/organize/analytics",
    icon: BarChart2,
    exact: false,
  }
];

export function OrganizeAppSidebar({
  isSidebarOpen,
}: {
  isSidebarOpen: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href: string, exact: boolean): boolean => {
    return exact
      ? location.pathname === href
      : location.pathname.startsWith(href);
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="px-4 py-3 border-b">
        <div
          className={`flex items-center gap-2 animate-fade-right animate-duration-500 animate-ease-in-out ${
            !isSidebarOpen ? "hidden" : ""
          }`}
        >
          <Calendar className="h-5 w-5" />
          <h1 className="font-bold text-lg truncate">Organizer Dashboard</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="px-2 py-2">
          <SidebarGroupLabel className="px-2 pb-1 text-xs font-semibold text-muted-foreground">
            QUẢN LÝ
          </SidebarGroupLabel>
          <SidebarMenu>
            {navigationItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.href}>
                  <Link to={item.href} className="w-full">
                    <SidebarMenuButton isActive={active} tooltip={item.name}>
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>

        {isSidebarOpen && (
          <div className="px-2 py-2 mt-2">
            <SidebarGroupLabel className="px-2 pb-1 text-xs font-semibold text-muted-foreground">
              QUẢN LÝ VÉ
            </SidebarGroupLabel>
            
            {/* Ticket management collapsible menu */}
            <EventTicketsMenu parentPath="/organize/tickets" />
          </div>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenuButton
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Trở về trang chủ</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
