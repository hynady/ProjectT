import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  ArrowLeft,
  ShieldCheck,
  LineChart,
  Inbox,
} from "lucide-react";
import { Button } from "@/commons/components/button";
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

const navigationItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Content Approval",
    href: "/admin/approval",
    icon: ShieldCheck,
    exact: false,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    exact: false,
  },
  {
    name: "Events",
    href: "/admin/events",
    icon: Calendar,
    exact: false,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: LineChart,
    exact: false,
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: Inbox,
    exact: false,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    exact: false,
  },
];

export function AdminSidebar({
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
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="font-bold text-lg truncate">Admin Panel</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="px-2 py-2">
          <SidebarGroupLabel className="px-2 pb-1 text-xs font-semibold text-muted-foreground">
            ADMIN MANAGEMENT
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
      </SidebarContent>

      <SidebarFooter>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
