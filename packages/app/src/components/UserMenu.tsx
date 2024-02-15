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
import { useAuthentication } from "./providers/Authentication";
import { useNavigate, A } from "solid-start";
import { cn } from "../lib/utils";

export default function UserMenu() {
  const authentication = useAuthentication();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <As
          component={Button}
          variant="ghost"
          size="icon"
          class={cn("w-max flex flex-row gap-3 h-9 p-1  rounded-full", {
            "pr-3": authentication.isAuthenticated,
          })}
        >
          <div class="bg-secondary rounded-full p-2">
            <User class="h-4 w-4" />
          </div>
          <Show
            when={authentication.isAuthenticated && authentication.user}
            fallback={<span class="sr-only">User menu</span>}
          >
            {(s) => <span class="">{s().username}</span>}
          </Show>
        </As>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-[100px]">
        <Show
          when={authentication.isAuthenticated && authentication.session() !== null}
          fallback={
            <>
              <DropdownMenuItem class="items-center gap-2" asChild>
                <As component={A} href="/auth/login">
                  Login
                  <LogIn class="h-4 w-4" />
                </As>
              </DropdownMenuItem>
              <DropdownMenuItem class="items-center gap-2" asChild>
                <As component={A} href="/auth/register">
                  Register
                </As>
              </DropdownMenuItem>
            </>
          }
        >
          <DropdownMenuItem class="items-center gap-2" asChild>
            <As component={A} href="/profile">
              <User class="h-4 w-4" />
              Profile
            </As>
          </DropdownMenuItem>
          <DropdownMenuItem asChild class="items-center gap-2">
            <As component={A} href="/settings">
              <Settings2 class="h-4 w-4" />
              Settings
            </As>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            class="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 dark:text-red-400 hover:text-white items-center gap-2"
            onSelect={() => {
              authentication.loggout();
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
