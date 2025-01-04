import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarNav } from "@/app/settingspage/components/SidebarNav.tsx";
import { useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator.tsx"

const sidebarNavItems = [
  { title: 'Account', href: '/settings/account' },
  { title: 'Profile', href: '/settings/profile' },
];

export default function SettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra nếu đang ở /settings, chuyển hướng đến /settings/profile
    if (location.pathname === '/settings' || location.pathname === '/settings/') {
      navigate('/settings/profile', { replace: true });
    }
  }, [location, navigate]);

  return (
    <main className="mx-auto space-y-7 pb-16 max-w-screen-xl container px-4 py-20">
      <div>
        <Button onClick={() => navigate('/')} variant="link" className="px-0 py-0">
          <ArrowLeft/>
          <span>Quay về Trang chủ</span>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Quản lý cài đặt tài khoản của bạn và thiết lập tùy chọn e-mail.
        </p>
      </div>
      <Separator/>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          <Outlet />
        </div>
        <aside className="hidden lg:inline">
          ????????????????
        </aside>
      </div>
    </main>
  );
}