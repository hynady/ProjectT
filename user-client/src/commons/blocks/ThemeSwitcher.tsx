import { Moon, Sun, Monitor } from "lucide-react";
import { DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/commons/components/dropdown-menu-pointer-cursor.tsx";
import { useTheme } from "@/commons/blocks/theme-provider.tsx";
import { useState, useEffect } from "react";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const matchDark = window.matchMedia("(prefers-color-scheme: dark)");

    const updateSystemTheme = () => {
      setSystemTheme(matchDark.matches ? "dark" : "light");
    };

    updateSystemTheme();
    matchDark.addEventListener("change", updateSystemTheme);

    return () => matchDark.removeEventListener("change", updateSystemTheme);
  }, []);

  const renderThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4 mr-2" />;
      case "dark":
        return <Moon className="h-4 w-4 mr-2" />;
      case "system":
      default:
        return systemTheme === "dark" ? (
          <Moon className="h-4 w-4 mr-2" />
        ) : (
          <Sun className="h-4 w-4 mr-2" />
        );
    }
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        {renderThemeIcon()}
        <span>Đổi giao diện</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center space-x-2"
        >
          <Sun className="h-4 w-4" />
          <span>Sáng</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center space-x-2"
        >
          <Moon className="h-4 w-4" />
          <span>Tối</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center space-x-2"
        >
          <Monitor className="h-4 w-4" />
          <span>Hệ thống</span>
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};

export default ThemeSwitcher;
