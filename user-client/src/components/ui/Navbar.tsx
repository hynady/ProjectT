import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Command, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import {ModeToggle} from "@/components/ui/mode-toggle.tsx";

const Navbar = () => {
  // Giả sử có state để kiểm tra user đã đăng nhập chưa
  const isLoggedIn = true

  return (
    <Card className="fixed top-0 left-0 right-0 z-10 gap-4">
      <div className="container mx-auto px-14">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <img
                src="/web-app-manifest-512x512.png"
                alt="Logo"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold">TackTicket</span>
            </a>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
              <Input
                placeholder="Tìm kiếm sự kiện..."
                className="pl-8 w-full"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-4">
            <Button variant="ghost">Sự kiện</Button>
            <Button variant="ghost">Lịch chiếu</Button>
            <Button variant="ghost">Khuyến mãi</Button>
          </nav>



          {/* Auth Buttons / User Menu */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <Popover>
                <PopoverTrigger>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png"/>
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent align="end">
                  <Command>
                    <CommandList>
                      <CommandItem>Tài khoản của tôi</CommandItem>
                      {/*mode-toggle*/}
                      <ModeToggle />
                      <CommandItem>Hồ sơ</CommandItem>
                      <CommandItem>Đơn hàng</CommandItem>
                      <CommandItem>Cài đặt</CommandItem>
                      <CommandSeparator />
                      <CommandItem className="text-red-600">Đăng xuất</CommandItem>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
  )
}

export default Navbar
