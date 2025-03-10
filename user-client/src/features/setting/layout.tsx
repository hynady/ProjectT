import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SidebarNav } from "@/features/setting/components/SidebarNav.tsx";
import { useEffect, useState } from "react";
import { Button } from "@/commons/components/button.tsx";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/commons/components/separator.tsx";
import {
  NavigationSection,
  NavSection,
} from "./components/NavigationSection.tsx";

const sidebarNavItems = [
  { title: "Thông tin cá nhân", href: "/settings/account" },
  { title: "Thẻ thông tin", href: "/settings/profile" },
];

// Define sections for each route
const routeSections: Record<string, NavSection[]> = {
  "/settings/account": [
    { id: "personal-info", title: "Thông tin cá nhân" },
    { id: "password", title: "Thay đổi mật khẩu" },
    { id: "delete-account", title: "Xóa tài khoản" },
  ],
  "/settings/profile": [{ id: "profile-cards", title: "Thẻ thông tin" }],
};

export default function SettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentSections, setCurrentSections] = useState<NavSection[]>([]);

  useEffect(() => {
    // Kiểm tra nếu đang ở /settings, chuyển hướng đến /settings/account
    if (
      location.pathname === "/settings" ||
      location.pathname === "/settings/"
    ) {
      navigate("/settings/account", { replace: true });
    }

    // Set the sections based on the current route
    const sections = routeSections[location.pathname] || [];
    setCurrentSections(sections);
  }, [location, navigate]);

  return (
    <main className="mx-auto space-y-7 pb-16 max-w-screen-xl container px-4 py-20">
      <div className="container mx-auto px-4 space-y-4">
        <div>
          <Button
            onClick={() => navigate("/")}
            variant="link"
            className="px-0 py-0"
          >
            <ArrowLeft />
            <span>Quay về Trang chủ</span>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Cài đặt</h2>
          <p className="text-muted-foreground">
            Quản lý cài đặt tài khoản và thông tin cá nhân của bạn.
          </p>
        </div>
        <Separator />

        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 lg:max-w-2xl">
            <Outlet />
          </div>
          <aside className="hidden lg:block lg:w-1/5">
            <div className="sticky top-24">
              <NavigationSection sections={currentSections} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
