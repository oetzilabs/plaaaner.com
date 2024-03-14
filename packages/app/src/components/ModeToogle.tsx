import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { As, useColorMode } from "@kobalte/core";
import { Laptop, Moon, Sun } from "lucide-solid";

const ModeToggle = () => {
  const { setColorMode } = useColorMode();
  // const setColorMode = (s: string) => {};

  return (
    <DropdownMenu placement="bottom-end" sameWidth>
      <DropdownMenuTrigger asChild>
        <As component={Button} variant="outline" size="lg" class="px-4 w-full flex flex-row items-center justify-start gap-2">
          <div class="w-max flex">
            <Sun class="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon class="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </div>
          <span class="">Toggle Theme</span>
        </As>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => setColorMode("light")}>
          <Sun class="mr-2 w-4 h-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setColorMode("dark")}>
          <Moon class="mr-2 w-4 h-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setColorMode("system")}>
          <Laptop class="mr-2 w-4 h-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModeToggle;
