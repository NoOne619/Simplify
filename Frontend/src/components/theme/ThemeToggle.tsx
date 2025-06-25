
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Switch
              checked={theme === "dark"}
              onCheckedChange={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle dark mode"
            />
            <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle {theme === "light" ? "dark" : "light"} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
