import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  ArrowLeft,
  ShieldCheck,
  Settings,
  MapPin,
  Tags,
  ChevronDown,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/commons/components/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroupLabel,
} from "@/commons/components/sidebar";

interface SubMenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navigationItems = [
  {
    name: "Bảng thông số chung",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Kiểm duyệt nội dung",
    href: "/admin/approval",
    icon: ShieldCheck,
    exact: false,
  },
  {
    name: "Quản lý người dùng",
    href: "/admin/users",
    icon: Users,
    exact: false,
  },
  {
    name: "Quản lý tham số",
    href: "/admin/parameters",
    icon: Settings,
    exact: false,
    subItems: [
      {
        name: "Tham số khu vực",
        href: "/admin/parameters/regions",
        icon: MapPin,
      },
      {
        name: "Tham số phân loại",
        href: "/admin/parameters/categories",
        icon: Tags,
      },
    ],
  },
];

export function AdminSidebar({
  isSidebarOpen,
}: {
  isSidebarOpen: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({});

  const isActive = (href: string, exact: boolean): boolean => {
    return exact
      ? location.pathname === href
      : location.pathname.startsWith(href);
  };

  const toggleSubMenu = (href: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };  const hasActiveSubItem = useCallback((subItems: SubMenuItem[]) => {
    return subItems.some((subItem) => location.pathname.startsWith(subItem.href));
  }, [location.pathname]);
  // Auto-expand menu if current route is a sub-item
  useEffect(() => {
    navigationItems.forEach(item => {
      if (item.subItems && hasActiveSubItem(item.subItems)) {
        setOpenSubMenus(prev => ({
          ...prev,
          [item.href]: true,
        }));
      }
    });
  }, [location.pathname, hasActiveSubItem]);

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
            QUẢN TRỊ
          </SidebarGroupLabel>          <SidebarMenu>
            {navigationItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isSubMenuOpen = openSubMenus[item.href];
              const hasActiveSubItems = hasSubItems && hasActiveSubItem(item.subItems);

              return (
                <SidebarMenuItem key={item.href}>
                  {hasSubItems ? (
                    <>
                      <SidebarMenuButton
                        isActive={active || hasActiveSubItems}
                        tooltip={item.name}
                        onClick={() => toggleSubMenu(item.href)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                        <ChevronDown
                          className={`ml-auto h-4 w-4 transition-transform ${
                            isSubMenuOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </SidebarMenuButton>
                      {isSubMenuOpen && (
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const subActive = location.pathname.startsWith(subItem.href);
                            
                            return (
                              <SidebarMenuSubItem key={subItem.href}>
                                <Link to={subItem.href} className="w-full">
                                  <SidebarMenuSubButton isActive={subActive}>
                                    <SubIcon className="h-4 w-4" />
                                    <span>{subItem.name}</span>
                                  </SidebarMenuSubButton>
                                </Link>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      )}
                    </>
                  ) : (
                    <Link to={item.href} className="w-full">
                      <SidebarMenuButton isActive={active} tooltip={item.name}>
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    </Link>
                  )}
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
