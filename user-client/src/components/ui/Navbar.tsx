import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, CreditCard, LogOut, Users } from "lucide-react";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

const Navbar = () => {
  const isLoggedIn = true;

  return (
    <Card className="fixed top-0 left-0 right-0 z-10 gap-4">
      <div className="container mx-auto px-4 sm:px-8 md:px-14">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <img
                src="/web-app-manifest-512x512.png"
                alt="Logo"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold hidden sm:inline">TackTicket</span>
            </a>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 sm:mx-8">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm kiếm sự kiện..." className="pl-8 w-full" />
            </div>
          </div>

          {/* Navigation Links (Hidden on small screens) */}
          <nav className="hidden md:flex items-center space-x-4">
            <Button variant="ghost">Sự kiện</Button>
            <Button variant="ghost">Lịch chiếu</Button>
            <Button variant="ghost">Khuyến mãi</Button>
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User className="mr-2" />
                      <span>Hồ sơ</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard className="mr-2" />
                      <span>Đơn hàng</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2" />
                      <span>Cài đặt</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Users className="mr-2" />
                      <span>Nhóm</span>
                    </DropdownMenuItem>
                    <ThemeSwitcher />
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost">Đăng nhập</Button>
                <Button>Đăng ký</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Navbar;
