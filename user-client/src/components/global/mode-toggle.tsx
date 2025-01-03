import {Monitor, Moon, Sun} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useTheme } from "@/components/global/theme-provider.tsx";
import {
  DropdownMenuTrigger,
  DropdownMenuPointerCursor,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui-custom/dropdown-menu-pointer-cursor.tsx";
import {useEffect, useState} from "react";

export function ModeToggle() {
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
        return <Sun className="" />;
      case "dark":
        return <Moon className="" />;
      case "system":
      default:
        return systemTheme === "dark" ? (
          <Moon className="" />
        ) : (
          <Sun className="" />
        );
    }
  };
  return (
    <DropdownMenuPointerCursor modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          {renderThemeIcon()}
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown Menu */}
      <DropdownMenuContent
        align="end"
        className="w-[160px] p-2 bg-white dark:bg-black rounded-md shadow-lg"
      >
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
      </DropdownMenuContent>
    </DropdownMenuPointerCursor>
  );
}
