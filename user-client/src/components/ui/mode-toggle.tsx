import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandItem, CommandList } from "@/components/ui/command"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
    const { setTheme } = useTheme()

    return (
      <Popover>
          <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
              </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[160px] p-2">
              <Command>
                  <CommandList >
                      <CommandItem className="cursor-pointer" onSelect={() => setTheme("light")}>Light</CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => setTheme("dark")}>Dark</CommandItem>
                      <CommandItem className="cursor-pointer" onSelect={() => setTheme("system")}>System</CommandItem>
                  </CommandList>
              </Command>
          </PopoverContent>
      </Popover>
    )
}
