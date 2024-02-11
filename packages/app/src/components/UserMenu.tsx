import { LogIn, LogOut, Settings2, User } from "lucide-solid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { As } from "@kobalte/core";
import { Button } from "./ui/button";
import { createQuery } from "@tanstack/solid-query";
import { Show } from "solid-js";
import { Queries } from "../utils/api/queries";

export default function UserMenu() {
  const session = createQuery(() => ({
    queryKey: ["session"],
    queryFn: async () => {
      return Queries.Sessions.get();
    },
  }));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <As component={Button} variant="ghost" size="icon" class="w-max flex flex-row gap-3 h-9 pl-1 pr-3 rounded-full">
          <div class="bg-secondary rounded-full p-2">
            <User class="h-4 w-4" />
          </div>
          <Show when={session.isSuccess && session.data} fallback={<span class="sr-only">User menu</span>}>
            {(s) => <span class="">{s().username}</span>}
          </Show>
        </As>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-[100px]">
        <Show
          when={session.isSuccess && session.data}
          fallback={
            <>
              <DropdownMenuItem onSelect={() => console.log("Login")} class="items-center gap-2">
                Login
                <LogIn class="h-4 w-4" />
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log("Register")} class="items-center gap-2">
                Register
              </DropdownMenuItem>
            </>
          }
        >
          <DropdownMenuItem onSelect={() => console.log("Profile")} class="items-center gap-2">
            <User class="h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => console.log("Settings")} class="items-center gap-2">
            <Settings2 class="h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            class="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 dark:text-red-400 hover:text-white items-center gap-2"
            onSelect={() => {
              document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }}
          >
            <LogOut class="h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </Show>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
