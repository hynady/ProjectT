import {AlignJustify, ChevronDown, LogOut, Settings, Ticket, User} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {
  DropdownMenuPointerCursor,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui-custom/dropdown-menu-pointer-cursor.tsx";
import ThemeSwitcher from "@/components/global/ThemeSwitcher.tsx";
import {useNavigate} from "react-router-dom";
import {SearchBar} from "@/app/searchsystem/components/SearchBar.tsx";
import {cn} from "@/lib/utils.ts";
import {useState} from "react";
import {useAuth} from "@/app/authpage/contexts/AuthContext.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-10  border shadow-lg bg-card">
      <div className="container mx-auto">
        <div className="h-14 md:h-16 flex items-center justify-between gap-4 px-2 sm:px-4 md:px-8">
          {/* Logo */}
          <div className="flex items-center">
            <span onClick={() => navigate('/')} className="flex items-center space-x-2 cursor-pointer ">
              <Avatar className="cursor-pointer">
                <AvatarImage src="/web-app-manifest-512x512.png"/>
                <AvatarFallback>TK</AvatarFallback>
              </Avatar>
              <span className="text-lg md:text-xl font-bold hidden sm:inline">
                TackTicket
              </span>
            </span>
          </div>

          {/* SearchBar */}
          <div className="flex-1 max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[800px]">
            <SearchBar/>
          </div>

          {/* Navigation Menu for Mobile & Tablet */}
          <div className="lg:hidden flex-shrink-0">
            <DropdownMenuPointerCursor modal={false}>
              <DropdownMenuTrigger asChild>
                <div className="relative">
                  <div
                    className="relative"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <div className={cn(
                      "transition-all duration-300 ease-in-out",
                      "absolute inset-0",
                      isOpen ? "opacity-0 rotate-180" : "opacity-100 rotate-0"
                    )}>
                      <AlignJustify size={30} className="cursor-pointer"/>
                    </div>
                    <div className={cn(
                      "transition-all duration-300 ease-in-out",
                      isOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-180"
                    )}>
                      <ChevronDown size={30} className="cursor-pointer"/>
                    </div>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="text-sm">Menu</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                  <DropdownMenuItem className="text-sm">
                    <span>Sự kiện</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm">
                    <span>Lịch chiếu</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm">
                    <span>Khuyến mãi</span>
                  </DropdownMenuItem>
                  {isAuthenticated && (
                    <DropdownMenuItem className="text-sm">
                      <Ticket className="h-4 w-4 mr-2"/>
                      <span>Vé của tôi</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenuPointerCursor>
          </div>

          {/* Navigation Links for Desktop */}
          <nav className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" className="text-sm px-3 h-9">
              Sự kiện
            </Button>
            <Button variant="ghost" className="text-sm px-3 h-9">
              Lịch chiếu
            </Button>
            <Button variant="ghost" className="text-sm px-3 h-9">
              Khuyến mãi
            </Button>
            {isAuthenticated && (
              <Button variant="default" className="text-sm px-3 h-9">
                <Ticket className="w-4 h-4 mr-2"/>
                Vé của tôi
              </Button>
            )}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
            {isAuthenticated ? (
              <DropdownMenuPointerCursor modal={false}>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 md:h-9 md:w-9">
                    <AvatarImage src="https://github.com/shadcn.png"/>
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="text-sm">
                    Tài khoản của tôi
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator/>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => navigate("/settings/account")}
                      className="text-sm"
                    >
                      <User className="h-4 w-4 mr-2"/>
                      <span>Hồ sơ</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/settings")}
                      className="text-sm"
                    >
                      <Settings className="h-4 w-4 mr-2"/>
                      <span>Cài đặt</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator/>
                  <DropdownMenuGroup>
                    <ThemeSwitcher/>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator/>
                  <DropdownMenuItem
                    className="text-sm"
                    onSelect={(e) => {
                      // Ngăn việc đóng dropdown menu
                      e.preventDefault();
                    }}
                  >
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <div className="flex items-center w-full">
                          <LogOut className="h-4 w-4 mr-2"/>
                          <span>Đăng xuất</span>
                        </div>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout}>
                            Đăng xuất
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPointerCursor>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="text-sm px-3 h-8 md:h-9"
                  onClick={() => navigate("/login")}
                >
                  Đăng nhập
                </Button>
                <Button
                  className="text-sm px-3 h-8 md:h-9"
                  onClick={() => navigate("/register")}
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;