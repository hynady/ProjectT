import {AlignJustify, ChevronDown, LogOut, Settings, Ticket, User, LayoutDashboard} from "lucide-react";
import {Button} from "@/commons/components/button.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/commons/components/avatar.tsx";
import {
  DropdownMenuPointerCursor,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/commons/components/dropdown-menu-pointer-cursor.tsx";
import ThemeSwitcher from "@/commons/blocks/ThemeSwitcher.tsx";
import {useNavigate} from "react-router-dom";
import {SearchBar} from "@/features/search/blocks/SearchBar.tsx";
import {cn} from "@/commons/lib/utils/utils";
import {useState, useEffect} from "react";
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
} from "@/commons/components/alert-dialog.tsx"
import {useAuth} from "@/features/auth/contexts.tsx";
import { useUser } from '@/features/auth/contexts/UserContext';
import { AdminMenuButton } from '@/features/admin/components/AdminMenuButton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/commons/components/dialog.tsx";

const Navbar = () => {
  const {isAuthenticated, logout} = useAuth();
  const {
    displayName, 
    avatarUrl, 
    showProfileCompletion, 
    dismissProfileCompletion, 
    refreshTrigger
  } = useUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  
  // This effect will run whenever user data is refreshed
  useEffect(() => {
    // The refresh trigger changing will cause this component to re-evaluate
    // with the latest user data
    console.log("Navbar: User data refreshed");
  }, [refreshTrigger]);

  const handleLogout = () => {
    logout();
  };
  
  // Show dialog when showProfileCompletion changes
  useEffect(() => {
    if (isAuthenticated && showProfileCompletion) {
      setShowProfileDialog(true);
    }
  }, [isAuthenticated, showProfileCompletion]);
  
  const handleGoToSettings = () => {
    navigate('/settings');
    setShowProfileDialog(false);
  };
  
  const handleDismiss = () => {
    dismissProfileCompletion(); // Always dismiss when clicking "Không nhắc lại"
    setShowProfileDialog(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 border shadow-lg bg-card">
      {/* Profile Completion Dialog */}
      <Dialog 
        open={showProfileDialog} 
        onOpenChange={setShowProfileDialog}
        // Fix the focus issue by setting these props
        modal={true}
      >
        <DialogContent 
          className="sm:max-w-[425px]"
          // Prevent auto focus on elements inside the dialog
          onOpenAutoFocus={(e) => e.preventDefault()}
          // Ensure the dialog doesn't trap focus
          onEscapeKeyDown={() => setShowProfileDialog(false)}
          // Add tabIndex to make the dialog focusable but not automatically focused
          tabIndex={-1}
        >
          <DialogHeader>
            <DialogTitle>Hoàn thiện hồ sơ</DialogTitle>
            <DialogDescription>
              Vui lòng cập nhật tên của bạn để hoàn thiện hồ sơ người dùng.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex sm:justify-between">
            <Button variant="outline" onClick={handleDismiss}>
              Không nhắc lại
            </Button>
            <DialogClose asChild>
              <Button variant="default" onClick={handleGoToSettings}>
                Đến trang cài đặt
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="container mx-auto max-w-screen-xl">
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
                  {isAuthenticated && (
                    <>
                      <DropdownMenuItem
                        className="text-sm"
                        onClick={() => navigate("my-ticket")}>
                        <Ticket className="h-4 w-4 mr-2"/>
                        <span>Vé của tôi</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-sm"
                        onClick={() => navigate("/organize")}>
                        <LayoutDashboard className="h-4 w-4 mr-2"/>
                        <span>Quản lý sự kiện</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenuPointerCursor>
          </div>

          {/* Navigation Links for Desktop */}
          <nav className="hidden lg:flex items-center gap-2">
            {isAuthenticated && (
              <>
                <Button
                  variant="default"
                  className="text-sm px-3 h-9"
                  onClick={() => navigate("my-ticket")}>
                  <Ticket className="w-4 h-4 mr-2"/>
                  Vé của tôi
                </Button>                <Button
                  variant="outline"
                  className="text-sm px-3 h-9"
                  onClick={() => navigate("/organize")}>
                  <LayoutDashboard className="w-4 h-4 mr-2"/>
                  Quản lý sự kiện
                </Button>
                <AdminMenuButton />
              </>
            )}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
            {isAuthenticated ? (
              <DropdownMenuPointerCursor modal={false}>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 md:h-9 md:w-9">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>
                      {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="text-sm">
                    {displayName || 'Tài khoản của tôi'}
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